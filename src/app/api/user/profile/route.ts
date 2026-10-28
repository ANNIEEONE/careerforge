import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      title: true,
      avatarUrl: true,
      plan: true,
      role: true,
      aiCreditsUsed: true,
      aiCreditsLimit: true,
      onboardingCompleted: true,
      geminiApiKey: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...user,
      geminiApiKeyMasked: user.geminiApiKey ? `${user.geminiApiKey.substring(0, 6)}...${user.geminiApiKey.slice(-4)}` : null,
      hasCustomKey: Boolean(user.geminiApiKey),
    },
  });
}

export async function PUT(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
  if (body.onboardingCompleted !== undefined) updateData.onboardingCompleted = Boolean(body.onboardingCompleted);

  // If user provides a custom Gemini API key (or leaves empty to clear)
  if (body.geminiApiKey !== undefined) {
    updateData.geminiApiKey = body.geminiApiKey.trim() || null;
  }

  const updated = await prisma.user.update({
    where: { id: sessionUser.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      title: true,
      avatarUrl: true,
      plan: true,
      aiCreditsUsed: true,
      aiCreditsLimit: true,
      geminiApiKey: true,
      onboardingCompleted: true,
    },
  });

  return NextResponse.json({
    user: {
      ...updated,
      hasCustomKey: Boolean(updated.geminiApiKey),
    },
  });
}
