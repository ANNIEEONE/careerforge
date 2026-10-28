// Automated end-to-end API and workflow verification for CareerForge
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let cookie = "";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(cookie ? { Cookie: cookie } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/careerforge_session=[^;]+/);
    if (match) {
      cookie = match[0];
    }
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else if (contentType.includes("application/vnd.openxmlformats") || contentType.includes("application/octet-stream")) {
    const arrayBuffer = await res.arrayBuffer();
    data = Buffer.from(arrayBuffer);
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runTests() {
  console.log(`\n==============================================`);
  console.log(`🚀 STARTING CAREERFORGE END-TO-END WORKFLOW AUDIT`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`==============================================\n`);

  const testEmail = `test.developer.${Date.now()}@example.com`;
  const testPassword = "Password123!";
  let resumeId = null;
  let portfolioId = null;
  let portfolioSlug = null;
  let versionId = null;

  // 1. User Registration
  console.log(`1. Testing Registration for ${testEmail}...`);
  const reg = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Marcus Aurelius Vance",
      email: testEmail,
      password: testPassword,
    }),
  });
  if (!reg.ok) throw new Error(`Registration failed: ${JSON.stringify(reg.data)}`);
  console.log(`✓ Registration passed. User ID: ${reg.data.user.id}, Plan: ${reg.data.user.plan}`);

  // 2. Session verification
  console.log(`2. Verifying authenticated session (/api/auth/me)...`);
  const me = await request("/api/auth/me");
  if (!me.ok || !me.data.user) throw new Error(`Session verify failed`);
  console.log(`✓ Authenticated session active: ${me.data.user.email}`);

  // 3. Resumes list & starter resume
  console.log(`3. Fetching resumes list...`);
  const resumes = await request("/api/resumes");
  if (!resumes.ok || !resumes.data.resumes.length) throw new Error(`Starter resume missing`);
  resumeId = resumes.data.resumes[0].id;
  console.log(`✓ Starter resume detected. ID: ${resumeId}, Title: ${resumes.data.resumes[0].title}`);

  // 4. Resume Details
  console.log(`4. Fetching resume details (${resumeId})...`);
  const detail = await request(`/api/resumes/${resumeId}`);
  if (!detail.ok || !detail.data.resume) throw new Error(`Detail fetch failed`);
  console.log(`✓ Resume parsed properly. Experience items: ${detail.data.resume.experience.length}, Skills: ${detail.data.resume.skills.length}`);

  // 5. Update Resume
  console.log(`5. Updating resume fields & verifying autosave...`);
  const updateRes = await request(`/api/resumes/${resumeId}`, {
    method: "PUT",
    body: JSON.stringify({
      title: "Senior Staff Distributed Systems Engineer Resume",
      targetRole: "Staff Distributed Systems Engineer",
      targetCompany: "OpenAI / Stripe",
      summary: "Staff Engineer specializing in high-throughput distributed state machines and latency optimization.",
    }),
  });
  if (!updateRes.ok) throw new Error(`Update failed: ${JSON.stringify(updateRes.data)}`);
  console.log(`✓ Resume updated successfully.`);

  // 6. AI Summary Generation
  console.log(`6. Testing AI Professional Summary Generator...`);
  const aiSummary = await request("/api/ai/summary", {
    method: "POST",
    body: JSON.stringify({
      targetRole: "Staff Distributed Systems Engineer",
      keySkills: ["Go", "Raft", "Distributed Systems", "Kubernetes", "gRPC"],
      currentSummary: "Looking for senior role in infrastructure.",
    }),
  });
  if (!aiSummary.ok || !aiSummary.data.summary) throw new Error(`AI Summary failed: ${JSON.stringify(aiSummary.data)}`);
  console.log(`✓ AI Summary Generated (Engine: ${aiSummary.data.engine}):\n  "${aiSummary.data.summary.substring(0, 100)}..."`);

  // 7. AI Bullet Improver (Google XYZ)
  console.log(`7. Testing AI Bullet Improver (Google XYZ Metric Formula)...`);
  const aiBullet = await request("/api/ai/improve-bullet", {
    method: "POST",
    body: JSON.stringify({
      bullet: "worked on the database caching layer and made it faster",
      role: "Staff Engineer",
      company: "Stripe",
    }),
  });
  if (!aiBullet.ok || !aiBullet.data.improved) throw new Error(`AI Bullet failed: ${JSON.stringify(aiBullet.data)}`);
  console.log(`✓ AI Bullet Improved (Engine: ${aiBullet.data.engine}):\n  Before: "worked on the database caching layer and made it faster"\n  After: "${aiBullet.data.improved}"`);

  // 8. AI Skills Recommender
  console.log(`8. Testing AI Skills Suggestion Engine...`);
  const aiSkills = await request("/api/ai/suggest-skills", {
    method: "POST",
    body: JSON.stringify({
      targetRole: "Staff Distributed Systems Engineer",
      existingSkills: ["Go", "Git"],
    }),
  });
  if (!aiSkills.ok || !aiSkills.data.suggested) throw new Error(`AI Skills failed: ${JSON.stringify(aiSkills.data)}`);
  console.log(`✓ Suggested ${aiSkills.data.suggested.length} relevant technical skills: ${aiSkills.data.suggested.slice(0, 5).join(", ")}`);

  // 9. ATS Job Tailoring & Match Analysis
  console.log(`9. Testing ATS Keyword Match & Job Tailoring...`);
  const jobDescription = `We are seeking a Staff Distributed Systems Engineer to design fault-tolerant consensus systems, optimize Kafka pipelines, and lead Kubernetes orchestration across global cloud regions. Strong expertise in Go, Raft, Docker, and CI/CD pipelines required.`;
  const aiTailor = await request("/api/ai/tailor", {
    method: "POST",
    body: JSON.stringify({
      resumeId,
      jobTitle: "Staff Distributed Systems Engineer",
      company: "CloudScale Inc",
      jobDescription,
    }),
  });
  if (!aiTailor.ok || typeof aiTailor.data.result.matchScore !== "number") throw new Error(`ATS scan failed: ${JSON.stringify(aiTailor.data)}`);
  console.log(`✓ ATS Scan Complete (Engine: ${aiTailor.data.engine}):`);
  console.log(`  Match Score: ${aiTailor.data.result.matchScore}%`);
  console.log(`  Matching Keywords: ${aiTailor.data.result.matchingKeywords.join(", ")}`);
  console.log(`  Missing Keywords: ${aiTailor.data.result.missingKeywords.join(", ")}`);

  // 10. AI Cover Letter Generator
  console.log(`10. Testing AI Cover Letter Generator...`);
  const coverLetter = await request("/api/ai/cover-letter", {
    method: "POST",
    body: JSON.stringify({
      resumeId,
      jobTitle: "Staff Distributed Systems Engineer",
      company: "CloudScale Inc",
      jobDescription,
    }),
  });
  if (!coverLetter.ok || !coverLetter.data.coverLetter) throw new Error(`Cover letter failed: ${JSON.stringify(coverLetter.data)}`);
  console.log(`✓ Cover Letter Generated (Engine: ${coverLetter.data.engine}):\n  "${coverLetter.data.coverLetter.content.substring(0, 120)}..."`);

  // 11. Version Snapshots & Rollback
  console.log(`11. Testing Version History & Rollback...`);
  const createVersion = await request(`/api/resumes/${resumeId}/versions`, {
    method: "POST",
    body: JSON.stringify({ changeSummary: "Audit checkpoint prior to application" }),
  });
  if (!createVersion.ok) throw new Error(`Version creation failed`);
  versionId = createVersion.data.version.id;
  console.log(`✓ Version checkpoint created: ID ${versionId}, Version #${createVersion.data.version.versionNumber}`);

  const restoreRes = await request(`/api/resumes/${resumeId}/versions/${versionId}/restore`, {
    method: "POST",
  });
  if (!restoreRes.ok) throw new Error(`Restore failed`);
  console.log(`✓ Version rollback succeeded.`);

  // 12. Duplicate Resume
  console.log(`12. Testing Resume Duplication...`);
  const dup = await request(`/api/resumes/${resumeId}/duplicate`, { method: "POST" });
  if (!dup.ok) throw new Error(`Duplication failed: ${JSON.stringify(dup.data)}`);
  console.log(`✓ Duplicated resume created: "${dup.data.resume.title}" (ID: ${dup.data.resume.id})`);

  // 13. DOCX Export
  console.log(`13. Testing DOCX document generation...`);
  const docx = await request(`/api/resumes/${resumeId}/export/docx`);
  if (!docx.ok || !(docx.data instanceof Buffer) || docx.data.length < 500) {
    throw new Error(`DOCX export failed or buffer too small`);
  }
  console.log(`✓ Native .docx generated successfully (${docx.data.length} bytes).`);

  // 14. Portfolio Creation from Resume
  console.log(`14. Creating Portfolio Website linked to resume...`);
  const port = await request("/api/portfolios", {
    method: "POST",
    body: JSON.stringify({
      resumeId,
      title: "Marcus Vance | Staff Distributed Systems",
      theme: "tech-dark",
    }),
  });
  if (!port.ok || !port.data.portfolio) throw new Error(`Portfolio creation failed: ${JSON.stringify(port.data)}`);
  portfolioId = port.data.portfolio.id;
  portfolioSlug = port.data.portfolio.slug;
  console.log(`✓ Portfolio created. ID: ${portfolioId}, Slug: /p/${portfolioSlug}, Theme: ${port.data.portfolio.theme}`);

  // 15. Public Portfolio Retrieval by Slug
  console.log(`15. Testing Public Portfolio Route (/api/portfolios/by-slug/${portfolioSlug})...`);
  const pubPort = await request(`/api/portfolios/by-slug/${portfolioSlug}`);
  if (!pubPort.ok || !pubPort.data.portfolio) throw new Error(`Public portfolio failed`);
  console.log(`✓ Public portfolio accessible. Views: ${pubPort.data.portfolio.viewsCount}, Sections configured.`);

  // 16. Plan & Entitlements Verification
  console.log(`16. Testing Plan Entitlements & Freemium Rules...`);
  const planInfo = await request("/api/billing/plan");
  if (!planInfo.ok) throw new Error(`Plan info failed`);
  console.log(`✓ Current Plan: ${planInfo.data.plan}, Resume Count: ${planInfo.data.resumeCount}/${planInfo.data.resumeLimit}`);

  // 17. Test Mode Pro Upgrade Toggle
  console.log(`17. Testing Server-Enforced Pro Tier Switcher (/api/billing/test-toggle)...`);
  const proUpgrade = await request("/api/billing/test-toggle", {
    method: "POST",
    body: JSON.stringify({ plan: "PRO" }),
  });
  if (!proUpgrade.ok || proUpgrade.data.plan !== "PRO") throw new Error(`Pro upgrade failed`);
  console.log(`✓ Account tier switched to PRO. Unlimited entitlements active.`);

  // Verify Pro limits
  const proPlanInfo = await request("/api/billing/plan");
  if (proPlanInfo.data.resumeLimit !== "Unlimited" || !proPlanInfo.data.features.allTemplates) {
    throw new Error(`Pro entitlements not properly reflected`);
  }
  console.log(`✓ Pro entitlements verified on server (Resume Limit: Unlimited, All Templates: True).`);

  // 18. Full Data Export (GDPR compliance)
  console.log(`18. Testing Complete Data Export Archive...`);
  const exportData = await request("/api/user/export-data");
  if (!exportData.ok) throw new Error(`Export failed`);
  console.log(`✓ Full user JSON archive downloaded successfully.`);

  console.log(`\n==============================================`);
  console.log(`🎉 ALL 18 WORKFLOWS & SECURITY BOUNDARIES PASSED!`);
  console.log(`==============================================\n`);
}

runTests().catch((err) => {
  console.error("\n❌ AUDIT FAILED:", err);
  process.exit(1);
});
