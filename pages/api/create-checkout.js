import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Not signed in" });

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1TZZr4FR8sDiIW9dfrxnCwrQ",
          quantity: 1,
        },
      ],
      success_url: `https://listifyshop.com/success`,
      cancel_url: `https://listifyshop.com`,
      client_reference_id: userId,
      metadata: { userId },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
