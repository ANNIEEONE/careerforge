import puppeteer from "puppeteer-core";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";
import path from "node:path";
import fs from "node:fs";

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "careerforge-super-secret-jwt-key-production-ready-2025"
);

async function createToken(userId) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

async function main() {
  const screenshotsDir = path.resolve("public/screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const user = await prisma.user.findFirst({
    where: { email: "alex.rivera@example.com" },
    include: { resumes: true, portfolios: true },
  });

  if (!user) {
    console.error("User alex.rivera@example.com not found");
    return;
  }

  const token = await createToken(user.id);
  const resumeId = user.resumes[0]?.id;

  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,960"],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log("Capturing landing page...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(screenshotsDir, "landing.png") });

  // Set auth cookie
  await page.setCookie({
    name: "careerforge_session",
    value: token,
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  // 2. Dashboard
  console.log("Capturing dashboard...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(screenshotsDir, "dashboard.png") });

  // 3. Resume Editor with Swiss Sidebar
  if (resumeId) {
    console.log("Capturing editor with Swiss Sidebar...");
    await prisma.resume.update({
      where: { id: resumeId },
      data: { templateId: "swiss-sidebar" },
    });
    await page.goto(`http://localhost:3000/resumes/${resumeId}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, "editor_swiss_sidebar.png") });

    // 4. Resume Editor with Editorial Luxury
    console.log("Capturing editor with Editorial Luxury...");
    await prisma.resume.update({
      where: { id: resumeId },
      data: { templateId: "editorial-luxury" },
    });
    await page.goto(`http://localhost:3000/resumes/${resumeId}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, "editor_editorial_luxury.png") });
  }

  // 5. Portfolio
  const portfolioSlug = user.portfolios[0]?.slug || "alex-rivera";
  console.log(`Capturing portfolio for slug ${portfolioSlug}...`);
  await page.goto(`http://localhost:3000/p/${portfolioSlug}`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(screenshotsDir, "portfolio.png") });

  await browser.close();
  await prisma.$disconnect();
  console.log("All screenshots captured successfully in public/screenshots!");
}

main().catch(console.error);
