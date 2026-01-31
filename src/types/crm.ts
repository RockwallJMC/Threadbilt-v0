export interface Deal {
  id: string;
  name: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  close_date: string;
  contact_id: string;
  company_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;

  // Nested relations
  contact: ContactWithCompany;
  company: CompanyWithDeals;
  collaborators: DealCollaborators;
  activity_summary: ActivitySummary;
}

export interface DealCollaborators {
  owner: User | null;
  collaborators: User[];
  followers: User[];
}

export interface ActivitySummary {
  total: number;
  by_type: Record<string, number>;
}

export interface DealAnalytics {
  deal_progress: number;
  win_loss_ratio: number;
  conversion_rate: number;
  engagement_metrics: number;
}

export interface CompanyWithDeals extends Company {
  deals: Deal[];
}

// Base types (may need to import from existing types)
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ContactWithCompany extends Contact {
  company: Company;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}
