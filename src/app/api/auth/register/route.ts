import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import { getDefaultResumeData } from "@/lib/defaults";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        plan: "FREE",
        aiCreditsLimit: 15,
        aiCreditsUsed: 0,
      },
    });

    // Create starter resume for new user
    const starterResume = getDefaultResumeData(user.id, {
      fullName: user.name,
      email: user.email,
    });

    await prisma.resume.create({
      data: {
        userId: user.id,
        title: starterResume.title,
        targetRole: starterResume.targetRole,
        targetCompany: starterResume.targetCompany,
        summary: starterResume.summary,
        personalInfo: JSON.stringify(starterResume.personalInfo),
        experience: JSON.stringify(starterResume.experience),
        education: JSON.stringify(starterResume.education),
        skills: JSON.stringify(starterResume.skills),
        projects: JSON.stringify(starterResume.projects),
        certifications: JSON.stringify(starterResume.certifications),
        achievements: JSON.stringify(starterResume.achievements),
        languages: JSON.stringify(starterResume.languages),
        customSections: JSON.stringify(starterResume.customSections),
        sectionOrder: JSON.stringify(starterResume.sectionOrder),
        sectionVisibility: JSON.stringify(starterResume.sectionVisibility),
        templateId: starterResume.templateId,
        typography: JSON.stringify(starterResume.typography),
        layoutConfig: JSON.stringify(starterResume.layoutConfig),
        shareSlug: starterResume.shareSlug,
        lastAtsScore: starterResume.lastAtsScore,
      },
    });

    // Sign session token
    const token = await createSessionToken(user.id);
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        aiCreditsUsed: user.aiCreditsUsed,
        aiCreditsLimit: user.aiCreditsLimit,
        onboardingCompleted: user.onboardingCompleted,
      },
    });

    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
