'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FacultyWorkloadData {
  facultyName: string;
  courseCount: number;
  studentCount: number;
  averageClassSize: number;
}

export function FacultyWorkload() {
  const [workloadData, setWorkloadData] = useState<FacultyWorkloadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkloadData();
  }, []);

  const fetchWorkloadData = async () => {
    try {
      const [facultyRes, coursesRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:3001/faculty'),
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/students'),
      ]);

      const processedData = processFacultyWorkload(
        facultyRes.data,
        coursesRes.data,
        studentsRes.data
      );
      setWorkloadData(processedData);
    } catch (error) {
      toast.error('Failed to fetch faculty workload data');
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
      categories: workloadData.map(d => d.facultyName),
    },
    yaxis: [
      {
        title: {
          text: 'Number of Courses',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Average Class Size',
        },
      },
    ],
    colors: ['#3B82F6', '#10B981'],
  };

  const series = [
    {
      name: 'Courses',
      type: 'column',
      data: workloadData.map(d => d.courseCount),
    },
    {
      name: 'Avg Class Size',
      type: 'line',
      data: workloadData.map(d => d.averageClassSize),
    },
  ];

  if (loading) {
    return <div>Loading workload data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workloadData.map((data) => (
          <div
            key={data.facultyName}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="font-medium text-gray-500">{data.facultyName}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-2xl font-semibold">{data.courseCount}</p>
              <p className="text-sm text-gray-500">
                {data.studentCount} total students
              </p>
              <p className="text-sm text-gray-500">
                {data.averageClassSize.toFixed(1)} avg class size
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

function processFacultyWorkload(
  faculty: any[],
  courses: any[],
  students: any[]
): FacultyWorkloadData[] {
  return faculty.map(f => {
    const facultyCourses = courses.filter(c => f.courses.includes(c.id));
    const totalStudents = facultyCourses.reduce((sum, course) => 
      sum + course.enrollmentCount, 0
    );
    
    return {
      facultyName: f.name,
      courseCount: facultyCourses.length,
      studentCount: totalStudents,
      averageClassSize: totalStudents / (facultyCourses.length || 1),
    };
  });
} 