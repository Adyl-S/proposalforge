# ProposalForge — AI Enterprise Proposal Generator

**Status**: New Build
**Stack**: Next.js 14 (App Router) + TypeScript + Puppeteer (PDF) + Claude/OpenAI API
**Purpose**: Generate enterprise-grade project proposals from a prompt, requirements, and a knowledge base (CV, past projects, team bios, company profile)

---

## What is ProposalForge?

ProposalForge is a tool that generates **enterprise-level project proposals** — the kind that companies like Accenture, Deloitte, McKinsey, TCS, and Infosys send when pitching to large enterprise clients. 

The user provides:
1. **A project prompt** — e.g., "Build an AI-powered customer service chatbot for HDFC Bank"
2. **Requirements** — budget range, timeline, tech preferences, compliance needs
3. **Knowledge Base** — company profile, past projects/case studies, team CVs, certifications, assets (logos, etc.)

The tool uses AI to generate a **complete, professional 15-25 page PDF proposal** with:
- Beautiful typography and layout
- Data visualizations (charts, graphs, timelines)
- Structured sections matching enterprise consulting standards
- Client-tailored language and framing
- Auto-populated team bios and case studies from the knowledge base

---

## 3 Rules for Building

1. **Build the PDF template FIRST** — The PDF design is the hero. Start with a pixel-perfect HTML/CSS template that renders beautifully via Puppeteer. Then build the UI around it.
2. **AI generates CONTENT, not layout** — The layout/design is fixed (HTML/CSS template). AI fills in the content for each section based on the prompt + requirements + knowledge base.
3. **Knowledge Base is King** — The quality of the proposal depends on the knowledge base. Build a robust KB management system for company profile, past projects, team CVs, and assets.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack React, API routes, SSR |
| Language | TypeScript | Type safety throughout |
| Styling | Vanilla CSS + CSS Modules | Full control over PDF styling (no Tailwind — Puppeteer renders raw CSS better) |
| PDF Engine | Puppeteer (headless Chrome) | Pixel-perfect HTML-to-PDF, supports modern CSS (flexbox, grid, @page rules) |
| AI | Claude 3.5 Sonnet API (Anthropic) OR OpenAI GPT-4o | Content generation for each proposal section |
| Charts | Chart.js (via canvas) + custom SVG | Budget breakdown, timeline, org charts — rendered as images for PDF |
| Database | SQLite (via better-sqlite3) or JSON files | Lightweight — stores knowledge base, past proposals |
| File Storage | Local filesystem (`/data/`) | Uploaded logos, team photos, case study assets |
| Font | Inter (Google Fonts — self-hosted for PDF) | Clean, modern, enterprise typography |

---

## Project Structure

