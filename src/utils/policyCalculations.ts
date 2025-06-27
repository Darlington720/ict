/**
 * Policy Assessment Calculation Utilities
 */

import { PolicyAssessment, PolicyTheme, SABERStage, PolicyRecommendation, PolicyThemeCode } from '../types/policy';
import { STAGE_SCORES, SABER_POLICY_THEMES } from '../data/saberFramework';

/**
 * Calculate overall score for a policy theme
 */
export const calculateThemeScore = (theme: PolicyTheme): number => {
  if (!theme.subThemes || theme.subThemes.length === 0) return 0;
  
  const totalScore = theme.subThemes.reduce((sum, subTheme) => sum + subTheme.score, 0);
  return Math.round(totalScore / theme.subThemes.length);
};

/**
 * Determine SABER stage based on score
 */
export const determineStageFromScore = (score: number): SABERStage => {
  if (score >= 87.5) return 'Advanced';
  if (score >= 62.5) return 'Established';
  if (score >= 37.5) return 'Emerging';
  return 'Latent';
};

/**
 * Calculate overall policy assessment score
 */
export const calculateOverallPolicyScore = (assessment: PolicyAssessment): number => {
  if (!assessment.themes || assessment.themes.length === 0) return 0;
  
  const themeScores = assessment.themes.map(theme => calculateThemeScore(theme));
  const totalScore = themeScores.reduce((sum, score) => sum + score, 0);
  
  return Math.round(totalScore / assessment.themes.length);
};

/**
 * Generate policy recommendations based on assessment
 */
