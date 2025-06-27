import React, { createContext, useContext, useState, useEffect } from 'react';
import { School, ICTReport } from '../types';
import { calculateSchoolPolicyMaturity } from '../utils/schoolPolicyMaturity';
import mockSchoolsData from '../data/mockSchools.json';
import mockReportsData from '../data/mockReports.json';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface DataContextType {
  schools: School[];
  reports: ICTReport[];
  addSchool: (school: Omit<School, 'id'>) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  addReport: (report: Omit<ICTReport, 'id'>) => Promise<void>;
  updateReport: (report: ICTReport) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  fetchSchools: (page: number, pageSize: number, search?: string, district?: string) => Promise<PaginatedResponse<School>>;
  totalSchools: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [reports, setReports] = useState<ICTReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSchools, setTotalSchools] = useState<number>(0);

  // Simulate API delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Enrich schools with policy maturity data
  const enrichSchoolsWithPolicyMaturity = (schoolsData: School[], reportsData: ICTReport[]): School[] => {
    return schoolsData.map(school => {
      const schoolReports = reportsData.filter(report => report.schoolId === school.id);
      const policyMaturity = calculateSchoolPolicyMaturity(school, schoolReports);
      
      return {
        ...school,
        policyMaturity
      };
    });
  };

  // Fetch schools with pagination and filtering
  const fetchSchools = async (
    page: number, 
    pageSize: number, 
    search?: string,
    district?: string
  ): Promise<PaginatedResponse<School>> => {
    try {
      setLoading(false);
      // await delay(500); // Simulate network delay

      let filteredSchools = [...mockSchoolsData.schools];

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredSchools = filteredSchools.filter(school => 
          school.name.toLowerCase().includes(searchLower) ||
          school.district.toLowerCase().includes(searchLower)
        );
      }

      // Apply district filter
      if (district) {
        filteredSchools = filteredSchools.filter(school => 
          school.district === district
        );
      }

      // Calculate pagination
      const total = filteredSchools.length;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedSchools = filteredSchools.slice(start, end);

      // Enrich with policy maturity
      const enrichedSchools = enrichSchoolsWithPolicyMaturity(paginatedSchools, reports);

      setTotalSchools(total);
      setSchools(enrichedSchools);

      return {
        data: enrichedSchools,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schools');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setReports(mockReportsData.reports);
        await fetchSchools(1, 10);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      }
    };

    loadInitialData();
  }, []);

  // Generate a unique ID
  const generateId = (prefix: string): string => {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
  };

  const addSchool = async (schoolData: Omit<School, 'id'>): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      const newSchool: School = {
        ...schoolData,
        id: generateId('SCH')
      };
      
      // Calculate policy maturity for new school
      const schoolReports = reports.filter(r => r.schoolId === newSchool.id);
      const policyMaturity = calculateSchoolPolicyMaturity(newSchool, schoolReports);
      newSchool.policyMaturity = policyMaturity;
      
      setSchools(prevSchools => [...prevSchools, newSchool]);
      setTotalSchools(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (school: School): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      // Recalculate policy maturity
      const schoolReports = reports.filter(r => r.schoolId === school.id);
      const policyMaturity = calculateSchoolPolicyMaturity(school, schoolReports);
      const updatedSchool = { ...school, policyMaturity };

      setSchools(prevSchools => 
        prevSchools.map(s => s.id === school.id ? updatedSchool : s)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      setSchools(prevSchools => prevSchools.filter(s => s.id !== id));
      setReports(prevReports => prevReports.filter(r => r.schoolId !== id));
      setTotalSchools(prev => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete school');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData: Omit<ICTReport, 'id'>): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      const newReport: ICTReport = {
        ...reportData,
        id: generateId('RPT')
      };
      
      setReports(prevReports => [...prevReports, newReport]);

      // Update policy maturity for the affected school
      const school = schools.find(s => s.id === reportData.schoolId);
      if (school) {
        const schoolReports = [...reports, newReport].filter(r => r.schoolId === school.id);
        const policyMaturity = calculateSchoolPolicyMaturity(school, schoolReports);
        const updatedSchool = { ...school, policyMaturity };
        
        setSchools(prevSchools => 
          prevSchools.map(s => s.id === school.id ? updatedSchool : s)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (report: ICTReport): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      setReports(prevReports => 
        prevReports.map(r => r.id === report.id ? report : r)
      );

      // Update policy maturity for the affected school
      const school = schools.find(s => s.id === report.schoolId);
      if (school) {
        const schoolReports = reports.map(r => r.id === report.id ? report : r)
          .filter(r => r.schoolId === school.id);
        const policyMaturity = calculateSchoolPolicyMaturity(school, schoolReports);
        const updatedSchool = { ...school, policyMaturity };
        
        setSchools(prevSchools => 
          prevSchools.map(s => s.id === school.id ? updatedSchool : s)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await delay(500);

      const reportToDelete = reports.find(r => r.id === id);
      setReports(prevReports => prevReports.filter(r => r.id !== id));

      // Update policy maturity for the affected school
      if (reportToDelete) {
        const school = schools.find(s => s.id === reportToDelete.schoolId);
        if (school) {
          const schoolReports = reports.filter(r => r.id !== id && r.schoolId === school.id);
          const policyMaturity = calculateSchoolPolicyMaturity(school, schoolReports);
          const updatedSchool = { ...school, policyMaturity };
          
          setSchools(prevSchools => 
            prevSchools.map(s => s.id === school.id ? updatedSchool : s)
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        schools,
        reports,
        addSchool,
        updateSchool,
        deleteSchool,
        addReport,
        updateReport,
        deleteReport,
        loading,
        error,
        fetchSchools,
        totalSchools
      }}
    >
      {children}
    </DataContext.Provider>
  );
};