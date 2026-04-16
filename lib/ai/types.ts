/**
 * Input shape for the proposal generator — comes from the UI wizard.
 */

export type ComplianceRequirement = 'SOC2' | 'HIPAA' | 'GDPR' | 'ISO27001' | 'RBI' | 'DPDPA' | 'PCI-DSS' | 'FedRAMP';
export type PricingModel = 'Fixed Price' | 'Time & Materials' | 'Hybrid' | 'Outcome-Linked';
export type Methodology = 'Agile' | 'Waterfall' | 'Hybrid';

export interface ProposalInput {
  // Step 1: brief
  projectTitle: string;
  clientName: string;
  clientIndustry: string;
  projectPrompt: string; // the core user input — what the project is about

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
