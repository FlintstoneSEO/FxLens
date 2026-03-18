import type { ZodType } from "zod";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const OPENAI_API_URL = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

function getApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return apiKey;
}

function extractJsonContent(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI response did not include JSON content.");
  }

  return content;
}

export async function requestStructuredJson<T>(
  systemPrompt: string,
  userPrompt: string,
  responseSchema: ZodType<T>
): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
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
    throw new Error("OpenAI returned JSON that does not match the expected response contract.");
  }

  return parsed.data;
}
