import React, { useState, useEffect } from 'react';
import { PolicyAssessment, PolicyTheme, SABERStage, PolicyThemeCode } from '../../types/policy';
import { SABER_POLICY_THEMES, CROSS_CUTTING_THEMES, STAGE_SCORES, STAGE_COLORS } from '../../data/saberFramework';
import { calculateThemeScore, determineStageFromScore, generatePolicyRecommendations } from '../../utils/policyCalculations';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';
import { 
  Save, 
  X, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Users,
  Calendar,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface PolicyAssessmentFormProps {
  schoolId?: string;
  districtId?: string;
  level: 'school' | 'district' | 'national';
  existingAssessment?: PolicyAssessment;
  onSubmit: (assessment: PolicyAssessment) => Promise<void>;
  onCancel: () => void;
}

const PolicyAssessmentForm: React.FC<PolicyAssessmentFormProps> = ({
  schoolId,
  districtId,
  level,
  existingAssessment,
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<PolicyAssessment>(() => {
    if (existingAssessment) return existingAssessment;
    
    // Initialize new assessment
    const themes: PolicyTheme[] = Object.values(SABER_POLICY_THEMES).map(themeData => ({
      id: `theme_${themeData.code}`,
      code: themeData.code,
      name: themeData.name,
      description: themeData.description,
      subThemes: themeData.subThemes.map(subTheme => ({
        id: `subtheme_${themeData.code}_${subTheme.code}`,
        code: subTheme.code,
        name: subTheme.name,
        description: subTheme.description,
        stage: 'Latent' as SABERStage,
        score: 25,
        evidence: [],
        lastAssessed: new Date().toISOString()
      })),
      overallScore: 25,
      stage: 'Latent' as SABERStage
    }));

    const crossCuttingThemes = Object.values(CROSS_CUTTING_THEMES).map(themeData => ({
      id: `cross_${themeData.code}`,
      code: themeData.code,
      name: themeData.name,
      description: themeData.description,
      stage: 'Latent' as SABERStage,
      score: 25,
      evidence: [],
      notes: ''
    }));

    return {
      id: '',
      schoolId,
      districtId,
      level,
      assessmentDate: new Date().toISOString().split('T')[0],
      assessorName: '',
      assessorRole: '',
      assessorEmail: '',
      themes,
      crossCuttingThemes,
      overallScore: 25,
      overallStage: 'Latent' as SABERStage,
      recommendations: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: Info },
    ...assessment.themes.map((theme, index) => ({
      id: theme.code,
      title: theme.name,
      icon: getThemeIcon(theme.code),
      subtitle: `${theme.subThemes.length} sub-themes`
    })),
    { id: 'cross-cutting', title: 'Cross-Cutting Themes', icon: Target },
    { id: 'review', title: 'Review & Submit', icon: CheckCircle }
  ];

  function getThemeIcon(themeCode: PolicyThemeCode) {
    const icons = {
      vision_planning: Target,
      ict_infrastructure: BarChart3,
      teachers: Users,
      skills_competencies: Lightbulb,
      learning_resources: FileText,
      emis: BarChart3,
      monitoring_evaluation: BarChart3,
      equity_inclusion_safety: Users
    };
    return icons[themeCode] || Info;
  }

  // Update overall scores when themes change
  useEffect(() => {
    const updatedThemes = assessment.themes.map(theme => ({
      ...theme,
      overallScore: calculateThemeScore(theme),
      stage: determineStageFromScore(calculateThemeScore(theme))
    }));

    const overallScore = updatedThemes.reduce((sum, theme) => sum + theme.overallScore, 0) / updatedThemes.length;
    const overallStage = determineStageFromScore(overallScore);
    const recommendations = generatePolicyRecommendations({
      ...assessment,
      themes: updatedThemes,
      overallScore,
      overallStage
    });

    setAssessment(prev => ({
      ...prev,
      themes: updatedThemes,
      overallScore: Math.round(overallScore),
      overallStage,
      recommendations
    }));
  }, [assessment.themes.map(t => t.subThemes.map(st => st.score).join(',')).join('|')]);

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepIndex === 0) {
      // Basic information validation
      if (!assessment.assessorName.trim()) {
        newErrors.assessorName = 'Assessor name is required';
      }
      if (!assessment.assessorRole.trim()) {
        newErrors.assessorRole = 'Assessor role is required';
      }
      if (!assessment.assessorEmail.trim()) {
        newErrors.assessorEmail = 'Assessor email is required';
      } else if (!/\S+@\S+\.\S+/.test(assessment.assessorEmail)) {
        newErrors.assessorEmail = 'Please enter a valid email address';
      }
      if (!assessment.assessmentDate) {
        newErrors.assessmentDate = 'Assessment date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubThemeScoreChange = (themeIndex: number, subThemeIndex: number, score: number) => {
    const stage = determineStageFromScore(score);
    
    setAssessment(prev => ({
      ...prev,
      themes: prev.themes.map((theme, tIndex) => 
        tIndex === themeIndex 
          ? {
              ...theme,
              subThemes: theme.subThemes.map((subTheme, stIndex) =>
                stIndex === subThemeIndex
                  ? { ...subTheme, score, stage, lastAssessed: new Date().toISOString() }
                  : subTheme
              )
            }
          : theme
      )
    }));
  };

  const handleCrossCuttingThemeChange = (themeIndex: number, score: number) => {
    const stage = determineStageFromScore(score);
    
    setAssessment(prev => ({
      ...prev,
      crossCuttingThemes: prev.crossCuttingThemes.map((theme, index) =>
        index === themeIndex
          ? { ...theme, score, stage }
          : theme
      )
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit({
        ...assessment,
        status: 'completed',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setErrors({ submit: 'Failed to submit assessment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="form-label">
            <Users className="inline h-4 w-4 mr-1" />
            Assessor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.assessorName ? 'border-red-500' : ''}`}
            value={assessment.assessorName}
            onChange={(e) => setAssessment(prev => ({ ...prev, assessorName: e.target.value }))}
            placeholder="Enter your full name"
          />
          {errors.assessorName && <p className="form-error">{errors.assessorName}</p>}
        </div>

        <div>
          <label className="form-label">
            Assessor Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.assessorRole ? 'border-red-500' : ''}`}
            value={assessment.assessorRole}
            onChange={(e) => setAssessment(prev => ({ ...prev, assessorRole: e.target.value }))}
            placeholder="e.g., Education Officer, Principal, ICT Coordinator"
          />
          {errors.assessorRole && <p className="form-error">{errors.assessorRole}</p>}
        </div>

        <div>
          <label className="form-label">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className={`form-input ${errors.assessorEmail ? 'border-red-500' : ''}`}
            value={assessment.assessorEmail}
            onChange={(e) => setAssessment(prev => ({ ...prev, assessorEmail: e.target.value }))}
            placeholder="your.email@example.com"
          />
          {errors.assessorEmail && <p className="form-error">{errors.assessorEmail}</p>}
        </div>

        <div>
          <label className="form-label">
            <Calendar className="inline h-4 w-4 mr-1" />
            Assessment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={`form-input ${errors.assessmentDate ? 'border-red-500' : ''}`}
            value={assessment.assessmentDate}
            onChange={(e) => setAssessment(prev => ({ ...prev, assessmentDate: e.target.value }))}
          />
          {errors.assessmentDate && <p className="form-error">{errors.assessmentDate}</p>}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">About SABER-ICT Assessment</h4>
            <p className="text-sm text-blue-700 mt-1">
              This assessment uses the World Bank's SABER-ICT framework to evaluate policy maturity across 8 core themes 
              and 6 cross-cutting areas. Each area is rated on a 4-stage scale: Latent, Emerging, Established, and Advanced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemeAssessment = (theme: PolicyTheme, themeIndex: number) => (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{theme.name}</h3>
        <p className="text-sm text-gray-600">{theme.description}</p>
        <div className="mt-3 flex items-center space-x-4">
          <div className="text-sm">
            <span className="font-medium">Current Score:</span>
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" 
                  style={{ 
                    backgroundColor: `${STAGE_COLORS[theme.stage]}20`, 
                    color: STAGE_COLORS[theme.stage] 
                  }}>
              {theme.overallScore}/100 ({theme.stage})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {theme.subThemes.map((subTheme, subThemeIndex) => (
          <div key={subTheme.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{subTheme.code} - {subTheme.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{subTheme.description}</p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold" style={{ color: STAGE_COLORS[subTheme.stage] }}>
                  {subTheme.score}
                </div>
                <div className="text-xs text-gray-500">{subTheme.stage}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development Stage
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['Latent', 'Emerging', 'Established', 'Advanced'] as SABERStage[]).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleSubThemeScoreChange(themeIndex, subThemeIndex, STAGE_SCORES[stage])}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        subTheme.stage === stage
                          ? 'border-current text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: subTheme.stage === stage ? STAGE_COLORS[stage] : 'transparent',
                        borderColor: subTheme.stage === stage ? STAGE_COLORS[stage] : undefined
                      }}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Score (0-100)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={subTheme.score}
                  onChange={(e) => handleSubThemeScoreChange(themeIndex, subThemeIndex, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${STAGE_COLORS.Latent} 0%, ${STAGE_COLORS.Emerging} 25%, ${STAGE_COLORS.Established} 62.5%, ${STAGE_COLORS.Advanced} 87.5%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCrossCuttingThemes = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-purple-900 mb-2">Cross-Cutting Themes</h3>
        <p className="text-sm text-purple-700">
          These themes cut across all policy areas and represent emerging priorities in ICT education policy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessment.crossCuttingThemes.map((theme, index) => (
          <div key={theme.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold" style={{ color: STAGE_COLORS[theme.stage] }}>
                  {theme.score}
                </div>
                <div className="text-xs text-gray-500">{theme.stage}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Development Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Latent', 'Emerging', 'Established', 'Advanced'] as SABERStage[]).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleCrossCuttingThemeChange(index, STAGE_SCORES[stage])}
                      className={`p-2 text-sm font-medium rounded-lg border-2 transition-all ${
                        theme.stage === stage
                          ? 'border-current text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: theme.stage === stage ? STAGE_COLORS[stage] : 'transparent',
                        borderColor: theme.stage === stage ? STAGE_COLORS[stage] : undefined
                      }}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={theme.score}
                  onChange={(e) => handleCrossCuttingThemeChange(index, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {assessment.overallScore}/100
          </div>
          <div className="text-lg font-medium text-green-800 mb-1">
            Overall Policy Maturity: {assessment.overallStage}
          </div>
          <p className="text-sm text-green-700">
            Based on assessment of {assessment.themes.length} core themes and {assessment.crossCuttingThemes.length} cross-cutting themes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Theme Scores">
          <div className="space-y-3">
            {assessment.themes.map((theme) => (
              <div key={theme.id} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">{theme.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold">{theme.overallScore}</span>
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: `${STAGE_COLORS[theme.stage]}20`, 
                      color: STAGE_COLORS[theme.stage] 
                    }}
                  >
                    {theme.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Key Recommendations">
          <div className="space-y-3">
            {assessment.recommendations.slice(0, 5).map((rec, index) => (
              <div key={rec.id} className="border-l-4 border-blue-500 pl-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mt-1">{rec.title}</h4>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {errors.submit && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-700">{errors.submit}</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 0) return renderBasicInformation();
    if (currentStep === steps.length - 2) return renderCrossCuttingThemes();
    if (currentStep === steps.length - 1) return renderReview();
    
    const themeIndex = currentStep - 1;
    return renderThemeAssessment(assessment.themes[themeIndex], themeIndex);
  };

  return (
    <div>
      <PageHeader 
        title="SABER-ICT Policy Assessment"
        description={`Evaluate policy maturity using the World Bank SABER-ICT framework`}
        action={
          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel Assessment
          </button>
        }
      />

      <div className="space-y-6">
        {/* Progress Steps */}
        <Card>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {steps[currentStep].title}
              </span>
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <Card>
          <div className="p-6">
            {renderStepContent()}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyAssessmentForm;