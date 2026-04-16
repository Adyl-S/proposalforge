/**
 * Knowledge Base domain types.
 * Persisted as JSON in `data/knowledge-base/`.
 */

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Competency {
  name: string;
  description: string;
}

export interface KBCompanyProfile {
  name: string;
  tagline: string;
  founded: number;
  headquarters: string;
  teamSize: number;
  projectsDelivered: number;
  industriesServed: string[];
  mission: string;
  certifications: string[];
  coreCompetencies: Competency[];
  logoPath?: string;
  brandColors?: BrandColors;
  signatoryName?: string;
  signatoryTitle?: string;
  website?: string;
  email?: string;
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectTestimonial {
  quote: string;
  author: string;
  title: string;
}

export interface KBProject {
  id: string;
  title: string;
  client: string;
  clientIndustry: string;
  year: number;
  duration: string;
  teamSize: number;
  challenge: string;
  solution: string;
  results: string[];
  metrics?: ProjectMetric[];
  technologies: string[];
  testimonial?: ProjectTestimonial;
  tags?: string[];
}

export interface KBTeamMember {
  id: string;
  name: string;
  title: string;
  photoPath?: string;
  yearsExperience: number;
  expertise: string[];
  bio: string;
  certifications?: string[];
  education?: string;
  linkedin?: string;
  tags?: string[];
}

export interface KnowledgeBase {
  company: KBCompanyProfile;
  projects: KBProject[];
  team: KBTeamMember[];
}
