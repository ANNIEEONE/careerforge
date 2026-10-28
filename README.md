# CareerForge — AI-Powered Resume & Portfolio Studio

CareerForge is a production-ready, full-stack SaaS web application designed to help software engineers, product managers, and modern professionals build ATS-optimized resumes, tailor them against real job postings using AI, export pixel-perfect PDFs and native `.docx` files, and deploy live personal portfolio websites with custom public URLs.

---

## 🌟 Key Features

### 1. AI Resume Studio & Live Preview
- **Split-Pane Editor**: Real-time side-by-side editing with instant live rendering on the canvas.
- **5 ATS-Proof Templates**:
  - `Modern Standard`: Balanced sans-serif layout with highest parser compatibility score.
  - `Minimalist Slate`: High-contrast editorial typography with zero clutter.
  - `Executive Serif`: Classical serif hierarchy with subtle double rules for leadership roles.
  - `Tech Matrix`: Dense, high-information layout with monospace badges and tool matrix.
  - `Creative Studio`: Bold headers and modern asymmetric card styling.
- **Formatting Customization**: A4 and US Letter page sizes, typography scale, 7 accent colors, and margin controls.
- **Autosave & Version Control**: Automatic checkpointing and manual snapshots with one-click rollback.
- **Multi-Format Export**: Clean, printable vector PDF and native downloadable Microsoft Word `.docx` documents.

### 2. AI Writing Assistant & Job Tailoring
- **Google Gemini Integration**: Connected to Google Gemini 2.5 Flash with fallback to a smart rule-based heuristic generation engine.
- **Executive Summary Generator**: Synthesizes 3-4 sentence value propositions from user background and target role.
- **Bullet Improver (Google XYZ Formula)**: Converts weak passive bullets into quantifiable accomplishment statements:
  > *"Accomplished [X], measured by [Y], by doing [Z]"*
- **ATS Match Scanner**:
  - Compares candidate resume against pasted job description.
  - Calculates realistic ATS match score (0-100%).
  - Identifies matched keywords and highlights missing critical keywords.
  - Provides actionable bullet recommendations.
- **Targeted Cover Letter Generator**: Synthesizes customized cover letters tailored directly to the target role and company.

### 3. Resume Upload & Heuristic Parsing
- Supports drag-and-drop upload of **PDF**, **DOCX**, and **TXT** files.
- Extracts candidate name, email, phone, location, LinkedIn, GitHub, summary, work history, education, skills, and projects.
- Shows content completeness score and extraction analysis before loading into the studio.

### 4. Personal Web Portfolio Builder
- Converts resume data into an interactive personal website with a single click.
- 4 distinct portfolio themes:
  - `Minimalist Slate`
  - `Tech Obsidian` (Dark mode)
  - `Editorial Serif`
  - `Creative Warmth`
- Section toggles (About, Experience, Projects, Skills, Education, Interactive Contact Form).
- Public URL routing (e.g., `/p/alex-rivera`) with view counter and responsive mobile/desktop viewports.
- One-click public visibility switch (Publish / Unpublish).

### 5. Freemium Monetization & Server-Enforced Entitlements
- **Free Starter Plan**: Up to 3 active resumes, standard templates, 15 AI actions/month, PDF/DOCX exports, 1 portfolio.
- **Pro Studio Plan ($19/mo)**: Unlimited resumes, all 5 premium templates, unlimited AI tailoring, cover letter generator, custom slug priority.
- **Stripe Integration & Evaluator Test Switcher**:
  - Production-ready Stripe Checkout session and webhook endpoints.
  - Built-in **Instant Test Switcher** in Settings & Billing to test Pro features without needing live credit card charges.
  - Server-enforced plan validation on all API endpoints.

### 6. Security, Privacy & Data Portability
- Secure session tokens via `jose` JWTs in HTTP-only cookies.
- Passwords hashed with `bcryptjs` (salt rounds: 12).
- Complete data export (GDPR-compliant JSON archive of all resumes, snapshots, portfolios, and tailoring history).
- Permanent account erasure and cascaded deletion.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS v4 with custom print stylesheets
- **Database & ORM**: SQLite + Prisma 6.4 (self-contained, zero-setup, portable; easily swappable to PostgreSQL/Supabase via `schema.prisma`)
- **Authentication**: JWT session tokens via `jose` and `bcryptjs`
- **Document Generation**: `docx` library for Microsoft Word export, browser printable vector canvas for PDF
- **Document Parsing**: `mammoth` (DOCX) and regex tokenizers
- **AI Models**: Google Gemini 2.5 Flash via REST API with intelligent heuristic fallback engine
- **Billing**: Stripe SDK + server-side verification webhooks

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- npm 9+

