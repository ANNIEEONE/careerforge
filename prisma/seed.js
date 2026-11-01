const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CareerForge database...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "alex.rivera@example.com" },
    update: {},
    create: {
      id: "demo-user-1",
      email: "alex.rivera@example.com",
      name: "Alex Rivera",
      passwordHash,
      role: "USER",
      plan: "PRO",
      aiCreditsLimit: 100,
      aiCreditsUsed: 42,
      onboardingCompleted: true,
    },
  });

  const demoUser2 = await prisma.user.upsert({
    where: { email: "demo@careerforge.io" },
    update: {},
    create: {
      id: "demo-user-2",
      email: "demo@careerforge.io",
      name: "Demo Professional",
      passwordHash,
      role: "USER",
      plan: "PRO",
      aiCreditsLimit: 100,
      aiCreditsUsed: 5,
      onboardingCompleted: true,
    },
  });

  const existingResume = await prisma.resume.findFirst({
    where: { userId: user.id },
  });

  if (!existingResume) {
    const resume = await prisma.resume.create({
      data: {
        id: "demo-resume-1",
        userId: user.id,
        title: "Senior Staff Distributed Systems Engineer Resume",
        targetRole: "Senior Staff Distributed Systems Engineer",
        targetCompany: "Google / Stripe",
        summary:
          "Staff Distributed Systems & Infrastructure Engineer with 9+ years architecting high-throughput distributed architectures, sub-millisecond payment settlement engines, and global edge data mesh pipelines across AWS and GCP.",
        personalInfo: JSON.stringify({
          fullName: "Alex Rivera",
          jobTitle: "Senior Staff Distributed Systems Engineer",
          email: "alex.rivera@example.com",
          phone: "+1 (555) 382-9102",
          location: "San Francisco, CA (Open to Remote)",
          website: "https://alexrivera.dev",
          linkedin: "linkedin.com/in/alex-rivera-systems",
          github: "github.com/alexrivera-eng",
        }),
        experience: JSON.stringify([
          {
            id: "exp-1",
            company: "Stripe",
            role: "Senior Staff Software Engineer — Global Clearing",
            location: "San Francisco, CA",
            startDate: "2022-03",
            endDate: "Present",
            current: true,
            bullets: [
              "Architected multi-region transactional ledger processing $18B+ quarterly volume with sub-12ms p99 latency across 6 global zones.",
              "Designed idempotent zero-loss replay mechanisms on Apache Kafka and Rust, eliminating reconciliation discrepancies by 100%.",
              "Mentored 6 staff and senior engineers; led quarterly technical design reviews across 5 distributed payment infrastructure teams.",
            ],
          },
        ]),
        education: JSON.stringify([
          {
            id: "edu-1",
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science & Electrical Engineering",
            location: "Berkeley, CA",
            startDate: "2012",
            endDate: "2016",
          },
        ]),
        skills: JSON.stringify([
          {
            category: "Core Architecture",
            items: ["Distributed Systems", "High Availability", "Consensus Algorithms"],
          },
          { category: "Languages", items: ["Rust", "Go", "TypeScript", "Python"] },
        ]),
        projects: JSON.stringify([
          {
            id: "proj-1",
            title: "AegisKV — Distributed Raft-based Key-Value Store",
            description: "Built open-source consensus engine in Go.",
            bullets: ["Leader election with sub-50ms heartbeat timeouts."],
          },
        ]),
        certifications: JSON.stringify([
          {
            id: "cert-1",
            name: "AWS Certified Solutions Architect — Professional",
            issuer: "Amazon Web Services",
            issueDate: "2024",
          },
        ]),
        templateId: "swiss-sidebar",
        lastAtsScore: 94,
        isPublic: true,
        shareSlug: "alex-rivera-systems",
      },
    });

    await prisma.portfolio.create({
      data: {
        id: "demo-port-1",
        userId: user.id,
        resumeId: resume.id,
        slug: "alex-rivera",
        title: "Alex Rivera — Portfolio",
        tagline: "Staff Distributed Systems & Infrastructure Engineer",
        bio: "Building resilient distributed systems, real-time settlement rails, and high-throughput data streams.",
        theme: "tech-dark",
        accentColor: "#2563eb",
        sectionsConfig: JSON.stringify({
          showAbout: true,
          showExperience: true,
          showProjects: true,
          showSkills: true,
          showEducation: true,
          showContact: true,
        }),
        customLinks: JSON.stringify([
          { label: "GitHub", url: "https://github.com/alexrivera-eng", icon: "github" },
          { label: "LinkedIn", url: "https://linkedin.com/in/alex-rivera-systems", icon: "linkedin" },
        ]),
        isPublished: true,
        viewsCount: 142,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding warning:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
