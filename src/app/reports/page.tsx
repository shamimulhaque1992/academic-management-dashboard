'use client';

import { useState } from 'react';
import { DepartmentPerformance } from '@/components/reports/DepartmentPerformance';
import { CourseEnrollmentTrends } from '@/components/reports/CourseEnrollmentTrends';
import { GradeDistribution } from '@/components/reports/GradeDistribution';
import { FacultyWorkload } from '@/components/reports/FacultyWorkload';
import { BarChart2, TrendingUp, PieChart, Users } from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'department',
    name: 'Department Performance',
    icon: BarChart2,
    component: DepartmentPerformance,
  },
  {
    id: 'enrollment',
    name: 'Course Enrollment Trends',
    icon: TrendingUp,
    component: CourseEnrollmentTrends,
  },
  {
    id: 'grades',
    name: 'Grade Distribution',
    icon: PieChart,
    component: GradeDistribution,
  },
  {
    id: 'faculty',
    name: 'Faculty Workload',
    icon: Users,
    component: FacultyWorkload,
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0].id);

  const CurrentReport = REPORT_TYPES.find(r => r.id === selectedReport)?.component || DepartmentPerformance;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-lg flex items-center gap-3 transition-colors ${
              selectedReport === report.id
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <report.icon className="h-5 w-5" />
            <span className="font-medium">{report.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CurrentReport />
      </div>
    </div>
  );
} 