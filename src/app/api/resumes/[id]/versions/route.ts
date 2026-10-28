import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const versions = await prisma.resumeVersion.findMany({
    where: { resumeId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      versionNumber: true,
      changeSummary: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ versions });
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const lastVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId: id },
    orderBy: { versionNumber: "desc" },
  });

  const nextVersionNum = (lastVersion?.versionNumber || 0) + 1;

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: id,
      versionNumber: nextVersionNum,
      changeSummary: body.changeSummary || `Manual snapshot v${nextVersionNum}`,
      snapshot: JSON.stringify(resume),
    },
  });

  return NextResponse.json({ version }, { status: 201 });
}
