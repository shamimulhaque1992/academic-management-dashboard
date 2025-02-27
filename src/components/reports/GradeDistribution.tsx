'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GradeData {
  grade: string;
  count: number;
  percentage: number;
}

interface CourseGrades {
  courseId: number;
  courseName: string;
  courseCode: string;
  grades: GradeData[];
}

export function GradeDistribution() {
  const [gradeData, setGradeData] = useState<CourseGrades[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradeData();
  }, []);

  const fetchGradeData = async () => {
    try {
      const [coursesRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/grades'),
      ]);

      const processedData = processGradeDistribution(
        coursesRes.data,
        gradesRes.data
      );
      setGradeData(processedData);
      if (processedData.length > 0) {
        setSelectedCourse(processedData[0].courseId);
      }
    } catch (error) {
      toast.error('Failed to fetch grade distribution data');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseData = gradeData.find(d => d.courseId === selectedCourse);

  const chartOptions = {
    chart: {
      type: 'pie' as const,
    },
    labels: selectedCourseData?.grades.map(g => g.grade) || [],
    colors: [
      '#3B82F6', // A
      '#10B981', // B
      '#F59E0B', // C
      '#EF4444', // D
      '#6B7280', // F
    ],
  };

  const series = selectedCourseData?.grades.map(g => g.count) || [];

  if (loading) {
    return <div>Loading grade distribution...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {gradeData.map(course => (
          <button
            key={course.courseId}
            onClick={() => setSelectedCourse(course.courseId)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCourse === course.courseId
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {course.courseCode}
          </button>
        ))}
      </div>

      {selectedCourseData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Chart
              options={chartOptions}
              series={series}
              type="pie"
              height={300}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedCourseData.courseName}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {selectedCourseData.grades.map(grade => (
                <div
                  key={grade.grade}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <div className="text-2xl font-semibold">{grade.grade}</div>
                  <div className="text-sm text-gray-500">
                    {grade.count} students ({grade.percentage.toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function processGradeDistribution(courses: any[], grades: any[]): CourseGrades[] {
  return courses.map(course => {
    const courseGrades = grades.filter(g => g.courseId === course.id);
    const gradeCount = new Map<string, number>();
    
    courseGrades.forEach(grade => {
      const g = grade.grade.charAt(0);
      gradeCount.set(g, (gradeCount.get(g) || 0) + 1);
    });

    const totalGrades = courseGrades.length;
    const gradeData: GradeData[] = Array.from(gradeCount.entries())
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: (count / totalGrades) * 100,
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade));

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      grades: gradeData,
    };
  });
} 