export const generatePolicyRecommendations = (assessment: PolicyAssessment): PolicyRecommendation[] => {
  const recommendations: PolicyRecommendation[] = [];
  
  // Analyze each theme for improvement opportunities
  assessment.themes.forEach(theme => {
    const themeScore = calculateThemeScore(theme);
    const stage = determineStageFromScore(themeScore);
    
    if (stage === 'Latent' || stage === 'Emerging') {
      const recommendation = generateThemeRecommendation(theme, stage);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    // Check individual sub-themes for specific recommendations
    theme.subThemes.forEach(subTheme => {
      if (subTheme.score < 50) { // Below emerging level
        const subThemeRecommendation = generateSubThemeRecommendation(theme.code, subTheme);
        if (subThemeRecommendation) {
          recommendations.push(subThemeRecommendation);
        }
      }
    });
  });
  
  // Sort by priority (high first)
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Generate recommendation for a specific theme
 */
const generateThemeRecommendation = (theme: PolicyTheme, stage: SABERStage): PolicyRecommendation | null => {
  const themeData = SABER_POLICY_THEMES[theme.code];
  if (!themeData) return null;
  
  const recommendations: Record<PolicyThemeCode, any> = {
    vision_planning: {
      title: 'Develop Comprehensive ICT Education Strategy',
      description: 'Create a clear vision and strategic plan for ICT integration in education',
      actionItems: [
        'Conduct stakeholder consultations to define ICT education vision',
        'Develop measurable goals and targets for ICT integration',
        'Establish coordination mechanisms across sectors',
        'Secure sustainable funding commitments'
      ],
      timeline: '6-12 months',
      resources: ['Policy development team', 'Stakeholder engagement budget', 'Technical expertise'],
      expectedImpact: 'Foundation for systematic ICT education development'
    },
    ict_infrastructure: {
      title: 'Strengthen ICT Infrastructure Foundation',
      description: 'Improve basic ICT infrastructure including electricity, devices, and support systems',
      actionItems: [
        'Conduct infrastructure needs assessment',
        'Develop device procurement and distribution plan',
        'Establish technical support systems',
        'Ensure reliable electricity access'
      ],
      timeline: '12-24 months',
      resources: ['Infrastructure budget', 'Technical support staff', 'Maintenance contracts'],
      expectedImpact: 'Reliable ICT infrastructure enabling effective teaching and learning'
    },
    teachers: {
      title: 'Build Teacher ICT Capacity',
      description: 'Develop comprehensive teacher training and support systems for ICT integration',
      actionItems: [
        'Design ICT competency framework for teachers',
        'Implement systematic teacher training programs',
        'Establish teacher support networks',
        'Integrate ICT skills in teacher certification'
      ],
      timeline: '18-36 months',
      resources: ['Training budget', 'Master trainers', 'Learning materials', 'Support infrastructure'],
      expectedImpact: 'Teachers equipped with skills and confidence to integrate ICT effectively'
    },
    skills_competencies: {
      title: 'Develop Student Digital Competencies',
      description: 'Implement comprehensive digital literacy and 21st-century skills curriculum',
      actionItems: [
        'Develop age-appropriate digital literacy curriculum',
        'Train teachers in digital skills pedagogy',
        'Integrate digital competencies across subjects',
        'Establish assessment frameworks for digital skills'
      ],
      timeline: '12-24 months',
      resources: ['Curriculum development team', 'Teacher training', 'Assessment tools'],
      expectedImpact: 'Students equipped with essential digital skills for future success'
    },
    learning_resources: {
      title: 'Expand Digital Learning Resources',
      description: 'Develop and curate high-quality digital content aligned with curriculum',
      actionItems: [
        'Establish digital content repository',
        'Develop curriculum-aligned digital resources',
        'Implement content quality assurance processes',
        'Train teachers in digital content integration'
      ],
      timeline: '12-18 months',
      resources: ['Content development team', 'Technology platform', 'Quality assurance processes'],
      expectedImpact: 'Rich digital learning environment supporting improved educational outcomes'
    },
    emis: {
      title: 'Implement Comprehensive EMIS',
      description: 'Establish robust education management information systems',
      actionItems: [
        'Design integrated EMIS architecture',
        'Implement data collection and management systems',
        'Train staff in EMIS use and maintenance',
        'Establish data governance and privacy policies'
      ],
      timeline: '18-30 months',
      resources: ['EMIS development team', 'Technology infrastructure', 'Training programs'],
      expectedImpact: 'Data-driven decision making and improved education system management'
    },
    monitoring_evaluation: {
      title: 'Establish M&E Framework',
      description: 'Implement systematic monitoring and evaluation of ICT education initiatives',
      actionItems: [
        'Develop M&E framework with clear indicators',
        'Establish baseline data collection systems',
        'Implement regular assessment and evaluation cycles',
        'Build capacity for evidence-based decision making'
      ],
      timeline: '12-18 months',
      resources: ['M&E specialists', 'Data collection tools', 'Analysis capacity'],
      expectedImpact: 'Continuous improvement based on evidence and systematic learning'
    },
    equity_inclusion_safety: {
      title: 'Ensure Equitable and Safe ICT Access',
      description: 'Address digital divides and ensure safe, inclusive ICT education',
      actionItems: [
        'Conduct equity analysis and gap assessment',
        'Develop targeted interventions for disadvantaged groups',
        'Implement digital safety and citizenship curriculum',
        'Establish inclusive design principles for ICT initiatives'
      ],
      timeline: '12-24 months',
      resources: ['Equity analysis team', 'Targeted intervention budget', 'Safety curriculum'],
      expectedImpact: 'Inclusive ICT education benefiting all students regardless of background'
    }
  };
  
  const baseRecommendation = recommendations[theme.code];
  if (!baseRecommendation) return null;
  
  return {
    id: `rec_${theme.code}_${Date.now()}`,
    themeCode: theme.code,
    priority: stage === 'Latent' ? 'high' : 'medium',
    ...baseRecommendation
  };
};

/**
 * Generate recommendation for a specific sub-theme
 */
const generateSubThemeRecommendation = (themeCode: PolicyThemeCode, subTheme: any): PolicyRecommendation | null => {
  // This would contain specific recommendations for each sub-theme
  // For now, return a generic recommendation
  return {
    id: `rec_${themeCode}_${subTheme.code}_${Date.now()}`,
    themeCode,
    priority: 'medium',
    title: `Improve ${subTheme.name}`,
    description: `Address gaps in ${subTheme.name} to advance policy maturity`,
    actionItems: [
      `Assess current state of ${subTheme.name}`,
      `Develop improvement plan`,
      `Implement targeted interventions`,
      `Monitor progress and adjust as needed`
    ],
    timeline: '6-12 months',
    resources: ['Technical expertise', 'Implementation budget', 'Monitoring systems'],
    expectedImpact: `Enhanced ${subTheme.name} contributing to overall policy advancement`
  };
};

/**
 * Calculate policy maturity trends over time
 */
export const calculatePolicyTrends = (assessments: PolicyAssessment[]): any[] => {
  return assessments
    .sort((a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime())
    .map(assessment => ({
      date: assessment.assessmentDate,
      overallScore: calculateOverallPolicyScore(assessment),
      stage: determineStageFromScore(calculateOverallPolicyScore(assessment)),
      themeScores: assessment.themes.reduce((acc, theme) => {
        acc[theme.code] = calculateThemeScore(theme);
        return acc;
      }, {} as Record<PolicyThemeCode, number>)
    }));
};

/**
 * Compare policy assessment against benchmarks
 */
export const compareToBenchmarks = (assessment: PolicyAssessment, benchmarks: any): any => {
  const overallScore = calculateOverallPolicyScore(assessment);
  
  return {
    overall: {
      score: overallScore,
      stage: determineStageFromScore(overallScore),
      comparison: {
        national: overallScore - (benchmarks.national?.average || 0),
        regional: overallScore - (benchmarks.regional?.average || 0),
        global: overallScore - (benchmarks.global?.average || 0)
      }
    },
    themes: assessment.themes.map(theme => {
      const themeScore = calculateThemeScore(theme);
      const themeBenchmark = benchmarks.themes?.[theme.code];
      
      return {
        code: theme.code,
        name: theme.name,
        score: themeScore,
        stage: determineStageFromScore(themeScore),
        comparison: {
          national: themeScore - (themeBenchmark?.national?.average || 0),
          regional: themeScore - (themeBenchmark?.regional?.average || 0),
          global: themeScore - (themeBenchmark?.global?.average || 0)
        }
      };
    })
  };
};