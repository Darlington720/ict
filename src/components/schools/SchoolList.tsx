import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  PlusCircle, 
  Download,
  LayoutGrid,
  LayoutList,
  MapPin,
  Users,
  Mail,
  Phone,
  School as SchoolIcon,
  Loader
} from 'lucide-react';
import { School } from '../../types';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';
import VirtualizedSchoolList from './VirtualizedSchoolList';
import { useData } from '../../context/DataContext';

interface SchoolListProps {
  onAddSchool: () => void;
  onEditSchool: (schoolId: string) => void;
  onDeleteSchool: (schoolId: string) => void;
}

const SCHOOLS_PER_PAGE = 10;

const SchoolList: React.FC<SchoolListProps> = ({ 
  onAddSchool,
  onEditSchool,
  onDeleteSchool
}) => {
  const { fetchSchools, loading, error, totalSchools } = useData();
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [districts, setDistricts] = useState<string[]>([]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch schools when page, search, or filters change
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await fetchSchools(
          currentPage,
          SCHOOLS_PER_PAGE,
          debouncedSearch,
          filterDistrict
        );
        setSchools(response.data);
        
        // Update districts list if not already populated
        if (districts.length === 0) {
          const uniqueDistricts = Array.from(
            new Set(response.data.map(school => school.district))
          );
          setDistricts(uniqueDistricts);
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      }
    };

    loadSchools();
  }, [currentPage, debouncedSearch, filterDistrict, fetchSchools]);

  const totalPages = Math.ceil(totalSchools / SCHOOLS_PER_PAGE);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'District', 'Sub-County', 'Type', 'Environment', 'Total Students', 'Principal', 'Email', 'Phone'];
    const rows = schools.map(school => [
      school.name,
      school.district,
      school.subCounty,
      school.type,
      school.environment,
      school.enrollmentData.totalStudents,
      school.contactInfo.principalName,
      school.contactInfo.email,
      school.contactInfo.phone
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'schools_export.csv';
    link.click();
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading schools: {error}</p>
        <button
          onClick={() => fetchSchools(currentPage, SCHOOLS_PER_PAGE)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Schools" 
        description={`Manage and view all registered schools (${totalSchools} total)`}
        action={
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
            <button 
              onClick={onAddSchool}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add School
            </button>
          </div>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search schools..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${
                viewMode === 'table' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LayoutList className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className="h-[calc(100vh-300px)]">
                <VirtualizedSchoolList
                  schools={schools}
                  onEditSchool={onEditSchool}
                  onDeleteSchool={onDeleteSchool}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <div key={school.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{school.name}</h3>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {school.district}, {school.subCounty}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          school.type === 'Public' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {school.type}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            {school.enrollmentData.totalStudents} Students
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <SchoolIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">{school.environment}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`mailto:${school.contactInfo.email}`} className="text-blue-600 hover:text-blue-800">
                            {school.contactInfo.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`tel:${school.contactInfo.phone}`} className="text-blue-600 hover:text-blue-800">
                            {school.contactInfo.phone}
                          </a>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end space-x-2">
                        <Link
                          to={`/schools/${school.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                        <button
                          onClick={() => onEditSchool(school.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-amber-600 hover:bg-amber-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteSchool(school.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || loading}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * SCHOOLS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * SCHOOLS_PER_PAGE, totalSchools)}
                      </span>{' '}
                      of <span className="font-medium">{totalSchools}</span> schools
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          disabled={loading}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}

            {schools.length === 0 && !loading && (
              <div className="text-center py-4 text-gray-500">
                No schools found matching your search criteria.
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default SchoolList;