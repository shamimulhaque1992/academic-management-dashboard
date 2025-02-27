'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap } from 'lucide-react';
import axios from 'axios';

interface StatsData {
  totalStudents: number;
  totalCourses: number;
  totalFaculty: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    totalCourses: 0,
    totalFaculty: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, courses, faculty] = await Promise.all([
          axios.get('http://localhost:3001/students'),
          axios.get('http://localhost:3001/courses'),
          axios.get('http://localhost:3001/faculty'),
        ]);

        setStats({
          totalStudents: students.data.length,
          totalCourses: courses.data.length,
          totalFaculty: faculty.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-lg shadow p-6 flex items-center"
        >
          <div className={`${stat.color} p-4 rounded-lg`}>
            <stat.icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 