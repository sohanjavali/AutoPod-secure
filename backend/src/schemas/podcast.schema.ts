import { z } from "zod";

// The frontend sends capitalized labels ("Conversational"), so match case-insensitively
export const StyleSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(["conversational", "educational", "entertaining", "professional"])
);

export const DurationSchema = z.union([z.literal(5), z.literal(10)]);

export const PromptSchema = z.string().trim().min(3).max(300);

export const ValidateBodySchema = z.strictObject({
  prompt: PromptSchema,
});

export const GenerateBodySchema = z.strictObject({
  prompt: PromptSchema,
  style: StyleSchema,
  duration: DurationSchema,
});

export type Style = z.infer<typeof StyleSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type GenerateBody = z.infer<typeof GenerateBodySchema>;
export type ValidateBody = z.infer<typeof ValidateBodySchema>;
