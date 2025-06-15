import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { School } from '../../types';

interface VirtualizedSchoolListProps {
  schools: School[];
  onEditSchool: (schoolId: string) => void;
  onDeleteSchool: (schoolId: string) => void;
}

const ROW_HEIGHT = 73; // Height of each row including padding and borders

const VirtualizedSchoolList: React.FC<VirtualizedSchoolListProps> = ({
  schools,
  onEditSchool,
  onDeleteSchool,
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const school = schools[index];
    
    return (
      <div style={style} className="border-b border-gray-200 hover:bg-gray-50">
        <div className="px-6 py-4 flex items-center">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">{school.name}</div>
            <div className="text-sm text-gray-500">{school.contactInfo.principalName}</div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-900">{school.district}</div>
            <div className="text-sm text-gray-500">{school.subCounty}</div>
          </div>
          
          <div className="flex-1">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              school.type === 'Public' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {school.type}
            </span>
            <div className="text-sm text-gray-500 mt-1">{school.environment}</div>
          </div>
          
          <div className="flex-1 text-sm text-gray-500">
            {school.enrollmentData.totalStudents}
          </div>
          
          <div className="flex space-x-2">
            <Link
              to={`/schools/${school.id}`}
              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150"
            >
              <Eye className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onEditSchool(school.id)}
              className="text-amber-600 hover:text-amber-900 transition-colors duration-150"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDeleteSchool(school.id)}
              className="text-red-600 hover:text-red-900 transition-colors duration-150"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-[400px]">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex-1">School</div>
          <div className="flex-1">Location</div>
          <div className="flex-1">Type</div>
          <div className="flex-1">Students</div>
          <div className="w-24">Actions</div>
        </div>
      </div>
      
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height - 45} // Subtract header height
            itemCount={schools.length}
            itemSize={ROW_HEIGHT}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedSchoolList;