import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const key = env.match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim();
const model = env.match(/OPENAI_MODEL=(.+)/)?.[1]?.trim();

const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: 'Return JSON {"allow":true}' },
      { role: "user", content: "A gentle dissociative floating sensation" },
    ],
  }),
});

console.log(response.status, (await response.text()).slice(0, 300));
