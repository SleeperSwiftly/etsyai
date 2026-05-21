import { clerkClient } from "@clerk/nextjs/server";
import { buffer } from "micro";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;

    if (userId) {
      try {
        await clerkClient.users.updateUser(userId, {
          publicMetadata: { isPro: true, stripeCustomerId: session.customer },
        });
      } catch (err) {
        console.error("Clerk update failed:", err);
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    try {
      const users = await clerkClient.users.getUserList();
      const user = users.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
      if (user) {
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: { isPro: false },
        });
      }
    } catch (err) {
      console.error("Clerk cancel update failed:", err);
    }
  }

  return res.status(200).json({ received: true });
}
