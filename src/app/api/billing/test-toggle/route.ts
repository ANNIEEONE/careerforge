import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetPlan = body.plan === "PRO" ? "PRO" : body.plan === "FREE" ? "FREE" : sessionUser.plan === "FREE" ? "PRO" : "FREE";

  const updatedUser = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      plan: targetPlan,
      aiCreditsLimit: targetPlan === "PRO" ? 999999 : 15,
      subscription: {
        upsert: {
          create: {
            plan: targetPlan,
            status: "active",
          },
          update: {
            plan: targetPlan,
            status: "active",
          },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      aiCreditsUsed: true,
      aiCreditsLimit: true,
    },
  });

  return NextResponse.json({
    success: true,
    plan: updatedUser.plan,
    message: `Account tier successfully updated to ${updatedUser.plan}.`,
  });
}
