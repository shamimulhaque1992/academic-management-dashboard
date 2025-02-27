'use client';

import { useState } from 'react';
import { DepartmentPerformance } from '@/components/reports/DepartmentPerformance';
import { CourseEnrollmentTrends } from '@/components/reports/CourseEnrollmentTrends';
import { GradeDistribution } from '@/components/reports/GradeDistribution';
import { FacultyWorkload } from '@/components/reports/FacultyWorkload';
import { TopPerformers } from '@/components/reports/TopPerformers';
import { BarChart2, TrendingUp, PieChart, Users, Award } from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'department',
    name: 'Department',
    icon: BarChart2,
    component: DepartmentPerformance,
  },
  {
    id: 'enrollment',
    name: 'Enrollment',
    icon: TrendingUp,
    component: CourseEnrollmentTrends,
  },
  {
    id: 'grades',
    name: 'Grades',
    icon: PieChart,
    component: GradeDistribution,
  },
  {
    id: 'faculty',
    name: 'Faculty',
    icon: Users,
    component: FacultyWorkload,
  },
  {
    id: 'toppers',
    name: 'Top Performers',
    icon: Award,
    component: TopPerformers,
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(REPORT_TYPES[0].id);

  const CurrentReport = REPORT_TYPES.find(r => r.id === selectedReport)?.component || DepartmentPerformance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Reports</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {REPORT_TYPES.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedReport === report.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <report.icon className="h-4 w-4" />
              <span>{report.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CurrentReport />
      </div>
    </div>
  );
} 