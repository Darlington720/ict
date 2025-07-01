import React, { useState } from 'react';
import { School } from '../../types';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';
import { 
  Save, 
  X, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  School as SchoolIcon,
  Monitor,
  Wifi,
  Settings,
  BookOpen,
  GraduationCap,
  Building,
  Globe,
  Loader,
  Navigation,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface SchoolFormProps {
  school?: School;
  onSubmit: (school: Omit<School, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

const SchoolForm: React.FC<SchoolFormProps> = ({ school, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: school?.name || '',
    district: school?.district || '',
    subCounty: school?.subCounty || '',
    latitude: school?.location.latitude || 0,
    longitude: school?.location.longitude || 0,
    type: school?.type || 'Public' as 'Public' | 'Private',
    environment: school?.environment || 'Urban' as 'Urban' | 'Rural',
    totalStudents: school?.enrollmentData.totalStudents || 0,
    maleStudents: school?.enrollmentData.maleStudents || 0,
    femaleStudents: school?.enrollmentData.femaleStudents || 0,
    principalName: school?.contactInfo.principalName || '',
    email: school?.contactInfo.email || '',
    phone: school?.contactInfo.phone || '',
    
    // Infrastructure
    studentComputers: school?.infrastructure?.studentComputers || 0,
    teacherComputers: school?.infrastructure?.teacherComputers || 0,
    projectors: school?.infrastructure?.projectors || 0,
    smartBoards: school?.infrastructure?.smartBoards || 0,
    tablets: school?.infrastructure?.tablets || 0,
    laptops: school?.infrastructure?.laptops || 0,
    hasComputerLab: school?.infrastructure?.hasComputerLab || false,
    labCondition: school?.infrastructure?.labCondition || 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor',
    powerBackup: school?.infrastructure?.powerBackup || [],
    hasICTRoom: school?.infrastructure?.hasICTRoom || false,
    hasElectricity: school?.infrastructure?.hasElectricity || false,
    
    // Internet
    connectionType: school?.internet?.connectionType || 'None' as 'None' | 'Fiber' | 'Mobile Broadband' | 'Satellite',
    bandwidthMbps: school?.internet?.bandwidthMbps || 0,
    wifiCoverage: school?.internet?.wifiCoverage || [],
    stability: school?.internet?.stability || 'Medium' as 'High' | 'Medium' | 'Low',
    hasUsagePolicy: school?.internet?.hasUsagePolicy || false,
    
    // Human Capacity
    totalTeachers: school?.humanCapacity?.totalTeachers || 0,
    ictTrainedTeachers: school?.humanCapacity?.ictTrainedTeachers || 0,
    supportStaff: school?.humanCapacity?.supportStaff || 0,
    teacherCompetencyLevel: school?.humanCapacity?.teacherCompetencyLevel || 'Basic' as 'Basic' | 'Intermediate' | 'Advanced'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [locationSuccess, setLocationSuccess] = useState(false);

    // Handle geolocation
    const getCurrentLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        return;
      }
  
      setIsGettingLocation(true);
      setLocationError('');
      setLocationSuccess(false);
  
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6))
          }));
          setIsGettingLocation(false);
          setLocationSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting your location.';
              break;
          }
          
          setLocationError(errorMessage);
          
          // Clear error message after 5 seconds
          setTimeout(() => setLocationError(''), 5000);
        },
        options
      );
    };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.subCounty.trim()) {
      newErrors.subCounty = 'Sub-county is required';
    }

    if (formData.latitude === 0 && formData.longitude === 0) {
      newErrors.location = 'Please provide valid coordinates or use "Get Current Location"';
    }

    if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (formData.totalStudents <= 0) {
      newErrors.totalStudents = 'Total students must be greater than 0';
    }

    if (formData.maleStudents + formData.femaleStudents !== formData.totalStudents) {
      newErrors.studentBreakdown = 'Male + Female students must equal total students';
    }

    if (!formData.principalName.trim()) {
      newErrors.principalName = 'Principal name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const schoolData: Omit<School, 'id'> & { id?: string } = {
      ...(school?.id && { id: school.id }),
      name: formData.name,
      district: formData.district,
      subCounty: formData.subCounty,
      location: {
        latitude: formData.latitude,
        longitude: formData.longitude
      },
      type: formData.type,
      environment: formData.environment,
      enrollmentData: {
        totalStudents: formData.totalStudents,
        maleStudents: formData.maleStudents,
        femaleStudents: formData.femaleStudents
      },
      contactInfo: {
        principalName: formData.principalName,
        email: formData.email,
        phone: formData.phone
      },
      infrastructure: {
        studentComputers: formData.studentComputers,
        teacherComputers: formData.teacherComputers,
        projectors: formData.projectors,
        smartBoards: formData.smartBoards,
        tablets: formData.tablets,
        laptops: formData.laptops,
        hasComputerLab: formData.hasComputerLab,
        labCondition: formData.labCondition,
        powerBackup: formData.powerBackup,
        hasICTRoom: formData.hasICTRoom,
        hasElectricity: formData.hasElectricity,
        hasSecureRoom: false,
        hasFurniture: false
      },
      internet: {
        connectionType: formData.connectionType,
        bandwidthMbps: formData.bandwidthMbps,
        wifiCoverage: formData.wifiCoverage,
        stability: formData.stability,
        hasUsagePolicy: formData.hasUsagePolicy,
        isStable: formData.stability === 'High'
      },
      humanCapacity: {
        ictTrainedTeachers: formData.ictTrainedTeachers,
        totalTeachers: formData.totalTeachers,
        maleTeachers: 0,
        femaleTeachers: 0,
        p5ToP7Teachers: 0,
        supportStaff: formData.supportStaff,
        monthlyTrainings: 0,
        teacherCompetencyLevel: formData.teacherCompetencyLevel,
        hasCapacityBuilding: false
      }
    };

    onSubmit(schoolData);
  };

  const handlePowerBackupChange = (source: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      powerBackup: checked 
        ? [...prev.powerBackup, source as any]
        : prev.powerBackup.filter(s => s !== source)
    }));
  };

  const handleWifiCoverageChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      wifiCoverage: checked 
        ? [...prev.wifiCoverage, area as any]
        : prev.wifiCoverage.filter(a => a !== area)
    }));
  };

  return (
    <div>
      <PageHeader 
        title={school ? 'Edit School' : 'Add New School'}
        description={school ? `Editing ${school.name}` : 'Register a new school in the system'}
        action={
          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schools
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <SchoolIcon className="inline h-4 w-4 mr-1" />
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            
            <div>
              <label className="form-label">
                <MapPin className="inline h-4 w-4 mr-1" />
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.district ? 'border-red-500' : ''}`}
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                required
              />
              {errors.district && <p className="form-error">{errors.district}</p>}
            </div>
            
            <div>
              <label className="form-label">
                Sub-County <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.subCounty ? 'border-red-500' : ''}`}
                value={formData.subCounty}
                onChange={(e) => setFormData(prev => ({ ...prev, subCounty: e.target.value }))}
                required
              />
              {errors.subCounty && <p className="form-error">{errors.subCounty}</p>}
            </div>
            
            <div>
              <label className="form-label">
                <Building className="inline h-4 w-4 mr-1" />
                School Type
              </label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'Public' | 'Private' }))}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                <Globe className="inline h-4 w-4 mr-1" />
                Environment
              </label>
              <select
                className="form-select"
                value={formData.environment}
                onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value as 'Urban' | 'Rural' }))}
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card title="School Location">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <MapPin className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Location Information</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Provide the exact coordinates of the school. You can use the "Get Current Location" button 
                    if you're currently at the school premises.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  className={`form-input ${errors.latitude ? 'border-red-500' : ''}`}
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 0.3476"
                  required
                />
                {errors.latitude && <p className="form-error">{errors.latitude}</p>}
                <p className="form-hint">Latitude should be between -90 and 90</p>
              </div>
              
              <div>
                <label className="form-label">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  className={`form-input ${errors.longitude ? 'border-red-500' : ''}`}
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 32.5825"
                  required
                />
                {errors.longitude && <p className="form-error">{errors.longitude}</p>}
                <p className="form-hint">Longitude should be between -180 and 180</p>
              </div>
            </div>

            {/* Get Current Location Button */}
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed max-w-xs"
              >
                {isGettingLocation ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Current Location
                  </>
                )}
              </button>

              {/* Location Status Messages */}
              {locationError && (
                <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Location Error</h4>
                    <p className="text-sm text-red-700 mt-1">{locationError}</p>
                  </div>
                </div>
              )}

              {locationSuccess && (
                <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Location Updated</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Coordinates have been updated with your current location.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errors.location && <p className="form-error">{errors.location}</p>}
          </div>
        </Card>

        {/* Student Enrollment */}
        <Card title="Student Enrollment">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">
                <Users className="inline h-4 w-4 mr-1" />
                Total Students <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`form-input ${errors.totalStudents ? 'border-red-500' : ''}`}
                value={formData.totalStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, totalStudents: parseInt(e.target.value) || 0 }))}
                required
              />
              {errors.totalStudents && <p className="form-error">{errors.totalStudents}</p>}
            </div>
            
            <div>
              <label className="form-label">
                Male Students
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.maleStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, maleStudents: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <label className="form-label">
                Female Students
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.femaleStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, femaleStudents: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          {errors.studentBreakdown && <p className="form-error">{errors.studentBreakdown}</p>}
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="form-label">
                <Users className="inline h-4 w-4 mr-1" />
                Principal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.principalName ? 'border-red-500' : ''}`}
                value={formData.principalName}
                onChange={(e) => setFormData(prev => ({ ...prev, principalName: e.target.value }))}
                required
              />
              {errors.principalName && <p className="form-error">{errors.principalName}</p>}
            </div>
            
            <div>
              <label className="form-label">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            
            <div>
              <label className="form-label">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+256-XXX-XXX-XXX"
                required
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
          </div>
        </Card>

        {/* ICT Infrastructure */}
        <Card title="ICT Infrastructure">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">
                  <Monitor className="inline h-4 w-4 mr-1" />
                  Student Computers
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.studentComputers}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentComputers: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="form-label">
                  Teacher Computers
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.teacherComputers}
                  onChange={(e) => setFormData(prev => ({ ...prev, teacherComputers: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="form-label">
                  Projectors
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.projectors}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectors: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="form-label">
                  Smart Boards
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.smartBoards}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartBoards: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">
                  Lab Condition
                </label>
                <select
                  className="form-select"
                  value={formData.labCondition}
                  onChange={(e) => setFormData(prev => ({ ...prev, labCondition: e.target.value as any }))}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="form-label">Power Backup</label>
                {['Solar', 'Generator', 'UPS'].map((source) => (
                  <label key={source} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={formData.powerBackup.includes(source as any)}
                      onChange={(e) => handlePowerBackupChange(source, e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-700">{source}</span>
                  </label>
                ))}
              </div>
              
              <div className="space-y-3">
                <label className="form-label">Facilities</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.hasComputerLab}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasComputerLab: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Computer Lab</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.hasICTRoom}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasICTRoom: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Has ICT Room</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.hasElectricity}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasElectricity: e.target.checked }))}
                  />
                  <span className="ml-2 text-sm text-gray-700">Has Electricity</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Internet Connectivity */}
        <Card title="Internet Connectivity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <Wifi className="inline h-4 w-4 mr-1" />
                Connection Type
              </label>
              <select
                className="form-select"
                value={formData.connectionType}
                onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value as any }))}
              >
                <option value="None">No Internet</option>
                <option value="Fiber">Fiber</option>
                <option value="Mobile Broadband">Mobile Broadband</option>
                <option value="Satellite">Satellite</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">
                Bandwidth (Mbps)
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.bandwidthMbps}
                onChange={(e) => setFormData(prev => ({ ...prev, bandwidthMbps: parseInt(e.target.value) || 0 }))}
                disabled={formData.connectionType === 'None'}
              />
            </div>
            
            <div>
              <label className="form-label">
                Connection Stability
              </label>
              <select
                className="form-select"
                value={formData.stability}
                onChange={(e) => setFormData(prev => ({ ...prev, stability: e.target.value as any }))}
                disabled={formData.connectionType === 'None'}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="form-label">WiFi Coverage Areas</label>
              {['Administration', 'Classrooms', 'Library', 'Dormitories'].map((area) => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={formData.wifiCoverage.includes(area as any)}
                    onChange={(e) => handleWifiCoverageChange(area, e.target.checked)}
                    disabled={formData.connectionType === 'None'}
                  />
                  <span className="ml-2 text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.hasUsagePolicy}
                onChange={(e) => setFormData(prev => ({ ...prev, hasUsagePolicy: e.target.checked }))}
              />
              <span className="ml-2 text-sm text-gray-700">Has Internet Usage Policy</span>
            </label>
          </div>
        </Card>

        {/* Human Capacity */}
        <Card title="Human Capacity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <Users className="inline h-4 w-4 mr-1" />
                Total Teachers
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.totalTeachers}
                onChange={(e) => setFormData(prev => ({ ...prev, totalTeachers: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <label className="form-label">
                <GraduationCap className="inline h-4 w-4 mr-1" />
                ICT-Trained Teachers
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalTeachers}
                className="form-input"
                value={formData.ictTrainedTeachers}
                onChange={(e) => setFormData(prev => ({ ...prev, ictTrainedTeachers: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <label className="form-label">
                <Settings className="inline h-4 w-4 mr-1" />
                ICT Support Staff
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.supportStaff}
                onChange={(e) => setFormData(prev => ({ ...prev, supportStaff: parseInt(e.target.value) || 0 }))}
              />
            </div>
            
            <div>
              <label className="form-label">
                Teacher ICT Competency Level
              </label>
              <select
                className="form-select"
                value={formData.teacherCompetencyLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, teacherCompetencyLevel: e.target.value as any }))}
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {school ? 'Update School' : 'Add School'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchoolForm;