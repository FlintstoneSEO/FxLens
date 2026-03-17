export type OpenAIConfig = {
  apiKey: string;
  apiUrl: string;
  model: string;
};

export function getOpenAIConfig(): OpenAIConfig {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return {
    apiKey,
    apiUrl: process.env.OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions",
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  };
}
