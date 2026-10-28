import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { id, userId: user.id },
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const isPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : !portfolio.isPublished;

  const updated = await prisma.portfolio.update({
    where: { id },
    data: { isPublished },
  });

  return NextResponse.json({ isPublished: updated.isPublished, slug: updated.slug });
}
