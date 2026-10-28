import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check if live Stripe credentials are configured
  if (!stripeKey) {
    return NextResponse.json(
      {
        isTestMode: true,
        message:
          "Live Stripe API keys are not currently configured in the environment. You can instantly test Pro features using the 'Switch to Pro (Test Mode)' button below.",
      },
      { status: 200 }
    );
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-11-20.acacia" as unknown as undefined });

    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CareerForge Pro Subscription",
              description: "Unlimited AI tailoring, premium ATS templates, full portfolio publishing, and cover letters.",
            },
            unit_amount: 1900, // $19.00 / month
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: sessionUser.email,
      client_reference_id: sessionUser.id,
      success_url: `${appUrl}/settings?payment=success`,
      cancel_url: `${appUrl}/settings?payment=canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: unknown) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to initialize Stripe checkout session." },
      { status: 500 }
    );
  }
}
