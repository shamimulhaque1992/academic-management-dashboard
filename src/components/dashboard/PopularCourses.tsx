'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
  enrollmentCount: number;
  department: string;
}

export function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        const sortedCourses = response.data
          .sort((a: Course, b: Course) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 5);
        setCourses(sortedCourses);
      } catch (error) {
        console.error('Error fetching popular courses:', error);
      }
    };

    fetchPopularCourses();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
        <h2 className="text-lg font-semibold">Popular Courses</h2>
      </div>
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{course.name}</p>
              <p className="text-sm text-gray-500">{course.code}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{course.enrollmentCount}</p>
              <p className="text-sm text-gray-500">Students</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 