'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Course {
  name: string;
  enrollmentCount: number;
}

export function EnrollmentChart() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: courses.map(course => course.name),
    },
    title: {
      text: 'Course Enrollments',
      align: 'left' as const,
    },
    theme: {
      mode: 'light' as const,
    }
  };

  const series = [
    {
      name: 'Enrollments',
      data: courses.map(course => course.enrollmentCount),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Chart
        options={chartOptions}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
} 