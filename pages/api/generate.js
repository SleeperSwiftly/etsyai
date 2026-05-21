export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { productName, materials, style, keywords, targetBuyer } = req.body;

  if (!productName) {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
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

Format your response EXACTLY like this:

DESCRIPTION 1:
[description here]

DESCRIPTION 2:
[description here]

DESCRIPTION 3:
[description here]`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const parts = text.split(/DESCRIPTION \d:/);
    const descriptions = parts.slice(1).map((d) => d.trim()).filter(Boolean);

    return res.status(200).json({ descriptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate descriptions" });
  }
}