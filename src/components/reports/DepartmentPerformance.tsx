'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DepartmentStats {
  department: string;
  averageGPA: number;
  totalStudents: number;
  totalCourses: number;
  passingRate: number;
}

export function DepartmentPerformance() {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      const [studentsRes, coursesRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:3001/students'),
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/grades'),
      ]);

      // Process the data to calculate department statistics
      const departmentStats = processDepartmentData(
        studentsRes.data,
        coursesRes.data,
        gradesRes.data
      );
      setStats(departmentStats);
    } catch (error) {
      toast.error('Failed to fetch department statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      stacked: false,
    },
    xaxis: {
      categories: stats.map(s => s.department),
    },
    yaxis: [
      {
        title: {
          text: 'Average GPA',
        },
        max: 4,
      },
      {
        opposite: true,
        title: {
          text: 'Number of Students',
        },
      },
    ],
    colors: ['#3B82F6', '#10B981'],
  };

  const series = [
    {
      name: 'Average GPA',
      type: 'column',
      data: stats.map(s => s.averageGPA),
    },
    {
      name: 'Total Students',
      type: 'line',
      data: stats.map(s => s.totalStudents),
    },
  ];

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.department}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="font-medium text-gray-500">{stat.department}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-2xl font-semibold">{stat.averageGPA.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                {stat.totalStudents} students • {stat.totalCourses} courses
              </p>
              <p className="text-sm text-gray-500">
                {(stat.passingRate * 100).toFixed(1)}% passing rate
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height={400}
        />
      </div>
    </div>
  );
}

function processDepartmentData(students: any[], courses: any[], grades: any[]): DepartmentStats[] {
  const departments = new Map<string, {
    totalGPA: number;
    totalStudents: number;
    totalCourses: number;
    passingGrades: number;
    totalGrades: number;
  }>();

  // Process students and their grades
  students.forEach(student => {
    const dept = student.department;
    if (!departments.has(dept)) {
      departments.set(dept, {
        totalGPA: 0,
        totalStudents: 0,
        totalCourses: 0,
        passingGrades: 0,
        totalGrades: 0,
      });
    }

    const deptStats = departments.get(dept)!;
    deptStats.totalStudents++;
    deptStats.totalGPA += student.gpa;
  });

  // Process courses
  courses.forEach(course => {
    const dept = course.department;
    if (departments.has(dept)) {
      departments.get(dept)!.totalCourses++;
    }
  });

  // Process grades
  grades.forEach(grade => {
    const student = students.find(s => s.id === grade.studentId);
    if (student) {
      const dept = student.department;
      if (departments.has(dept)) {
        const deptStats = departments.get(dept)!;
        deptStats.totalGrades++;
        if (['A', 'B', 'C'].includes(grade.grade.charAt(0))) {
          deptStats.passingGrades++;
        }
      }
    }
  });

  // Convert Map to array and calculate averages
  return Array.from(departments.entries()).map(([department, stats]) => ({
    department,
    averageGPA: stats.totalGPA / stats.totalStudents,
    totalStudents: stats.totalStudents,
    totalCourses: stats.totalCourses,
    passingRate: stats.passingGrades / stats.totalGrades,
  }));
} 