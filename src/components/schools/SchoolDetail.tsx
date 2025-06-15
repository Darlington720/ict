import React, { useState } from 'react';
import { School, ICTReport } from '../../types';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { calculateICTReadinessLevel, getLatestReport } from '../../utils/calculations';
import { exportReportToPDF } from '../../utils/pdfExport';
import { 
  ArrowLeft, 
  Plus, 
  Download, 
  Edit, 
  Eye, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  School as SchoolIcon,
  Monitor,
  Wifi,
  Battery,
  BookOpen,
  GraduationCap,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Tablet,
  Printer,
  Projector,
  Globe,
  Zap,
  Clock,
  Target,
  Award,
  Info
} from 'lucide-react';

interface SchoolDetailProps {
  school: School;
  reports: ICTReport[];
  onAddReport: () => void;
  onBack: () => void;
  onUpdateReport: (report: ICTReport) => void;
}

const SchoolDetail: React.FC<SchoolDetailProps> = ({ 
  school, 
  reports, 
  onAddReport, 
  onBack,
  onUpdateReport 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'observations' | 'trends' | 'infrastructure'>('overview');
  const [editingReport, setEditingReport] = useState<ICTReport | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const latestReport = getLatestReport(school.id, reports);
  const { level: readinessLevel, score: readinessScore } = calculateICTReadinessLevel(reports);

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Prepare trend data
  const prepareTrendData = () => {
    return reports
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(report => ({
        period: report.period,
        teacherUsage: Math.round((report.usage.teachersUsingICT / report.usage.totalTeachers) * 100),
        studentLiteracy: report.usage.studentDigitalLiteracyRate,
        functionalDevices: report.infrastructure.functionalDevices,
        internetSpeed: report.infrastructure.internetSpeedMbps
      }));
  };

  const trendData = prepareTrendData();

  // Prepare infrastructure comparison data
  const prepareInfrastructureData = () => {
    if (!latestReport) return [];
    
    return [
      { name: 'Computers', value: latestReport.infrastructure.computers, icon: Monitor },
      { name: 'Tablets', value: latestReport.infrastructure.tablets, icon: Tablet },
      { name: 'Projectors', value: latestReport.infrastructure.projectors, icon: Projector },
      { name: 'Printers', value: latestReport.infrastructure.printers, icon: Printer }
    ];
  };

  const infrastructureData = prepareInfrastructureData();

  // Get observation summary for a report
  const getObservationSummary = (report: ICTReport) => {
    const teacherUsagePercent = Math.round((report.usage.teachersUsingICT / report.usage.totalTeachers) * 100);
    const trainedTeachersPercent = Math.round((report.capacity.ictTrainedTeachers / report.usage.totalTeachers) * 100);
    
    return {
      teacherUsagePercent,
      trainedTeachersPercent,
      hasInternet: report.infrastructure.internetConnection !== 'None',
      hasPowerBackup: report.infrastructure.powerBackup,
      functionalDevices: report.infrastructure.functionalDevices,
      studentLiteracy: report.usage.studentDigitalLiteracyRate
    };
  };

  // Get status color based on value and thresholds
  const getStatusColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return 'text-green-600 bg-green-100';
    if (value >= thresholds.fair) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (value >= thresholds.fair) return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <X className="h-4 w-4 text-red-500" />;
  };

  const COLORS = ['#1976D2', '#FFB300', '#388E3C', '#E53935'];

  return (
    <div>
      <PageHeader 
        title={school.name}
        description={`${school.district}, ${school.subCounty} • ${school.type} ${school.environment} School`}
        action={
          <div className="flex space-x-2">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools
            </button>
            <button
              onClick={onAddReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Observation
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: SchoolIcon },
            { id: 'observations', name: 'Periodic Observations', icon: Calendar },
            { id: 'trends', name: 'Trends & Analysis', icon: TrendingUp },
            { id: 'infrastructure', name: 'Infrastructure Details', icon: Monitor }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* School Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card title="School Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-500">{school.district}, {school.subCounty}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Enrollment</p>
                        <p className="text-sm text-gray-500">
                          {school.enrollmentData.totalStudents} students 
                          ({school.enrollmentData.maleStudents}M, {school.enrollmentData.femaleStudents}F)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <SchoolIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">School Type</p>
                        <p className="text-sm text-gray-500">{school.type} • {school.environment}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <a href={`mailto:${school.contactInfo.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                          {school.contactInfo.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <a href={`tel:${school.contactInfo.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                          {school.contactInfo.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Principal</p>
                        <p className="text-sm text-gray-500">{school.contactInfo.principalName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div>
              <Card title="ICT Readiness Level">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                    readinessLevel === 'High' ? 'bg-green-100 text-green-800' :
                    readinessLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {readinessLevel === 'High' && <Award className="h-5 w-5 mr-2" />}
                    {readinessLevel === 'Medium' && <Target className="h-5 w-5 mr-2" />}
                    {readinessLevel === 'Low' && <AlertCircle className="h-5 w-5 mr-2" />}
                    {readinessLevel} Readiness
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mt-4">{readinessScore}/100</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Based on {reports.length} observation{reports.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Latest Observation Summary */}
          {latestReport && (
            <Card title={`Latest Observation (${latestReport.period})`}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Monitor className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                  <div className="text-lg font-semibold text-blue-600">{latestReport.infrastructure.functionalDevices}</div>
                  <div className="text-xs text-blue-700">Functional Devices</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Wifi className="h-6 w-6 mx-auto text-green-600 mb-2" />
                  <div className="text-lg font-semibold text-green-600">
                    {latestReport.infrastructure.internetConnection}
                  </div>
                  <div className="text-xs text-green-700">Internet</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                  <div className="text-lg font-semibold text-purple-600">
                    {Math.round((latestReport.usage.teachersUsingICT / latestReport.usage.totalTeachers) * 100)}%
                  </div>
                  <div className="text-xs text-purple-700">Teacher ICT Usage</div>
                </div>
                
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <GraduationCap className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                  <div className="text-lg font-semibold text-amber-600">
                    {latestReport.usage.studentDigitalLiteracyRate}%
                  </div>
                  <div className="text-xs text-amber-700">Student Literacy</div>
                </div>
                
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto text-indigo-600 mb-2" />
                  <div className="text-lg font-semibold text-indigo-600">
                    {latestReport.usage.weeklyComputerLabHours}h
                  </div>
                  <div className="text-xs text-indigo-700">Weekly Lab Hours</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Battery className="h-6 w-6 mx-auto text-red-600 mb-2" />
                  <div className="text-lg font-semibold text-red-600">
                    {latestReport.infrastructure.powerBackup ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-red-700">Power Backup</div>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Infrastructure Overview */}
          {latestReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Device Inventory">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={infrastructureData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1976D2" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Software & Content">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Operating Systems</h4>
                    <div className="flex flex-wrap gap-2">
                      {latestReport.software.operatingSystems.length > 0 ? (
                        latestReport.software.operatingSystems.map((os) => (
                          <span key={os} className="tag-blue">{os}</span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No operating systems reported</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Educational Software</h4>
                    <div className="flex flex-wrap gap-2">
                      {latestReport.software.educationalSoftware.length > 0 ? (
                        latestReport.software.educationalSoftware.map((software) => (
                          <span key={software} className="tag-green">{software}</span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No educational software reported</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Office Applications</span>
                    <span className={`tag ${latestReport.software.officeApplications ? 'tag-green' : 'tag-red'}`}>
                      {latestReport.software.officeApplications ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'observations' && (
        <div className="space-y-6">
          {/* Observations Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Periodic Observations</h3>
              <p className="text-sm text-gray-500">
                {reports.length} observation{reports.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
            <button
              onClick={onAddReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Observation
            </button>
          </div>

          {/* Observations List */}
          <div className="space-y-4">
            {sortedReports.map((report) => {
              const summary = getObservationSummary(report);
              const isExpanded = expandedReport === report.id;

              return (
                <Card key={report.id}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">{report.period}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title={isExpanded ? "Collapse Details" : "View Details"}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => exportReportToPDF(school, report)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Monitor className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="text-sm font-medium text-blue-600">{summary.functionalDevices}</span>
                        </div>
                        <div className="text-xs text-blue-700">Devices</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          {summary.hasInternet ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-700">Internet</div>
                      </div>
                      
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          {summary.hasPowerBackup ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-gray-700">Power Backup</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-4 w-4 text-purple-600 mr-1" />
                          <span className="text-sm font-medium text-purple-600">{summary.teacherUsagePercent}%</span>
                        </div>
                        <div className="text-xs text-purple-700">Teacher Usage</div>
                      </div>
                      
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <GraduationCap className="h-4 w-4 text-indigo-600 mr-1" />
                          <span className="text-sm font-medium text-indigo-600">{summary.studentLiteracy}%</span>
                        </div>
                        <div className="text-xs text-indigo-700">Student Literacy</div>
                      </div>
                      
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                          <Settings className="h-4 w-4 text-red-600 mr-1" />
                          <span className="text-sm font-medium text-red-600">{summary.trainedTeachersPercent}%</span>
                        </div>
                        <div className="text-xs text-red-700">Trained Teachers</div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Infrastructure Details */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Monitor className="h-4 w-4 mr-2" />
                              Infrastructure Status
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Computers:</span>
                                <span className="font-medium">{report.infrastructure.computers}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tablets:</span>
                                <span className="font-medium">{report.infrastructure.tablets}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Projectors:</span>
                                <span className="font-medium">{report.infrastructure.projectors}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Printers:</span>
                                <span className="font-medium">{report.infrastructure.printers}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Internet Speed:</span>
                                <span className="font-medium">
                                  {report.infrastructure.internetConnection === 'None' 
                                    ? 'No Internet' 
                                    : `${report.infrastructure.internetSpeedMbps} Mbps`}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Power Sources:</span>
                                <span className="font-medium text-xs">{report.infrastructure.powerSource.join(', ')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Teaching & Learning */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Teaching & Learning
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Teachers Using ICT:</span>
                                <span className="font-medium">
                                  {report.usage.teachersUsingICT} of {report.usage.totalTeachers}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Weekly Lab Hours:</span>
                                <span className="font-medium">{report.usage.weeklyComputerLabHours}h</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Student Digital Literacy:</span>
                                <span className="font-medium">{report.usage.studentDigitalLiteracyRate}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>ICT-Trained Teachers:</span>
                                <span className="font-medium">
                                  {report.capacity.ictTrainedTeachers} of {report.usage.totalTeachers}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Support Staff:</span>
                                <span className="font-medium">{report.capacity.supportStaff}</span>
                              </div>
                            </div>
                          </div>

                          {/* Software & Content */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <Settings className="h-4 w-4 mr-2" />
                              Software & Content
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <span className="text-xs text-gray-600">Operating Systems:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {report.software.operatingSystems.map((os) => (
                                    <span key={os} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {os}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-600">Educational Software:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {report.software.educationalSoftware.length > 0 ? (
                                    report.software.educationalSoftware.map((software) => (
                                      <span key={software} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {software}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-500">None reported</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Office Applications:</span>
                                <span className="font-medium">
                                  {report.software.officeApplications ? 'Available' : 'Not Available'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {reports.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Observations Yet</h3>
                <p className="text-gray-500 mb-6">Start tracking ICT progress by adding your first periodic observation.</p>
                <button
                  onClick={onAddReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Observation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {trendData.length > 1 ? (
            <>
              <Card title="ICT Usage Trends Over Time">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="teacherUsage" 
                        stroke="#1976D2" 
                        name="Teacher ICT Usage (%)"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="studentLiteracy" 
                        stroke="#388E3C" 
                        name="Student Digital Literacy (%)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Infrastructure Development">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="functionalDevices" 
                        stroke="#FFB300" 
                        name="Functional Devices"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="internetSpeed" 
                        stroke="#E53935" 
                        name="Internet Speed (Mbps)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Insufficient Data for Trends</h3>
              <p className="text-gray-500 mb-6">Add more periodic observations to see trend analysis and progress over time.</p>
              <button
                onClick={onAddReport}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Observation
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'infrastructure' && latestReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Device Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={infrastructureData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {infrastructureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Infrastructure Status">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Monitor className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{latestReport.infrastructure.computers}</div>
                    <div className="text-sm text-blue-700">Computers</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Tablet className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-600">{latestReport.infrastructure.tablets}</div>
                    <div className="text-sm text-green-700">Tablets</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Projector className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{latestReport.infrastructure.projectors}</div>
                    <div className="text-sm text-purple-700">Projectors</div>
                  </div>
                  
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Printer className="h-8 w-8 mx-auto text-amber-600 mb-2" />
                    <div className="text-2xl font-bold text-amber-600">{latestReport.infrastructure.printers}</div>
                    <div className="text-sm text-amber-700">Printers</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Functional Devices:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {latestReport.infrastructure.functionalDevices} / {
                        latestReport.infrastructure.computers + 
                        latestReport.infrastructure.tablets + 
                        latestReport.infrastructure.projectors + 
                        latestReport.infrastructure.printers
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Connectivity & Power">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Wifi className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-medium">Internet Connection</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    latestReport.infrastructure.internetConnection === 'Fast' ? 'bg-green-100 text-green-800' :
                    latestReport.infrastructure.internetConnection === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    latestReport.infrastructure.internetConnection === 'Slow' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {latestReport.infrastructure.internetConnection}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm font-medium">Internet Speed</span>
                  </div>
                  <span className="text-sm font-medium">
                    {latestReport.infrastructure.internetConnection === 'None' 
                      ? 'N/A' 
                      : `${latestReport.infrastructure.internetSpeedMbps} Mbps`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-amber-600 mr-3" />
                    <span className="text-sm font-medium">Power Sources</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {latestReport.infrastructure.powerSource.map((source) => (
                      <span key={source} className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                        {source === 'NationalGrid' ? 'Grid' : source}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Battery className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-sm font-medium">Power Backup</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    latestReport.infrastructure.powerBackup ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {latestReport.infrastructure.powerBackup ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Software Environment">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Operating Systems</h4>
                  <div className="flex flex-wrap gap-2">
                    {latestReport.software.operatingSystems.length > 0 ? (
                      latestReport.software.operatingSystems.map((os) => (
                        <span key={os} className="tag-blue">{os}</span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No operating systems reported</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Educational Software</h4>
                  <div className="flex flex-wrap gap-2">
                    {latestReport.software.educationalSoftware.length > 0 ? (
                      latestReport.software.educationalSoftware.map((software) => (
                        <span key={software} className="tag-green">{software}</span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No educational software reported</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Office Applications</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    latestReport.software.officeApplications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {latestReport.software.officeApplications ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolDetail;