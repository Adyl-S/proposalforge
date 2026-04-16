/**
 * Shape of the data object passed into the proposal template engine.
 * Every AI section generator must ultimately return data conforming to this.
 */

export interface ProposalMeta {
  projectTitle: string;
  projectSubtitle: string;
  clientName: string;
  clientIndustry: string;
  version: string;
  date: string;
  validThrough: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  founded: number;
  headquarters: string;
  teamSize: number;
  projectsDelivered: number;
  industriesServed: string[];
  mission: string;
  certifications: string[];
  coreCompetencies: { name: string; description: string }[];
  logoPath?: string;
  logoDataUri?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  brandColors?: { primary: string; secondary: string; accent: string };
  yearsInBusiness?: number;
  industriesCount?: number;
}

export interface TocEntry {
  number: string;
  title: string;
  page: number;
  major?: boolean;
}

export interface ExecutiveSummary {
  openingHook: string;
  understanding: string;
  solutionBullets: string[];
  expectedOutcomes: { metric: string; value: string; description: string }[];
  investmentRange: string;
  pricingModel: string;
  closingStatement: string;
}

export interface ProblemStatement {
  currentState: string;
  painPoints: { num: string; title: string; description: string }[];
  businessImpact: string;
  industryContext: string;
}

export interface ProposedSolution {
  overview: string;
  components: { name: string; description: string }[];
  integrations: string[];
  techStack: string[];
  innovations: string[];
}

export interface Methodology {
  approach: string;
  summary: string;
  phases: { num: number; name: string; description: string; duration: string }[];
  qa: string[];
  communication: string[];
}

export interface Deliverables {
  items: { phase: string; name: string; description: string; acceptance: string }[];
  milestones: { name: string; target: string }[];
}

export interface Timeline {
  totalDuration: string;
  chartImage?: string;
  phases: { num: number; name: string; focus: string; duration: string; start: string }[];
}

export interface TeamMemberRendered {
  name: string;
  title: string;
  initials: string;
  photoDataUri?: string;
  yearsExperience: number;
  expertiseSummary: string;
  relevance: string;
  roleOnProject: string;
}

export interface TeamSection {
  size: number;
  introduction: string;
  members: TeamMemberRendered[];
}

export interface CaseStudyRendered {
  title: string;
  clientIndustry: string;
  year: number;
  duration: string;
  challenge: string;
  solution: string;
  outcome: string;
  metrics: { value: string; label: string }[];
  technologies: string[];
  testimonial?: { quote: string; author: string; authorTitle: string };
}

export interface CaseStudies {
  items: CaseStudyRendered[];
}

export interface Budget {
  pricingModel: string;
  phases: { name: string; focus: string; effort: string; cost: string }[];
  totalEffort: string;
  totalCost: string;
  chartImage?: string;
  paymentMilestones: { num: number; name: string; trigger: string; amount: string }[];
  notes: string;
}

export interface RiskMitigation {
  introduction: string;
  risks: {
    id: string;
    title: string;
    description: string;
    probability: string;
    probabilityClass: 'high' | 'med' | 'low';
    impact: string;
    impactClass: 'high' | 'med' | 'low';
    mitigation: string;
  }[];
}

export interface Governance {
  introduction: string;
  steeringCommittee: string[];
  workingGroup: string[];
  reportingCadence: { frequency: string; what: string }[];
  escalationPath: string[];
  tools: string[];
  changeManagement: string;
}

export interface WhyUs {
  differentiators: { icon: string; headline: string; description: string }[];
  stats: { value: string; label: string }[];
  featuredTestimonial?: { quote: string; author: string; authorTitle: string };
}

export interface Terms {
  clauses: { title: string; body: string }[];
  validity: string;
}

export interface ProposalData {
  proposal: ProposalMeta;
  company: CompanyProfile;
  toc: TocEntry[];
  executiveSummary: ExecutiveSummary;
  problemStatement: ProblemStatement;
  proposedSolution: ProposedSolution;
  methodology: Methodology;
  deliverables: Deliverables;
  timeline: Timeline;
  team: TeamSection;
  caseStudies: CaseStudies;
  budget: Budget;
  riskMitigation: RiskMitigation;
  governance: Governance;
  whyUs: WhyUs;
  terms: Terms;
}
