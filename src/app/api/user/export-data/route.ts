import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userData = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      resumes: {
        include: {
          versions: true,
          tailorings: true,
        },
      },
      portfolios: true,
      coverLetters: true,
      subscription: true,
    },
  });

  if (!userData) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Remove sensitive internal password hash from export
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, resetToken, resetTokenExpiry, ...safeData } = userData;

  const exportJson = JSON.stringify(safeData, null, 2);
  const filename = `careerforge_export_${sessionUser.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;

  return new Response(exportJson, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
