export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `https://listifyshop.com/success`,
      cancel_url: `https://listifyshop.com`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
