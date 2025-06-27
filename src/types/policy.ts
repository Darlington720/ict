/**
 * SABER-ICT Policy Framework Types
 * Based on World Bank SABER-ICT Technical Paper Series
 */

export type SABERStage = 'Latent' | 'Emerging' | 'Established' | 'Advanced';

export type PolicyThemeCode = 
  | 'vision_planning'
  | 'ict_infrastructure' 
  | 'teachers'
  | 'skills_competencies'
  | 'learning_resources'
  | 'emis'
  | 'monitoring_evaluation'
  | 'equity_inclusion_safety';

export type CrossCuttingThemeCode =
  | 'distance_education'
  | 'mobiles'
  | 'early_childhood'
  | 'open_educational_resources'
  | 'community_involvement'
  | 'data_privacy';

export interface PolicySubTheme {
  id: string;
  code: string; // e.g., "1.1", "2.3"
  name: string;
  description: string;
  stage: SABERStage;
  score: number; // 0-100
  evidence: string[];
  notes?: string;
  lastAssessed: string;
}

export interface PolicyTheme {
  id: string;
  code: PolicyThemeCode;
  name: string;
  description: string;
  subThemes: PolicySubTheme[];
  overallScore: number;
  stage: SABERStage;
}

export interface CrossCuttingTheme {
  id: string;
  code: CrossCuttingThemeCode;
  name: string;
  description: string;
  stage: SABERStage;
  score: number;
  evidence: string[];
  notes?: string;
}

export interface PolicyAssessment {
  id: string;
  schoolId?: string;
  districtId?: string;
  level: 'school' | 'district' | 'national';
  assessmentDate: string;
  assessorName: string;
  assessorRole: string;
  assessorEmail: string;
  themes: PolicyTheme[];
  crossCuttingThemes: CrossCuttingTheme[];
  overallScore: number;
  overallStage: SABERStage;
  recommendations: PolicyRecommendation[];
  status: 'draft' | 'completed' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRecommendation {
  id: string;
  themeCode: PolicyThemeCode | CrossCuttingThemeCode;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  timeline: string;
  resources: string[];
  expectedImpact: string;
}

export interface PolicyBenchmark {
  themeCode: PolicyThemeCode | CrossCuttingThemeCode;
  subThemeCode?: string;
  national: {
    average: number;
    stage: SABERStage;
  };
  regional: {
    average: number;
    stage: SABERStage;
  };
  global: {
    average: number;
    stage: SABERStage;
  };
}

export interface PolicyTrend {
  assessmentId: string;
  date: string;
  overallScore: number;
  themeScores: Record<PolicyThemeCode, number>;
}

// Enhanced School interface with policy data
export interface SchoolWithPolicy {
  id: string;
  name: string;
  district: string;
  latestPolicyAssessment?: PolicyAssessment;
  policyMaturityLevel: SABERStage;
  policyScore: number;
  lastPolicyAssessment?: string;
  policyTrends: PolicyTrend[];
}