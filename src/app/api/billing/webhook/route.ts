import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return NextResponse.json({ received: true, note: "Stripe not configured" });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" as unknown as undefined });
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: "PRO",
              aiCreditsLimit: 999999,
              subscription: {
                upsert: {
                  create: {
                    stripeCustomerId: session.customer as string,
                    stripeSubscriptionId: session.subscription as string,
                    plan: "PRO",
                    status: "active",
                  },
                  update: {
                    stripeCustomerId: session.customer as string,
                    stripeSubscriptionId: session.subscription as string,
                    plan: "PRO",
                    status: "active",
                  },
                },
              },
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subRecord = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (subRecord) {
          await prisma.user.update({
            where: { id: subRecord.userId },
            data: { plan: "FREE", aiCreditsLimit: 15 },
          });
          await prisma.subscription.update({
            where: { id: subRecord.id },
            data: { status: "canceled", plan: "FREE" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
