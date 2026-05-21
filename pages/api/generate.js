import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { productName, materials, style, keywords, targetBuyer } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are an expert Etsy SEO copywriter. Generate 3 different product descriptions for an Etsy listing.

Product Name: ${productName}
Materials: ${materials || "not specified"}
Style: ${style || "not specified"}
Keywords to include: ${keywords || "none specified"}
Target buyer: ${targetBuyer || "general"}

For each description:
- Write 150-200 words
- Start with a compelling hook
- Naturally weave in SEO keywords
- Include materials, size hints, and use cases
- End with a warm, personal touch typical of Etsy sellers
- Make each one feel distinct in tone (one more poetic, one more practical, one more story-driven)

Format your response EXACTLY like this, with no extra text:

DESCRIPTION 1:
[description here]

DESCRIPTION 2:
[description here]

DESCRIPTION 3:
[description here]`,
        },
      ],
    });

    const text = message.content[0].text;
    const parts = text.split(/DESCRIPTION \d:/);
    const descriptions = parts
      .slice(1)
      .map((d) => d.trim())
      .filter(Boolean);

    return res.status(200).json({ descriptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate descriptions" });
  }
}
