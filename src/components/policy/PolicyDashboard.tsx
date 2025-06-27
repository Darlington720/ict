import React, { useState } from 'react';
import { PolicyAssessment, SABERStage } from '../../types/policy';
import { STAGE_COLORS } from '../../data/saberFramework';
import { calculateOverallPolicyScore, calculatePolicyTrends } from '../../utils/policyCalculations';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  School,
  BarChart3,
  FileText,
  Plus,
  Filter,
  Download
} from 'lucide-react';

interface PolicyDashboardProps {
  assessments: PolicyAssessment[];
  onCreateAssessment: () => void;
}

const PolicyDashboard: React.FC<PolicyDashboardProps> = ({ 
  assessments, 
  onCreateAssessment 
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'school' | 'district' | 'national'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed' | 'approved'>('all');

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const levelMatch = filterLevel === 'all' || assessment.level === filterLevel;
    const statusMatch = filterStatus === 'all' || assessment.status === filterStatus;
    return levelMatch && statusMatch;
  });

  // Calculate summary statistics
  const summaryStats = {
    total: filteredAssessments.length,
    completed: filteredAssessments.filter(a => a.status === 'completed' || a.status === 'approved').length,
    averageScore: filteredAssessments.length > 0 
      ? Math.round(filteredAssessments.reduce((sum, a) => sum + calculateOverallPolicyScore(a), 0) / filteredAssessments.length)
      : 0,
    stageDistribution: filteredAssessments.reduce((acc, assessment) => {
      const score = calculateOverallPolicyScore(assessment);
      const stage = score >= 87.5 ? 'Advanced' : score >= 62.5 ? 'Established' : score >= 37.5 ? 'Emerging' : 'Latent';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<SABERStage, number>)
  };

  // Prepare data for charts
  const stageDistributionData = Object.entries(summaryStats.stageDistribution).map(([stage, count]) => ({
    name: stage,
    value: count,
    percentage: ((count / filteredAssessments.length) * 100).toFixed(1)
  }));

  // Theme performance data
  const themePerformanceData = filteredAssessments.length > 0 
    ? filteredAssessments[0].themes.map(theme => {
        const avgScore = filteredAssessments.reduce((sum, assessment) => {
          const assessmentTheme = assessment.themes.find(t => t.code === theme.code);
          return sum + (assessmentTheme?.overallScore || 0);
        }, 0) / filteredAssessments.length;

        return {
          name: theme.name.replace(/\s+/g, '\n'),
          score: Math.round(avgScore),
          fullName: theme.name
        };
      })
    : [];

  // Recent assessments
  const recentAssessments = [...filteredAssessments]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Trend data (if multiple assessments exist)
  const trendData = calculatePolicyTrends(filteredAssessments);

  const getStageColor = (stage: SABERStage) => STAGE_COLORS[stage];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <PageHeader 
        title="Policy Assessment Dashboard"
        description="Monitor and analyze ICT education policy maturity using the SABER-ICT framework"
        action={
          <div className="flex space-x-2">
            <button
              onClick={() => {/* Export functionality */}}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </button>
            <button
              onClick={onCreateAssessment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="form-select w-auto"
            >
              <option value="all">All Levels</option>
              <option value="school">School Level</option>
              <option value="district">District Level</option>
              <option value="national">National Level</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="form-select w-auto"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-400 bg-opacity-30">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-blue-100 text-sm font-medium">Total Assessments</p>
                <h3 className="text-2xl font-bold">{summaryStats.total}</h3>
                <p className="text-blue-200 text-xs">
                  {summaryStats.completed} completed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-400 bg-opacity-30">
                <Target className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-green-100 text-sm font-medium">Average Score</p>
                <h3 className="text-2xl font-bold">{summaryStats.averageScore}/100</h3>
                <p className="text-green-200 text-xs">
                  Policy maturity level
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-400 bg-opacity-30">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-purple-100 text-sm font-medium">Advanced Level</p>
                <h3 className="text-2xl font-bold">{summaryStats.stageDistribution.Advanced || 0}</h3>
                <p className="text-purple-200 text-xs">
                  Assessments at advanced stage
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-400 bg-opacity-30">
                <Award className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-amber-100 text-sm font-medium">Completion Rate</p>
                <h3 className="text-2xl font-bold">
                  {summaryStats.total > 0 ? Math.round((summaryStats.completed / summaryStats.total) * 100) : 0}%
                </h3>
                <p className="text-amber-200 text-xs">
                  Assessment completion
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        {filteredAssessments.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <Card title="Policy Maturity Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stageDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStageColor(entry.name as SABERStage)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} assessments`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Theme Performance */}
            <Card title="Average Theme Performance">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={themePerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(label, payload) => {
                        const item = themePerformanceData.find(d => d.name === label);
                        return item?.fullName || label;
                      }}
                    />
                    <Bar dataKey="score" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Trend Analysis */}
        {trendData.length > 1 && (
          <Card title="Policy Development Trends">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="overallScore" 
                    stroke="#3B82F6" 
                    name="Overall Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Recent Assessments */}
        <Card title="Recent Assessments">
          {recentAssessments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentAssessments.map((assessment) => {
                    const score = calculateOverallPolicyScore(assessment);
                    const stage = score >= 87.5 ? 'Advanced' : score >= 62.5 ? 'Established' : score >= 37.5 ? 'Emerging' : 'Latent';
                    
                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.assessorName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assessment.schoolId ? 'School Assessment' : 
                               assessment.districtId ? 'District Assessment' : 
                               'National Assessment'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {assessment.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {score}/100
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getStageColor(stage as SABERStage)}20`, 
                              color: getStageColor(stage as SABERStage) 
                            }}
                          >
                            {stage}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(assessment.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {assessment.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No policy assessments found.</p>
              <p className="text-sm mt-2">Create your first assessment to get started.</p>
              <button
                onClick={onCreateAssessment}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Assessment
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PolicyDashboard;