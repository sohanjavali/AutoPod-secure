import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { anthropicClient } from "../src/lib/anthropic.ts";
import { generateEpisode } from "../src/services/pipeline.service.ts";
import { GuardrailError } from "../src/guardrails/errors.ts";
import { CANARY_PHRASES } from "../src/guardrails/canaries.ts";
import { makeEpisode, makeResearch } from "./helpers.ts";

type Resp = { stop_reason: string; content: { type: string; text: string }[] } | Error;
const j = (o: unknown, stop_reason = "end_turn"): Resp => ({ stop_reason, content: [{ type: "text", text: JSON.stringify(o) }] });
const clean = () => j({ isInjection: false, confidence: 0.02, reason: "fine" });
const inj = (c = 0.95) => j({ isInjection: true, confidence: c, reason: "bad" });

const TOPIC = "Quantum badgers of the Pennine hills";
const input = { topic: TOPIC, style: "conversational" as const, duration: 5 as const };

function setup(q: { classifier: Resp[]; research?: Resp; script?: Resp }) {
  const classifier = [...q.classifier];
  const m = mock.method(anthropicClient.beta.messages, "create", (async (params: any) => {
    const sys = JSON.stringify(params.system);
    let r: Resp | undefined;
    if (params.model === "claude-haiku-4-5") r = classifier.shift();
    else if (sys.includes(CANARY_PHRASES[1])) r = q.script;
    else r = q.research;
    if (!r) throw new Error("unexpected call: not configured");
    if (r instanceof Error) throw r;
    return r;
  }) as any);
  const calls = () => m.mock.calls.map((c) => c.arguments[0] as any);
  const count = (pred: (p: any) => boolean) => calls().filter(pred).length;
  return {
    calls,
    classifierCalls: () => count((p) => p.model === "claude-haiku-4-5"),
    researchCalls: () => count((p) => p.model !== "claude-haiku-4-5" && !JSON.stringify(p.system).includes(CANARY_PHRASES[1])),
    scriptCalls: () => count((p) => JSON.stringify(p.system).includes(CANARY_PHRASES[1])),
  };
}
afterEach(() => mock.restoreAll());

const guard = (code: string, stage: string) => (e: unknown) =>
  e instanceof GuardrailError && e.code === code && e.stage === stage;

test("1. topic classified as injection (0.95): blocked, research never called", async () => {
  const s = setup({ classifier: [inj(0.95)] });
  await assert.rejects(generateEpisode(input), guard("INJECTION_DETECTED", "topic"));
  assert.equal(s.classifierCalls(), 1);
  assert.equal(s.researchCalls(), 0);
  assert.equal(s.scriptCalls(), 0);
});

test("1b. low-confidence injection verdict (0.5) is not blocked", async () => {
  const s = setup({ classifier: [inj(0.5), clean()], research: j(makeResearch()), script: j(makeEpisode(12)) });
  const ep = await generateEpisode(input);
  assert.equal(ep.script.length, 12);
  assert.equal(s.scriptCalls(), 1);
});

test("2. research flagged by second classifier call: blocked at research, script never called", async () => {
  const s = setup({ classifier: [clean(), inj(0.9)], research: j(makeResearch()) });
  await assert.rejects(generateEpisode(input), guard("INJECTION_DETECTED", "research"));
  assert.equal(s.classifierCalls(), 2);
  assert.equal(s.researchCalls(), 1);
  assert.equal(s.scriptCalls(), 0);
});

test("3. script with disallowed speaker: OUTPUT_REJECTED", async () => {
  const ep = makeEpisode(12); (ep.script[2] as any).speaker = "Mallory";
  const s = setup({ classifier: [clean(), clean()], research: j(makeResearch()), script: j(ep) });
  await assert.rejects(generateEpisode(input), guard("OUTPUT_REJECTED", "script"));
  assert.equal(s.scriptCalls(), 1);
});

test("4. script line echoing a canary: OUTPUT_REJECTED at pre_tts", async () => {
  const ep = makeEpisode(12); ep.script[5]!.text = `The secret is ${CANARY_PHRASES[1]}.`;
  const s = setup({ classifier: [clean(), clean()], research: j(makeResearch()), script: j(ep) });
  await assert.rejects(generateEpisode(input), guard("OUTPUT_REJECTED", "pre_tts"));
  assert.equal(s.scriptCalls(), 1);
});

test("5. happy path returns episode; models and system prompts checked", async () => {
  const s = setup({ classifier: [clean(), clean()], research: j(makeResearch()), script: j(makeEpisode(12)) });
  const ep = await generateEpisode(input);
  assert.equal(ep.script.length, 12);
  assert.equal(s.classifierCalls(), 2);
  assert.equal(s.researchCalls(), 1);
  assert.equal(s.scriptCalls(), 1);
  const calls = s.calls();
  assert.equal(calls.length, 4);
  const sonnetIds = new Set<string>();
  for (const c of calls) {
    assert.ok(!JSON.stringify(c.system).includes(TOPIC), "system must not contain the user topic");
    if (c.system && JSON.stringify(c.system).includes("security classifier")) assert.equal(c.model, "claude-haiku-4-5");
    if (c.model !== "claude-haiku-4-5") sonnetIds.add(c.model);
  }
  assert.equal(calls.filter((c) => c.model === "claude-haiku-4-5").length, 2);
  assert.equal(sonnetIds.size, 1, "research and script use one non-haiku model");
  assert.match([...sonnetIds][0]!, /^claude-sonnet/);
});

test("6. classifier throws on topic stage: fails closed", async () => {
  const s = setup({ classifier: [new Error("network down")] });
  await assert.rejects(generateEpisode(input), guard("INJECTION_DETECTED", "topic"));
  assert.equal(s.researchCalls(), 0);
  assert.equal(s.scriptCalls(), 0);
});

test("6b. classifier returns malformed JSON on topic: fails closed", async () => {
  const s = setup({ classifier: [{ stop_reason: "end_turn", content: [{ type: "text", text: "not json" }] }] });
  await assert.rejects(generateEpisode(input), guard("INJECTION_DETECTED", "topic"));
  assert.equal(s.researchCalls(), 0);
});

test("7. script stop_reason refusal: rejected", async () => {
  const s = setup({ classifier: [clean(), clean()], research: j(makeResearch()), script: j(makeEpisode(12), "refusal") });
  await assert.rejects(generateEpisode(input), guard("OUTPUT_REJECTED", "script"));
  assert.equal(s.scriptCalls(), 1);
});
