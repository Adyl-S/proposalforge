/**
 * Input shape for the proposal generator — comes from the UI wizard.
 */

export type ComplianceRequirement = 'SOC2' | 'HIPAA' | 'GDPR' | 'ISO27001' | 'RBI' | 'DPDPA' | 'PCI-DSS' | 'FedRAMP';
export type PricingModel = 'Fixed Price' | 'Time & Materials' | 'Hybrid' | 'Outcome-Linked';
export type Methodology = 'Agile' | 'Waterfall' | 'Hybrid';
export type UseCase = 'linkedin' | 'upwork' | 'small' | 'legacy';

// ─── EnrichedCompany contract ────────────────────────────────────────────────
// Mirrors website_scraper/app/schemas/enriched.py exactly.
// Field names, nesting, and enum values MUST match character-for-character.

export type AnalysisStatus = 'pending_review' | 'approved' | 'rejected' | 'edited';
export type Ownership = 'public' | 'private' | 'pe_backed' | 'vc_backed' | 'founder_owned' | 'unknown';
export type Archetype = 'founder_led_midmarket' | 'pe_growth' | 'large_corporate' | 'regulated';
export type Seniority = 'c_suite' | 'vp' | 'director' | 'manager' | 'ic';
export type EmailStatus = 'verified' | 'pattern_guess' | 'not_found';
export type Effort = 'small' | 'medium' | 'large';
export type ContactSource = 'website' | 'linkedin' | 'news' | 'manual';

export interface RecentEvent {
  date: string | null;
  type: string;
  description: string;
  // Pydantic allows extras; keep loose on the TS side too.
  [extra: string]: unknown;
}

export interface CompanySize {
  employees_band: string | null;
  revenue_band: string | null;
}

export interface Company {
  name: string | null;
  industry: string | null;
  sub_industry: string | null;
  size: CompanySize;
  hq_country: string | null;
  other_locations: string[];
  ownership: Ownership;
  archetype: Archetype | null;
  founded_year: number | null;
  recent_events: RecentEvent[];
}

export interface Signals {
  tech_stack: string[];
  hiring_roles: string[];
  pain_indicators: string[];
  compliance_footprint: string[];
  digital_maturity_score: number;
}

export interface Contact {
  name: string;
  role: string;
  seniority: Seniority;
  linkedin_url: string | null;
  email: string | null;
  email_status: EmailStatus;
  rationale: string | null;
  source: ContactSource;
}

export interface People {
  primary: Contact | null;
  secondary: Contact | null;
  tertiary: Contact | null;
  all_discovered: Contact[];
}

export interface AutomationOpportunityImpact {
  metric: string;
  estimated_value: string;
}

export interface AutomationOpportunity {
  title: string;
  current_state: string;
  proposed_state: string;
  impact: AutomationOpportunityImpact;
  effort: Effort;
  priority_score: number;
}

export interface Confidence {
  overall: number;
  per_section: Record<string, number>;
}

export interface EnrichedCompany {
  id: string;
  url: string;
  use_case: UseCase;
  user_owner: string;
  status: AnalysisStatus;
  company: Company;
  signals: Signals;
  people: People;
  opportunities: AutomationOpportunity[];
  confidence: Confidence;
  created_at: string; // ISO 8601 datetime
  approved_at: string | null;
  approved_by: string | null;
}

export interface ProposalInput {
  // Routing & ownership — mirrors scraper's ScrapeRequest.use_case/user_owner
  useCase: UseCase;
  userOwner: string;

  // Step 1: brief
  projectTitle: string;
  clientName: string;
  clientIndustry: string;
  /**
   * The core user input for linkedin/upwork use-cases.
   * For legacy/small use-cases, Step 5 replaces this with a synthesised prompt
   * derived from the scraper's EnrichedCompany.
   */
  projectPrompt: string;
  /**
   * Scraper analysis id. When set for legacy/small use-cases, overrides
   * projectPrompt. The analysis must be in status='approved' on the scraper
   * before generation will proceed.
   */
  enrichedCompanyId?: string;

  // Step 2: requirements
  budgetMin?: number;
  budgetMax?: number;
  currency?: string; // ISO code, defaults to USD
  timelineWeeks?: number;
  startDate?: string; // ISO date
  teamSizePreference?: number;
  preferredTechnologies?: string[];
  compliance?: ComplianceRequirement[];
  methodology?: Methodology;

  // Step 3: customization
  sectionsToInclude?: Partial<Record<SectionKey, boolean>>;
  pricingModel?: PricingModel;
  includeCaseStudies?: boolean;
  caseStudyIds?: string[]; // explicit selection from KB, empty = auto
  includeTeamBios?: boolean;
  teamMemberIds?: string[]; // explicit selection from KB, empty = auto
  customTerms?: string;
  proposalVersion?: string;
}

export type SectionKey =
  | 'cover'
  | 'toc'
  | 'executiveSummary'
  | 'companyOverview'
  | 'problemStatement'
  | 'proposedSolution'
  | 'methodology'
  | 'deliverables'
  | 'timeline'
  | 'team'
  | 'caseStudies'
  | 'budget'
  | 'riskMitigation'
  | 'governance'
  | 'whyUs'
  | 'terms';
