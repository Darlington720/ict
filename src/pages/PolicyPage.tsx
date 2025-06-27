import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Layout from '../components/layout/Layout';
import PolicyDashboard from '../components/policy/PolicyDashboard';
import PolicyAssessmentForm from '../components/policy/PolicyAssessmentForm';
import { PolicyAssessment } from '../types/policy';

const PolicyPage: React.FC = () => {
  const { schools, loading } = useData();
  const [assessments, setAssessments] = useState<PolicyAssessment[]>([]);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | undefined>();
  const [assessmentLevel, setAssessmentLevel] = useState<'school' | 'district' | 'national'>('school');

  const handleCreateAssessment = () => {
    setIsCreatingAssessment(true);
  };

  const handleAssessmentSubmit = async (assessment: PolicyAssessment) => {
    // In a real app, this would save to the database
    const newAssessment = {
      ...assessment,
      id: `assessment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    setIsCreatingAssessment(false);
    setSelectedSchool(undefined);
  };

  const handleCancel = () => {
    setIsCreatingAssessment(false);
    setSelectedSchool(undefined);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isCreatingAssessment ? (
        <PolicyAssessmentForm
          schoolId={selectedSchool}
          level={assessmentLevel}
          onSubmit={handleAssessmentSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <PolicyDashboard
          assessments={assessments}
          onCreateAssessment={handleCreateAssessment}
        />
      )}
    </Layout>
  );
};

export default PolicyPage;