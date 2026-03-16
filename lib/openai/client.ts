import { z } from "zod";

import { getOpenAIConfig } from "@/lib/openai/config";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }> | null;
    };
  }>;
};

type OpenAIMessageContent = string | Array<{ type?: string; text?: string }> | null | undefined;

function extractStringContent(content: OpenAIMessageContent): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .filter((part) => part?.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }

  return "";
}

function extractJsonCandidate(rawContent: string): string {
  const trimmed = rawContent.trim();

  if (!trimmed) {
    throw new Error("OpenAI response did not include JSON content.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function extractJsonContent(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  const rawContent = extractStringContent(content);

  return extractJsonCandidate(rawContent);
}

export async function requestStructuredJson<T>(
  systemPrompt: string,
  userPrompt: string,
  responseSchema: z.ZodType<T>
): Promise<T> {
  const config = getOpenAIConfig();

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  const completion = (await response.json()) as ChatCompletionResponse;
  const rawJson = extractJsonContent(completion);

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  const parsed = responseSchema.safeParse(parsedJson);

  if (!parsed.success) {
    console.error("OpenAI schema validation failed.", {
      issues: parsed.error.issues.map((issue: { path: Array<string | number>; message: string }) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    throw new Error("OpenAI returned JSON that does not match the expected response contract.");
  }

  return parsed.data;
}