### 1. Clone & Navigate to Repository
```bash
cd careerforge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
# Database configuration (SQLite for zero-config portable runtime)
DATABASE_URL="file:./dev.db"

# Authentication secret
JWT_SECRET="careerforge-super-secret-jwt-key-production-ready-2025"

# Google Gemini API Key (Optional - Smart Heuristic Engine runs if blank)
GEMINI_API_KEY=""

# Stripe Payment Gateway (Optional - Built-in Test Switcher available)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database
Generate Prisma client and push database schema:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated End-to-End Workflow Testing

CareerForge includes a comprehensive test suite that validates all 18 primary workflows:
- User registration and cookie authentication
- Starter resume provisioning
- Real-time autosave
- AI summary, bullet improver, and skill suggestions
- ATS job description match scanner
- AI cover letter generation
- Version snapshot creation and rollback
- Resume duplication
- Native `.docx` export verification
- Portfolio generation and public `/p/[slug]` route verification
- Plan limit enforcement and Pro tier switching
- GDPR complete JSON data export

### Run the Audit Suite:
With the application running on port 3000:
```bash
node scripts/test-workflow.mjs
```

---

## 📁 Project Structure

```
careerforge/
├── prisma/
│   ├── dev.db                 # SQLite local database
│   └── schema.prisma          # Database schema (User, Resume, Version, Portfolio, etc.)
├── public/                    # Static assets
├── scripts/
│   └── test-workflow.mjs      # End-to-end API audit script
├── src/
│   ├── app/
│   │   ├── api/               # Server-side API endpoints
│   │   │   ├── ai/            # AI summary, bullets, skills, tailoring, cover letter
│   │   │   ├── auth/          # Register, login, logout, me, password reset
│   │   │   ├── billing/       # Plans, checkout, test toggle, stripe webhook
│   │   │   ├── portfolios/    # CRUD and public slug resolution
│   │   │   ├── resumes/       # CRUD, versions, duplication, docx export, upload
│   │   │   └── user/          # Profile, password, export, deletion
│   │   ├── auth/              # Sign in, register, forgot-password, reset-password
│   │   ├── dashboard/         # Project management dashboard
│   │   ├── onboarding/        # 3-step setup for new users
│   │   ├── p/[slug]/          # Public portfolio website route
│   │   ├── portfolios/        # Portfolio management and customizer studio
│   │   ├── resumes/[id]/      # Split-pane AI Resume Studio
│   │   ├── settings/          # Profile, API keys, billing, privacy
│   │   ├── globals.css        # Tailwind styles & print CSS
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Editorial landing page
│   ├── components/
│   │   ├── AtsScoreModal.tsx  # Job description ATS match scanner
│   │   ├── Icons.tsx          # SVG icons
│   │   ├── Navbar.tsx         # Global navigation bar & session state
│   │   ├── ResumePreview.tsx  # Live multi-template resume renderer
│   │   ├── UploadModal.tsx    # Drag-and-drop resume parser
│   │   └── VersionHistoryModal.tsx # Snapshot & rollback manager
│   └── lib/
│       ├── ai.ts              # Gemini API client & intelligent heuristic engine
│       ├── auth.ts            # Jose JWT & bcrypt authentication helpers
│       ├── defaults.ts        # Starter candidate data
│       ├── docx-export.ts     # Microsoft Word document generator
│       ├── parser.ts          # PDF/DOCX text extractor & heuristic parser
│       ├── prisma.ts          # Singleton Prisma client
│       ├── templates.ts       # Template configurations & palettes
│       └── types.ts           # TypeScript models & interfaces
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 🚢 Production Deployment

### Build the Application
```bash
npm run build
```

### Start in Production Mode
```bash
npm run start
```

### Deploying to Vercel / Railway / Render
1. Push repository to GitHub/GitLab.
2. For cloud serverless platforms (e.g. Vercel), swap `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma` and supply a Supabase or Neon PostgreSQL connection string in `DATABASE_URL`.
3. Set environment variables (`JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`).
4. Set build command to `prisma generate && prisma db push && next build`.

---

## 📄 License
MIT License. Built with pride for engineers and career builders.
