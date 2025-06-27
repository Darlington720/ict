/**
 * School Policy Maturity Calculation
 * Based on SABER-ICT framework principles without explicit naming
 */

import { School, ICTReport, SchoolPolicyMaturity, ProgressStage, ICTReadinessLevel, PolicyThemeScore } from '../types';
import { getLatestReport } from './calculations';

/**
 * Determines progress stage based on score
 */
export const determineProgressStage = (score: number): ProgressStage => {
  if (score >= 87.5) return 'Advanced';
  if (score >= 62.5) return 'Established';
  if (score >= 37.5) return 'Emerging';
  return 'Latent';
};

/**
 * Determines ICT readiness level based on overall score
 */
export const determineICTReadinessLevel = (score: number): ICTReadinessLevel => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
};

/**
 * Calculate Vision and Planning theme score
 */
const calculateVisionPlanningScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 1.1 Vision/Goals - Based on governance data
  const visionScore = school.governance?.hasICTPolicy ? 75 : 
                     school.governance?.alignedWithNationalStrategy ? 50 : 25;
  subScores.vision = { name: 'Vision/Goals', score: visionScore, stage: determineProgressStage(visionScore) };

  // 1.2 Sectoral Linkages - Based on alignment and coordination
  const linkagesScore = school.governance?.alignedWithNationalStrategy ? 75 : 
                       school.governance?.hasICTCommittee ? 50 : 25;
  subScores.linkages = { name: 'Sectoral Linkages', score: linkagesScore, stage: determineProgressStage(linkagesScore) };

  // 1.3 Funding - Based on budget allocation
  const fundingScore = school.governance?.hasICTBudget ? 75 : 
                      (latestReport?.infrastructure.functionalDevices || 0) > 10 ? 50 : 25;
  subScores.funding = { name: 'Funding', score: fundingScore, stage: determineProgressStage(fundingScore) };

  // 1.4 Institutions - Based on organizational structure
  const institutionsScore = school.governance?.hasICTCommittee ? 75 : 
                           (latestReport?.capacity.supportStaff || 0) > 0 ? 50 : 25;
  subScores.institutions = { name: 'Institutions', score: institutionsScore, stage: determineProgressStage(institutionsScore) };

  // 1.5 Public-Private Partnerships
  const partnershipScore = school.communityEngagement?.hasIndustryPartners ? 75 : 
                          school.communityEngagement?.partnerOrganizations?.length ? 50 : 25;
  subScores.partnerships = { name: 'Public-Private Partnerships', score: partnershipScore, stage: determineProgressStage(partnershipScore) };

  totalScore = (visionScore + linkagesScore + fundingScore + institutionsScore + partnershipScore) / 5;

  return {
    code: 'vision_planning',
    name: 'Vision and Planning',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate ICT Infrastructure theme score
 */
const calculateICTInfrastructureScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 2.1 Electricity
  const electricityScore = school.infrastructure?.hasElectricity ? 
    (school.infrastructure.powerBackup?.length ? 100 : 75) : 25;
  subScores.electricity = { name: 'Electricity', score: electricityScore, stage: determineProgressStage(electricityScore) };

  // 2.2 Equipment/Networking
  const totalDevices = (latestReport?.infrastructure.computers || 0) + 
                      (latestReport?.infrastructure.tablets || 0) + 
                      (latestReport?.infrastructure.projectors || 0);
  const equipmentScore = totalDevices >= 50 ? 100 : 
                        totalDevices >= 25 ? 75 : 
                        totalDevices >= 10 ? 50 : 25;
  subScores.equipment = { name: 'Equipment/Networking', score: equipmentScore, stage: determineProgressStage(equipmentScore) };

  // 2.3 Support/Maintenance
  const supportScore = (latestReport?.capacity.supportStaff || 0) >= 2 ? 100 :
                      (latestReport?.capacity.supportStaff || 0) >= 1 ? 75 : 25;
  subScores.support = { name: 'Support/Maintenance', score: supportScore, stage: determineProgressStage(supportScore) };

  totalScore = (electricityScore + equipmentScore + supportScore) / 3;

  return {
    code: 'ict_infrastructure',
    name: 'ICT Infrastructure',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate Teachers theme score
 */
const calculateTeachersScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  const totalTeachers = latestReport?.usage.totalTeachers || school.humanCapacity?.totalTeachers || 1;
  const trainedTeachers = latestReport?.capacity.ictTrainedTeachers || school.humanCapacity?.ictTrainedTeachers || 0;
  const teachersUsingICT = latestReport?.usage.teachersUsingICT || 0;

  // 3.1 Training
  const trainingRate = (trainedTeachers / totalTeachers) * 100;
  const trainingScore = trainingRate >= 80 ? 100 : 
                       trainingRate >= 60 ? 75 : 
                       trainingRate >= 30 ? 50 : 25;
  subScores.training = { name: 'Training', score: trainingScore, stage: determineProgressStage(trainingScore) };

  // 3.2 Competency Standards
  const competencyScore = school.humanCapacity?.teacherCompetencyLevel === 'Advanced' ? 100 :
                         school.humanCapacity?.teacherCompetencyLevel === 'Intermediate' ? 75 :
                         school.humanCapacity?.teacherCompetencyLevel === 'Basic' ? 50 : 25;
  subScores.competency = { name: 'Competency Standards', score: competencyScore, stage: determineProgressStage(competencyScore) };

  // 3.3 Networks/Resource Centers
  const networkScore = school.humanCapacity?.hasCapacityBuilding ? 75 : 
                      school.humanCapacity?.monthlyTrainings ? 50 : 25;
  subScores.networks = { name: 'Networks/Resource Centers', score: networkScore, stage: determineProgressStage(networkScore) };

  // 3.4 Leadership Training
  const leadershipScore = school.governance?.hasICTCommittee ? 75 : 50;
  subScores.leadership = { name: 'Leadership Training', score: leadershipScore, stage: determineProgressStage(leadershipScore) };

  totalScore = (trainingScore + competencyScore + networkScore + leadershipScore) / 4;

  return {
    code: 'teachers',
    name: 'Teachers',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate Skills and Competencies theme score
 */
const calculateSkillsCompetenciesScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 4.1 Digital Literacy
  const studentLiteracyRate = latestReport?.usage.studentDigitalLiteracyRate || 0;
  const digitalLiteracyScore = studentLiteracyRate >= 80 ? 100 : 
                              studentLiteracyRate >= 60 ? 75 : 
                              studentLiteracyRate >= 30 ? 50 : 25;
  subScores.digitalLiteracy = { name: 'Digital Literacy', score: digitalLiteracyScore, stage: determineProgressStage(digitalLiteracyScore) };

  // 4.2 Lifelong Learning
  const lifeLongScore = school.pedagogicalUsage?.usesBlendedLearning ? 75 : 
                       school.pedagogicalUsage?.hasDigitalContent ? 50 : 25;
  subScores.lifeLong = { name: 'Lifelong Learning', score: lifeLongScore, stage: determineProgressStage(lifeLongScore) };

  totalScore = (digitalLiteracyScore + lifeLongScore) / 2;

  return {
    code: 'skills_competencies',
    name: 'Skills and Competencies',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate Learning Resources theme score
 */
const calculateLearningResourcesScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 5.1 Digital Content
  const hasEducationalSoftware = (latestReport?.software.educationalSoftware?.length || 0) > 0;
  const hasDigitalLibrary = school.software?.hasDigitalLibrary || false;
  const hasLocalContent = school.software?.hasLocalContent || false;

  const contentScore = hasDigitalLibrary && hasLocalContent ? 100 :
                      hasEducationalSoftware ? 75 :
                      hasDigitalLibrary || hasLocalContent ? 50 : 25;
  
  subScores.digitalContent = { name: 'Digital Content', score: contentScore, stage: determineProgressStage(contentScore) };

  totalScore = contentScore;

  return {
    code: 'learning_resources',
    name: 'Learning Resources',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate EMIS theme score
 */
const calculateEMISScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 6.1 ICT in Management
  const hasLMS = school.software?.hasLMS || false;
  const hasMonitoring = school.governance?.hasMonitoringSystem || false;
  const usesICTAssessments = school.pedagogicalUsage?.usesICTAssessments || false;

  const managementScore = hasLMS && hasMonitoring ? 100 :
                         hasLMS || hasMonitoring ? 75 :
                         usesICTAssessments ? 50 : 25;

  subScores.management = { name: 'ICT in Management', score: managementScore, stage: determineProgressStage(managementScore) };

  totalScore = managementScore;

  return {
    code: 'emis',
    name: 'EMIS',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate Monitoring & Evaluation theme score
 */
const calculateMonitoringEvaluationScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 7.1 Impact Measurement
  const hasMonitoring = school.governance?.hasMonitoringSystem || false;
  const impactScore = hasMonitoring ? 75 : 25;
  subScores.impact = { name: 'Impact Measurement', score: impactScore, stage: determineProgressStage(impactScore) };

  // 7.2 ICT in Assessments
  const usesICTAssessments = school.pedagogicalUsage?.usesICTAssessments || false;
  const assessmentScore = usesICTAssessments ? 75 : 25;
  subScores.assessments = { name: 'ICT in Assessments', score: assessmentScore, stage: determineProgressStage(assessmentScore) };

  // 7.3 R&D/Innovation
  const hasInnovations = school.performance?.innovations || false;
  const rdScore = hasInnovations ? 75 : 25;
  subScores.rd = { name: 'R&D/Innovation', score: rdScore, stage: determineProgressStage(rdScore) };

  totalScore = (impactScore + assessmentScore + rdScore) / 3;

  return {
    code: 'monitoring_evaluation',
    name: 'Monitoring & Evaluation',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate Equity, Inclusion, Safety theme score
 */
const calculateEquityInclusionSafetyScore = (school: School, latestReport?: ICTReport): PolicyThemeScore => {
  let totalScore = 0;
  let subScores: any = {};

  // 8.1 Pro-Equity
  const isInclusive = school.accessibility?.isInclusive || false;
  const servesPWDs = school.accessibility?.servesPWDs || false;
  const servesGirls = school.accessibility?.servesGirls || false;
  
  const equityScore = isInclusive && servesPWDs && servesGirls ? 100 :
                     (isInclusive || servesPWDs || servesGirls) ? 75 : 50;
  subScores.equity = { name: 'Pro-Equity', score: equityScore, stage: determineProgressStage(equityScore) };

  // 8.2 Digital Safety
  const hasUsagePolicy = school.internet?.hasUsagePolicy || false;
  const safetyScore = hasUsagePolicy ? 75 : 25;
  subScores.safety = { name: 'Digital Safety', score: safetyScore, stage: determineProgressStage(safetyScore) };

  totalScore = (equityScore + safetyScore) / 2;

  return {
    code: 'equity_inclusion_safety',
    name: 'Equity, Inclusion, Safety',
    score: Math.round(totalScore),
    stage: determineProgressStage(totalScore),
    subScores
  };
};

/**
 * Calculate cross-cutting themes scores
 */
const calculateCrossCuttingThemes = (school: School, latestReport?: ICTReport) => {
  // Distance Education
  const distanceEducationScore = school.pedagogicalUsage?.usesBlendedLearning ? 75 : 
                                school.software?.hasLMS ? 50 : 25;

  // Mobile Learning
  const mobileScore = school.pedagogicalUsage?.digitalToolUsageFrequency === 'Daily' ? 75 : 
                     school.pedagogicalUsage?.digitalToolUsageFrequency === 'Weekly' ? 50 : 25;

  // Early Childhood Development
  const earlyChildhoodScore = 50; // Default as primary schools

  // Open Educational Resources
  const oerScore = school.software?.hasLocalContent ? 75 : 
                  school.software?.hasDigitalLibrary ? 50 : 25;

  // Community Involvement
  const communityScore = school.communityEngagement?.hasParentPortal ? 75 : 
                        school.communityEngagement?.hasCommunityOutreach ? 50 : 25;

  // Data Privacy
  const privacyScore = school.internet?.hasUsagePolicy ? 75 : 25;

  return {
    distanceEducation: { score: distanceEducationScore, stage: determineProgressStage(distanceEducationScore) },
    mobiles: { score: mobileScore, stage: determineProgressStage(mobileScore) },
    earlyChildhood: { score: earlyChildhoodScore, stage: determineProgressStage(earlyChildhoodScore) },
    openEducationalResources: { score: oerScore, stage: determineProgressStage(oerScore) },
    communityInvolvement: { score: communityScore, stage: determineProgressStage(communityScore) },
    dataPrivacy: { score: privacyScore, stage: determineProgressStage(privacyScore) }
  };
};

/**
 * Calculate data completeness percentage
 */
const calculateDataCompleteness = (school: School, latestReport?: ICTReport): number => {
  let totalFields = 0;
  let completedFields = 0;

  // Check school data completeness
  const checkObject = (obj: any, weight: number = 1) => {
    if (!obj) return;
    
    Object.values(obj).forEach(value => {
      totalFields += weight;
      if (value !== undefined && value !== null && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        completedFields += weight;
      }
    });
  };

  checkObject(school.infrastructure, 2);
  checkObject(school.internet, 2);
  checkObject(school.software, 1);
  checkObject(school.humanCapacity, 2);
  checkObject(school.pedagogicalUsage, 1);
  checkObject(school.governance, 2);
  checkObject(school.studentEngagement, 1);
  checkObject(school.communityEngagement, 1);

  if (latestReport) {
    checkObject(latestReport.infrastructure, 2);
    checkObject(latestReport.usage, 2);
    checkObject(latestReport.software, 1);
    checkObject(latestReport.capacity, 2);
  }

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

/**
 * Main function to calculate school policy maturity
 */
export const calculateSchoolPolicyMaturity = (school: School, reports: ICTReport[]): SchoolPolicyMaturity => {
  const latestReport = getLatestReport(school.id, reports);
  
  // Calculate all theme scores
  const visionPlanning = calculateVisionPlanningScore(school, latestReport);
  const ictInfrastructure = calculateICTInfrastructureScore(school, latestReport);
  const teachers = calculateTeachersScore(school, latestReport);
  const skillsCompetencies = calculateSkillsCompetenciesScore(school, latestReport);
  const learningResources = calculateLearningResourcesScore(school, latestReport);
  const emis = calculateEMISScore(school, latestReport);
  const monitoringEvaluation = calculateMonitoringEvaluationScore(school, latestReport);
  const equityInclusionSafety = calculateEquityInclusionSafetyScore(school, latestReport);
  
  // Calculate cross-cutting themes
  const crossCuttingThemes = calculateCrossCuttingThemes(school, latestReport);
  
  // Calculate overall score (weighted average of core themes)
  const coreThemes = [
    visionPlanning, ictInfrastructure, teachers, skillsCompetencies,
    learningResources, emis, monitoringEvaluation, equityInclusionSafety
  ];
  
  const overallScore = Math.round(
    coreThemes.reduce((sum, theme) => sum + theme.score, 0) / coreThemes.length
  );
  
  const overallStage = determineProgressStage(overallScore);
  const ictReadinessLevel = determineICTReadinessLevel(overallScore);
  const dataCompleteness = calculateDataCompleteness(school, latestReport);

  return {
    overallScore,
    overallStage,
    ictReadinessLevel,
    visionPlanning,
    ictInfrastructure,
    teachers,
    skillsCompetencies,
    learningResources,
    emis,
    monitoringEvaluation,
    equityInclusionSafety,
    crossCuttingThemes,
    lastCalculated: new Date().toISOString(),
    dataCompleteness
  };
};

/**
 * Get stage color for UI display
 */
export const getProgressStageColor = (stage: ProgressStage): string => {
  switch (stage) {
    case 'Advanced': return '#10B981'; // Green
    case 'Established': return '#3B82F6'; // Blue
    case 'Emerging': return '#F59E0B'; // Amber
    case 'Latent': return '#EF4444'; // Red
    default: return '#6B7280'; // Gray
  }
};

/**
 * Get ICT readiness level color for UI display
 */
export const getICTReadinessColor = (level: ICTReadinessLevel): string => {
  switch (level) {
    case 'High': return '#10B981'; // Green
    case 'Medium': return '#F59E0B'; // Amber
    case 'Low': return '#EF4444'; // Red
    default: return '#6B7280'; // Gray
  }
};