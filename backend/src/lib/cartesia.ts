import { CartesiaClient } from "@cartesia/cartesia-js"
import { env } from "../config/env.ts";
import type { Voices } from "../utils/types.ts";

declare global {
  // Allow caching the client across module reloads
  var __cartesia_client__: CartesiaClient | undefined;
}

export const cartesiaClient =
  global.__cartesia_client__ ??
  (global.__cartesia_client__ = new CartesiaClient({ apiKey: env.CARTESIA_API_KEY }));

export const voices: Voices = {
  "Maya": {
    persona: "Easygoing Ally",
    id: "cbaf8084-f009-4838-a096-07ee2e6612b1"
  },
  "Kiefer":{
    persona: "Assured Tone",
    id: "228fca29-3a0a-435c-8728-5cb483251068"
  },
  "Brandon": {
    persona: "Confident Guy",
    id: "5cad89c9-d88a-4832-89fb-55f2f16d13d3"
  },
  "Joanie": {
    persona: "Vibrant Speaker",
    id: "a7b8d8fa-f6e5-4908-900e-0c11d1d82519"
  },
  "Judith": {
    persona: "Poised Strength",
    id: "4d3d2e9c-14e4-4802-a8d8-bd5268a73fde"
  },
  "Tanner": {
    persona: "Laidback Spirit",
    id: "373e661a-f0ef-4e34-a09e-183184a443e6"
  }
};