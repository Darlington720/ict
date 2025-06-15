import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import SchoolList from '../components/schools/SchoolList';
import SchoolForm from '../components/schools/SchoolForm';
import Layout from '../components/layout/Layout';
import { School } from '../types';

const SchoolsPage: React.FC = () => {
  const { schools, loading, addSchool, updateSchool, deleteSchool } = useData();
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const navigate = useNavigate();

  const handleAddSchool = () => {
    setIsAddingSchool(true);
    setEditingSchool(null);
  };

  const handleEditSchool = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setEditingSchool(school);
      setIsAddingSchool(false);
    }
  };

  const handleDeleteSchool = (schoolId: string) => {
    if (window.confirm('Are you sure you want to delete this school? This will also delete all associated ICT reports.')) {
      deleteSchool(schoolId);
    }
  };

  const handleSchoolSubmit = (schoolData: Omit<School, 'id'> & { id?: string }) => {
    if (schoolData.id) {
      updateSchool(schoolData as School);
      setEditingSchool(null);
    } else {
      addSchool(schoolData);
      setIsAddingSchool(false);
    }
  };

  const handleCancel = () => {
    setIsAddingSchool(false);
    setEditingSchool(null);
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
      {isAddingSchool ? (
        <SchoolForm onSubmit={handleSchoolSubmit} onCancel={handleCancel} />
      ) : editingSchool ? (
        <SchoolForm school={editingSchool} onSubmit={handleSchoolSubmit} onCancel={handleCancel} />
      ) : (
        <SchoolList
          schools={schools}
          onAddSchool={handleAddSchool}
          onEditSchool={handleEditSchool}
          onDeleteSchool={handleDeleteSchool}
        />
      )}
    </Layout>
  );
};

export default SchoolsPage;