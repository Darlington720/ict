import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import SchoolDetail from '../components/schools/SchoolDetail';
import PeriodicObservationForm from '../components/reports/PeriodicObservationForm';
import Layout from '../components/layout/Layout';

const SchoolDetailPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const { schools, reports, loading, addReport, updateReport } = useData();
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const navigate = useNavigate();

  const school = schools.find(s => s.id === schoolId);

  const handleAddObservation = () => {
    setIsAddingObservation(true);
  };

  const handleObservationSubmit = async (reportData: any) => {
    if (reportData.id) {
      await updateReport(reportData);
    } else {
      await addReport(reportData);
    }
    setIsAddingObservation(false);
  };

  const handleCancel = () => {
    setIsAddingObservation(false);
  };

  const handleBack = () => {
    navigate('/schools');
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

  if (!school) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">School not found</h2>
          <p className="mt-2 text-gray-600">The school you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/schools')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Schools
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {isAddingObservation ? (
        <PeriodicObservationForm 
          school={school}
          onSubmit={handleObservationSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <SchoolDetail
          school={school}
          reports={reports.filter(r => r.schoolId === schoolId)}
          onAddReport={handleAddObservation}
          onBack={handleBack}
          onUpdateReport={updateReport}
        />
      )}
    </Layout>
  );
};

export default SchoolDetailPage;