```
proposal-forge/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing / Dashboard
│   ├── globals.css                   # Global styles
│   ├── create/
│   │   └── page.tsx                  # Proposal creation wizard (multi-step form)
│   ├── proposals/
│   │   └── [id]/
│   │       └── page.tsx              # View/preview generated proposal
│   ├── knowledge-base/
│   │   └── page.tsx                  # Manage KB (company profile, team, projects)
│   └── api/
│       ├── generate/
│       │   └── route.ts              # POST — Generate proposal (AI + PDF)
│       ├── proposals/
│       │   └── route.ts              # GET/DELETE — List/manage proposals
│       ├── knowledge-base/
│       │   ├── company/
│       │   │   └── route.ts          # GET/PUT — Company profile CRUD
│       │   ├── projects/
│       │   │   └── route.ts          # GET/POST/DELETE — Past projects CRUD
│       │   ├── team/
│       │   │   └── route.ts          # GET/POST/DELETE — Team members CRUD
│       │   └── assets/
│       │       └── route.ts          # POST/DELETE — Upload logos, photos
│       └── preview/
│           └── route.ts              # GET — Preview proposal as HTML (for Puppeteer)
├── components/
│   ├── ui/                           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── FileUpload.tsx
│   │   ├── StepWizard.tsx            # Multi-step form component
│   │   └── RichTextEditor.tsx        # For editing AI-generated content before PDF
│   ├── proposal/                     # Proposal-specific components
│   │   ├── ProposalPreview.tsx       # Live preview of proposal
│   │   └── SectionEditor.tsx         # Edit individual sections
│   ├── knowledge-base/               # KB management components
│   │   ├── CompanyProfileForm.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── TeamMemberCard.tsx
│   │   └── AssetUploader.tsx
│   └── charts/                       # Chart components (rendered as images for PDF)
│       ├── BudgetChart.tsx           # Pie/donut chart for budget breakdown
│       ├── TimelineChart.tsx         # Horizontal Gantt-style timeline
│       ├── TeamOrgChart.tsx          # Team structure visualization
│       └── MetricsChart.tsx          # KPI/metrics bar charts
├── lib/
│   ├── ai/
│   │   ├── generate-proposal.ts      # Main AI orchestrator — generates all sections
│   │   ├── prompts/                  # System prompts for each proposal section
│   │   │   ├── executive-summary.ts
│   │   │   ├── problem-statement.ts
│   │   │   ├── proposed-solution.ts
│   │   │   ├── methodology.ts
│   │   │   ├── timeline.ts
│   │   │   ├── budget.ts
│   │   │   ├── team.ts
│   │   │   ├── case-studies.ts
│   │   │   ├── risk-mitigation.ts
│   │   │   ├── governance.ts
│   │   │   ├── why-us.ts
│   │   │   └── terms.ts
│   │   └── ai-client.ts             # Claude/OpenAI API client
│   ├── pdf/
│   │   ├── generate-pdf.ts          # Puppeteer PDF generation
│   │   ├── template.ts              # Main HTML template assembly
│   │   └── styles.ts                # CSS for PDF (exported as string)
│   ├── db/
│   │   ├── index.ts                  # Database connection
│   │   ├── schema.ts                 # Table schemas
│   │   └── seed.ts                   # Sample data for testing
│   ├── knowledge-base/
│   │   ├── types.ts                  # KB TypeScript types
│   │   └── manager.ts               # KB CRUD operations
│   └── utils/
│       ├── chart-renderer.ts         # Renders Chart.js charts to PNG images
│       └── helpers.ts                # Date formatting, slug generation, etc.
├── templates/                        # PDF HTML templates
│   ├── proposal.html                 # Main proposal HTML template (Handlebars/EJS style)
│   ├── sections/                     # Individual section HTML templates
│   │   ├── cover-page.html
│   │   ├── table-of-contents.html
│   │   ├── executive-summary.html
│   │   ├── company-overview.html
│   │   ├── problem-statement.html
│   │   ├── proposed-solution.html
│   │   ├── methodology.html
│   │   ├── deliverables.html
│   │   ├── timeline.html
│   │   ├── team.html
│   │   ├── case-studies.html
│   │   ├── budget.html
│   │   ├── risk-mitigation.html
│   │   ├── governance.html
│   │   ├── why-us.html
│   │   └── terms.html
│   └── styles/
│       └── proposal.css              # Complete PDF stylesheet
├── data/                             # Local data storage
│   ├── knowledge-base/
│   │   ├── company.json              # Company profile
│   │   ├── projects.json             # Past projects/case studies
│   │   ├── team.json                 # Team member profiles
│   │   └── assets/                   # Uploaded files (logos, photos)
│   └── proposals/                    # Generated proposals (PDFs + metadata)
├── public/
│   ├── fonts/                        # Self-hosted Inter font (for PDF rendering)
│   │   ├── Inter-Regular.woff2
│   │   ├── Inter-Medium.woff2
│   │   ├── Inter-SemiBold.woff2
│   │   └── Inter-Bold.woff2
│   └── icons/                        # UI icons
├── package.json
├── tsconfig.json
├── next.config.js
└── CLAUDE.md                         # This file
```

---

## Enterprise Proposal Sections (14+ Sections)

These are modeled after proposals from Accenture, Deloitte, McKinsey, Infosys, TCS, and Wipro:

