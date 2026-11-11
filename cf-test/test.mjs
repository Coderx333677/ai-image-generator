import fs from "node:fs";

const { CF_ACCOUNT_ID, CF_API_TOKEN } = process.env;
const model = "@cf/black-forest-labs/flux-1-schnell";

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "a lone hiker on a mountain at sunset, cinematic",
      steps: 4,
    }),
  }
);

const data = await res.json();
if (!data.success) {
  console.error("Failed:", JSON.stringify(data, null, 2));
  process.exit(1);
}

fs.writeFileSync("out.jpg", Buffer.from(data.result.image, "base64"));
console.log("Saved out.jpg");