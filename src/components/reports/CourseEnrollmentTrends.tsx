'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface EnrollmentTrend {
  courseId: number;
  courseName: string;
  courseCode: string;
  enrollments: {
    semester: string;
    count: number;
  }[];
}

export function CourseEnrollmentTrends() {
  const [trends, setTrends] = useState<EnrollmentTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  useEffect(() => {
    fetchEnrollmentTrends();
  }, []);

  const fetchEnrollmentTrends = async () => {
    try {
      const [coursesRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/grades'),
      ]);

      const processedTrends = processEnrollmentData(
        coursesRes.data,
        gradesRes.data
      );
      setTrends(processedTrends);
      // Select top 5 courses by default
      setSelectedCourses(processedTrends.slice(0, 5).map(t => t.courseId));
    } catch (error) {
      toast.error('Failed to fetch enrollment trends');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    chart: {
      type: 'line' as const,
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: ['Fall 2022', 'Spring 2023', 'Fall 2023'],
    },
    stroke: {
      curve: 'smooth' as const,
    },
    legend: {
      position: 'top' as const,
    },
  };

  const series = trends
    .filter(trend => selectedCourses.includes(trend.courseId))
    .map(trend => ({
      name: `${trend.courseCode} - ${trend.courseName}`,
      data: trend.enrollments.map(e => e.count),
    }));

  if (loading) {
    return <div>Loading enrollment trends...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {trends.map(trend => (
          <button
            key={trend.courseId}
            onClick={() => {
              setSelectedCourses(prev => {
                if (prev.includes(trend.courseId)) {
                  return prev.filter(id => id !== trend.courseId);
                }
                return [...prev, trend.courseId];
              });
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCourses.includes(trend.courseId)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trend.courseCode}
          </button>
        ))}
      </div>

      <Chart
        options={chartOptions}
        series={series}
        type="line"
        height={400}
      />
    </div>
  );
}

function processEnrollmentData(courses: any[], grades: any[]): EnrollmentTrend[] {
  const semesters = ['Fall 2022', 'Spring 2023', 'Fall 2023'];
  
  return courses.map(course => ({
    courseId: course.id,
    courseName: course.name,
    courseCode: course.code,
    enrollments: semesters.map(semester => ({
      semester,
      count: grades.filter(g => 
        g.courseId === course.id && 
        g.semester === semester
      ).length,
    })),
  }));
} 