### 1. Cover Page
- **Full-bleed branded page**
- Company logo (from KB) + client name
- Project title (large, bold)
- Date + document version
- "Confidential" watermark
- Prepared by: [Company Name]
- Prepared for: [Client Name]
- **Design**: Dark gradient background (#0F172A → #1E293B), white text, logo top-left, clean geometric accent

### 2. Table of Contents
- Auto-generated from sections
- Page numbers aligned right with dot leaders
- Clean indentation for sub-sections
- **Design**: Simple, professional, left-aligned

### 3. Executive Summary (1-2 pages)
- **AI generates this** from the prompt + requirements
- Opening hook: The business challenge
- Our understanding of your needs
- Proposed solution (2-3 bullet points)
- Expected business outcomes (quantified)
- Investment overview (high-level number)
- Why [Company Name] is the right partner
- **Design**: Pull quotes, accent-colored key metrics boxes, clean paragraphs

### 4. Company Overview (1 page)
- **Auto-populated from Knowledge Base**
- Company name, founding year, headquarters
- Mission statement
- Key stats: team size, years in business, projects delivered, industries served
- Certifications & partnerships (e.g., AWS Partner, ISO 27001)
- Core competencies (3-5 pillars)
- **Design**: Stats in large metric boxes (grid), competencies as icon-text pairs

### 5. Understanding the Challenge (1-2 pages)
- **AI generates** a deep analysis of the client's problem
- Current state assessment
- Pain points identified
- Business impact of the problem
- Industry context & market pressures
- **Design**: Numbered pain points with icons, supporting data callout boxes

### 6. Proposed Solution (2-3 pages)
- **AI generates** a detailed technical + strategic solution
- Solution overview (architecture diagram description)
- Key components & modules
- Technology stack recommendation
- Integration points
- Innovation differentiators
- **Design**: Component boxes with descriptions, numbered phases, visual flow

### 7. Methodology & Approach (1-2 pages)
- **AI generates** based on project type
- Development methodology (Agile/Scrum, Waterfall, Hybrid)
- Phase breakdown with descriptions
- Quality assurance approach
- Communication & reporting cadence
- **Design**: Phase cards in a horizontal flow, methodology diagram

### 8. Deliverables & Milestones (1 page)
- **AI generates** a structured deliverable list
- Per-phase deliverables with descriptions
- Acceptance criteria
- Milestone markers
- **Design**: Table format with checkmark icons, grouped by phase

### 9. Project Timeline (1 page)
- **AI generates** timeline data, **Chart.js renders** the visual
- Gantt-style horizontal bar chart
- Phase durations with overlap indicators
- Key milestones marked with diamonds
- **Design**: Full-width chart, clean horizontal bars with phase colors, milestone labels

### 10. Proposed Team (1-2 pages)
- **Auto-populated from Knowledge Base** — AI selects relevant team members
- Photo + Name + Title + Years of experience
- 2-3 bullet points of relevant expertise per person
- Role on this project
- **Design**: 2-column grid of team cards with photos, or 3-column for larger teams

### 11. Relevant Case Studies (2-3 pages)
- **Auto-populated from Knowledge Base** — AI selects most relevant past projects
- 2-3 case studies, each with:
  - Client name (or anonymized industry reference)
  - Challenge → Solution → Results
  - Key metrics (e.g., "40% reduction in processing time")
  - Technologies used
- **Design**: Each case study as a card with accent border, metrics in large bold numbers

### 12. Investment & Pricing (1-2 pages)
- **AI generates** cost breakdown based on requirements
- Summary table: Phase, Effort (person-days), Cost
- Total investment
- Payment milestone schedule
- Pricing model (fixed-price/T&M/hybrid)
- Optional: Budget breakdown **pie/donut chart** (Chart.js)
- **Design**: Clean table with alternating row colors, total in bold, chart beside table

### 13. Risk Mitigation (1 page)
- **AI generates** top 5-7 project risks
- Risk ID, Description, Probability, Impact, Mitigation Strategy
- **Design**: Table with color-coded probability/impact (High=Red, Medium=Amber, Low=Green)

### 14. Governance & Project Management (1 page)
- **AI generates** communication and reporting structure
- Governance model (steering committee, working group)
- Reporting frequency and format
- Escalation path
- Tools: Jira, Confluence, Slack/Teams
- **Design**: Org chart or reporting hierarchy diagram

### 15. Why Choose Us / Differentiators (1 page)
- **AI generates** with data from Knowledge Base
- 4-6 key differentiators
- Each with icon + headline + 2-line description
- Client testimonials (if in KB)
- Awards and recognition
- **Design**: 2x3 grid of differentiator cards with icons, testimonial block at bottom

### 16. Terms & Conditions (1 page)
- **AI generates** standard terms OR pull from KB
- Confidentiality & NDA
- IP ownership
- Warranty & support period
- Payment terms
- Validity period of proposal
- **Design**: Fine print style, 2-column layout, professional legal formatting

### Appendix (Optional)
- Detailed team CVs
- Technical architecture diagrams
- Additional case studies
- Certifications & compliance documentation

---

## Knowledge Base Schema

### Company Profile (`data/knowledge-base/company.json`)
```json
{
  "name": "Phavella Technologies",
  "tagline": "AI-Powered Digital Transformation",
  "founded": 2022,
  "headquarters": "Mumbai, India",
  "teamSize": 25,
  "projectsDelivered": 50,
  "industriesServed": ["FinTech", "Healthcare", "E-Commerce", "Real Estate", "Education"],
  "mission": "We build intelligent systems that solve real business problems using cutting-edge AI.",
  "certifications": ["AWS Partner", "ISO 27001", "Google Cloud Partner"],
  "coreCompetencies": [
    { "name": "AI & Machine Learning", "description": "Production-grade ML pipelines, NLP, computer vision, and generative AI solutions" },
    { "name": "Full-Stack Development", "description": "React, Next.js, FastAPI, Node.js — modern web & mobile applications" },
    { "name": "Cloud Architecture", "description": "AWS, GCP, Azure — scalable, secure, cost-optimized infrastructure" },
    { "name": "Voice & Conversational AI", "description": "AI voice agents, chatbots, and intelligent IVR systems" },
    { "name": "Data Engineering", "description": "Real-time data pipelines, analytics dashboards, and business intelligence" }
  ],
  "logoPath": "assets/logo.png",
  "brandColors": {
    "primary": "#0F172A",
    "secondary": "#3B82F6",
    "accent": "#10B981"
  }
}
```

### Past Projects (`data/knowledge-base/projects.json`)
```json
[
  {
    "id": "proj-001",
    "title": "AI Voice Agent for Dental Clinic Chain",
    "client": "SmileCare Dental Group",
    "clientIndustry": "Healthcare",
    "year": 2025,
    "duration": "3 months",
    "teamSize": 4,
    "challenge": "Manual appointment booking causing 40% call abandonment rate",
    "solution": "Deployed AI voice agent handling appointment booking, rescheduling, and reminders autonomously",
    "results": [
      "85% reduction in missed calls",
      "60% increase in appointment bookings",
      "24/7 availability without additional staff"
    ],
    "technologies": ["LiveKit", "Deepgram", "Gemini", "ElevenLabs", "FastAPI", "MongoDB"],
    "testimonial": {
      "quote": "The AI agent handles calls better than our front desk staff. It never misses a beat.",
      "author": "Dr. Priya Sharma",
      "title": "Founder, SmileCare Dental Group"
    }
  }
]
```

### Team Members (`data/knowledge-base/team.json`)
```json
[
  {
    "id": "team-001",
    "name": "Adil Sheikh",
    "title": "Founder & Lead AI Engineer",
    "photo": "assets/team/adil.jpg",
    "yearsExperience": 5,
    "expertise": ["AI/ML", "Voice AI", "Full-Stack Development", "System Architecture"],
    "bio": "Full-stack AI engineer specializing in production-grade AI systems. Built autonomous agent systems, AI voice platforms, and generative AI pipelines from scratch.",
    "certifications": ["AWS Solutions Architect", "Google Cloud ML Engineer"],
    "education": "B.Tech Computer Science",
    "linkedin": "https://linkedin.com/in/adilsheikh"
  }
]
```

---

## PDF Design System

### Typography
```css
/* PDF Font Stack */
@font-face { font-family: 'Inter'; src: url('/fonts/Inter-Regular.woff2'); font-weight: 400; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter-Medium.woff2'); font-weight: 500; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter-SemiBold.woff2'); font-weight: 600; }
@font-face { font-family: 'Inter'; src: url('/fonts/Inter-Bold.woff2'); font-weight: 700; }

/* Hierarchy */
h1 { font-size: 32px; font-weight: 700; color: #0F172A; letter-spacing: -0.02em; }
h2 { font-size: 24px; font-weight: 600; color: #0F172A; letter-spacing: -0.01em; }
h3 { font-size: 18px; font-weight: 600; color: #1E293B; }
h4 { font-size: 14px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
body { font-size: 11px; font-weight: 400; color: #334155; line-height: 1.6; }
```

### Color Palette (Professional, Corporate)
```
Primary:     #0F172A (Dark Navy — headings, cover page)
Secondary:   #1E293B (Slate — subheadings)
Body:        #334155 (Gray-700 — body text)
Muted:       #64748B (Gray-500 — captions, footnotes)
Accent:      #3B82F6 (Blue-500 — links, highlights, chart primary)
Success:     #10B981 (Green — positive metrics)
Warning:     #F59E0B (Amber — medium risk)
Danger:      #EF4444 (Red — high risk, negative metrics)
Background:  #FFFFFF (White — page background)
Surface:     #F8FAFC (Light gray — card backgrounds, alternating rows)
Border:      #E2E8F0 (Gray-200 — table borders, dividers)
```

### Page Layout Rules
```css
@page {
  size: A4;
  margin: 25mm 20mm 30mm 20mm;
}

@page :first {
  margin: 0; /* Cover page is full-bleed */
}
```

### Chart Specifications
1. **Budget Donut Chart**: Chart.js doughnut, max 6 segments, color palette from brand, labels outside
2. **Timeline/Gantt**: Horizontal bar chart, phases as rows, weeks/months as columns, milestone diamonds
3. **Team Org Chart**: Custom SVG, hierarchy boxes connected by lines
4. **Metrics Bar Chart**: Horizontal bars showing ROI/KPI improvements from case studies

---

## AI Content Generation Strategy

For EACH section, Claude Code must create a separate system prompt in `lib/ai/prompts/`. Each prompt:
1. Takes the user's project prompt + requirements + relevant KB data as input
2. Returns structured JSON (not raw text) that maps to the HTML template
3. Is enterprise-toned: confident, data-driven, outcome-focused, no fluff

### Example: Executive Summary Prompt
```typescript
export const executiveSummaryPrompt = (
  projectPrompt: string,
  requirements: Requirements,
  companyProfile: CompanyProfile
) => `
You are a senior consulting partner at a top-tier technology consulting firm.
Write an executive summary for a project proposal.

PROJECT: ${projectPrompt}
REQUIREMENTS: ${JSON.stringify(requirements)}
PROPOSING COMPANY: ${companyProfile.name} — ${companyProfile.tagline}

Return JSON:
{
  "openingHook": "1-2 sentence hook about the business challenge (address the client directly)",
  "understanding": "2-3 sentences showing deep understanding of the client's situation",
  "solutionBullets": ["3 bullet points summarizing the proposed solution"],
  "expectedOutcomes": [
    { "metric": "Projected ROI", "value": "3.5x", "description": "within first 12 months" },
    { "metric": "Efficiency Gain", "value": "60%", "description": "reduction in manual processing time" }
  ],
  "investmentRange": "$150,000 - $220,000",
  "closingStatement": "1-2 sentences on why this company is the right partner"
}

TONE: Confident, executive-ready, data-driven. Every sentence must answer "so what?" for the business.
Avoid: generic filler, buzzword salad, vague promises. Be specific and quantified.
`;
```

---

## Proposal Generation Flow

```
User fills form (prompt + requirements)
        ↓
AI generates content for ALL 14+ sections (parallel where possible)
        ↓
Charts rendered as PNG images (Chart.js → Canvas → PNG)
        ↓
HTML template assembled with content + chart images + KB data
        ↓
Puppeteer renders HTML to PDF (A4, print-optimized)
        ↓
PDF saved to `data/proposals/[id]/proposal.pdf`
        ↓
User can preview, edit sections, and re-generate
```

---

## Frontend UI Design

### Dashboard (Landing Page)
- List of previously generated proposals (cards with title, client, date, status)
- "New Proposal" CTA button (large, prominent)
- Quick stats: proposals generated, knowledge base items
- **Design**: Dark sidebar + light content area, modern dashboard aesthetic

### Proposal Creation Wizard (Multi-Step Form)
**Step 1: Project Brief**
- Project title (text input)
- Client name (text input)  
- Project description / prompt (large textarea — this is the core input)
- Industry dropdown (FinTech, Healthcare, etc.)

**Step 2: Requirements**
- Budget range (slider or min/max inputs)
- Timeline (start date + duration)
- Team size preference
- Technology preferences (multi-select tags)
- Compliance requirements (checkboxes: SOC2, HIPAA, GDPR, ISO 27001)
- Methodology preference (Agile/Waterfall/Hybrid)

**Step 3: Customization**
- Select which sections to include (checkboxes, all checked by default)
- Pricing model (Fixed Price / T&M / Hybrid)
- Include case studies? (toggle + select which ones from KB)
- Include team bios? (toggle + select which members)
- Custom terms & conditions (textarea, optional)

**Step 4: Preview & Generate**
- AI generates content (show progress: "Generating Executive Summary... ✓")
- Live preview of each section
- Edit any section's AI-generated content inline
- "Generate PDF" button → downloads the final PDF

### Knowledge Base Management
- **Company Profile**: Form with all company fields (auto-saves)
- **Past Projects**: Card grid + "Add Project" dialog (structured form)
- **Team Members**: Card grid + "Add Member" dialog (with photo upload)
- **Assets**: Drag-and-drop file upload (logos, photos)

### Design Aesthetics
- **Theme**: Light mode with dark navy accents (#0F172A)
- **Font**: Inter (Google Fonts)
- **Cards**: White with subtle shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.1)`)
- **Buttons**: Navy primary (#0F172A), rounded (8px), hover animation
- **Inputs**: Clean bordered, focus ring in blue (#3B82F6)
- **Animations**: Smooth page transitions, step wizard slide animation, progress indicators
- **Layout**: Max-width 1200px, centered, generous whitespace

---

## Build Order (Milestones)

### Milestone 1: Project Setup & PDF Template (2 hours)
1. Initialize Next.js 14 with TypeScript (`npx -y create-next-app@latest ./`)
2. Install dependencies: `puppeteer`, `chart.js`, `uuid`, `date-fns`
3. Download and self-host Inter font files (woff2)
4. Create the complete PDF CSS stylesheet (`templates/styles/proposal.css`)
5. Create HTML templates for ALL 14+ sections
6. Test: Generate a hardcoded sample PDF — MUST look enterprise-grade

### Milestone 2: Knowledge Base System (1.5 hours)
1. Create JSON file storage system (`data/knowledge-base/`)
2. Seed with sample data (company profile, 3 projects, 4 team members)
3. Build API routes for KB CRUD operations
4. Build KB management UI (company profile form, project cards, team cards)
5. File upload for logos and team photos

### Milestone 3: AI Content Generation (2 hours)
1. Set up AI client (Claude API or OpenAI — whichever key is available)
2. Create system prompts for ALL 14+ sections
3. Build the orchestrator: takes (prompt + requirements + KB) → generates all sections
4. Each section returns structured JSON
5. Handle errors gracefully (retry, fallback to template text)

### Milestone 4: Chart Generation (1 hour)
1. Budget donut chart (Chart.js → PNG)
2. Timeline/Gantt chart (Chart.js horizontal bar → PNG)
3. Team org chart (custom SVG → PNG)
4. Metrics chart for case studies (bar chart → PNG)
5. All charts match the proposal color palette

### Milestone 5: PDF Assembly & Generation (1.5 hours)
1. Template engine: Assemble HTML from section templates + AI content + charts
2. Puppeteer PDF generation with proper @page rules
3. Cover page (full-bleed, dark background)
4. Running headers/footers with page numbers
5. Table of contents with correct page numbers
6. Save PDF to `data/proposals/[id]/`

### Milestone 6: Frontend UI (2 hours)
1. Dashboard page (list proposals, create new)
2. Multi-step creation wizard (4 steps)
3. Section preview with inline editing
4. Generate & download flow
5. Polish: animations, responsive, loading states

### Milestone 7: Testing & Polish (1 hour)
1. Generate 3 different proposals to test variety
2. Verify PDF renders correctly (fonts, charts, page breaks)
3. Test knowledge base management (add/edit/delete)
4. Mobile responsiveness check
5. Error handling for missing AI keys / empty KB

---

## Environment Variables

```env
# AI Provider (use one or both)
ANTHROPIC_API_KEY=           # For Claude API
OPENAI_API_KEY=              # For GPT-4o (fallback)

# App
NEXT_PUBLIC_APP_NAME=ProposalForge
PORT=3000
```

---

## Key Implementation Details

### PDF Generation (Puppeteer)
```typescript
import puppeteer from 'puppeteer';

export async function generatePDF(htmlContent: string, outputPath: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '25mm', right: '20mm', bottom: '30mm', left: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px;color:#94A3B8;width:100%;text-align:right;padding-right:20mm;">Confidential</div>',
    footerTemplate: '<div style="font-size:9px;color:#64748B;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  
  await browser.close();
}
```

### Chart Rendering (Chart.js to PNG)
```typescript
import { createCanvas } from 'canvas';
import { Chart } from 'chart.js/auto';

export function renderBudgetChart(data: BudgetItem[]): string {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');
  
  new Chart(ctx as any, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.phase),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
      }]
    },
    options: {
      responsive: false,
      plugins: { legend: { position: 'right' } }
    }
  });
  
  return canvas.toDataURL('image/png'); // Embed as base64 in HTML
}
```

---

## Important Constraints

1. **PDF must look PREMIUM** — If the PDF looks like a college assignment, you have FAILED. It must look like it came from a Big 4 consulting firm.
2. **Self-contained PDF** — All fonts, images, and charts must be embedded. No external URLs in the PDF.
3. **Page breaks matter** — Use CSS `page-break-before: always` to start each major section on a new page.
4. **No placeholder text in final output** — Every section must have real, AI-generated content.
5. **Knowledge Base must persist** — Data saved once should survive server restarts (JSON files or SQLite).
6. **Graceful degradation** — If no AI key is provided, show a warning and use template text.
7. **Fast generation** — Target under 60 seconds for full proposal generation (AI + charts + PDF).

---

## What SUCCESS Looks Like

A user should be able to:
1. Enter their company info in the Knowledge Base (once)
2. Add past projects and team members (once)
3. Type "Build an AI-powered inventory management system for a retail chain with 200 stores" + set budget to $200K-$300K + timeline 6 months
4. Click "Generate"
5. Get a 15-25 page, beautifully formatted PDF that looks like it came from Accenture
6. The PDF has real charts, their team bios, relevant case studies, detailed pricing, and professional formatting
7. They can edit any section and re-generate

---

## Sample Test Prompts (Use These to Verify)

1. "Design and develop an AI-powered customer service chatbot for a major Indian bank with 50 million customers"
2. "Build a real-time inventory management and demand forecasting system for a retail chain with 200+ stores across India"
3. "Develop a HIPAA-compliant telemedicine platform with AI-assisted diagnosis for a hospital network"
