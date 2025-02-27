'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PieChart, BarChart, ArrowUp, ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GradeData {
  grade: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface CourseGrades {
  courseId: string;
  courseName: string;
  courseCode: string;
  department: string;
  semester: string;
  grades: GradeData[];
  stats: {
    totalStudents: number;
    passingRate: number;
    averageGrade: number;
    highestGrade: string;
    lowestGrade: string;
  };
}

export function GradeDistribution() {
  const [gradeData, setGradeData] = useState<CourseGrades[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
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

  const pieChartOptions = {
    chart: {
      type: 'pie' as const,
    },
    labels: selectedCourseData?.grades.map(g => g.grade) || [],
    colors: [
      '#22C55E', // A
      '#3B82F6', // B
      '#F59E0B', // C
      '#EF4444', // D
      '#6B7280', // F
    ],
    legend: {
      position: 'bottom' as const,
    },
  };

  const barChartOptions = {
    chart: {
      type: 'bar' as const,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%',
      },
    },
    xaxis: {
      categories: selectedCourseData?.grades.map(g => g.grade) || [],
    },
    colors: ['#3B82F6'],
  };

  const series = viewType === 'pie' 
    ? selectedCourseData?.grades.map(g => g.count) || []
    : [{
        name: 'Students',
        data: selectedCourseData?.grades.map(g => g.count) || [],
      }];

  if (loading) {
    return <div>Loading grade distribution...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('pie')}
            className={`p-2 rounded ${
              viewType === 'pie'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <PieChart className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`p-2 rounded ${
              viewType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <BarChart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {selectedCourseData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">{selectedCourseData.courseName}</h3>
              <p className="text-sm text-gray-500">
                {selectedCourseData.department} • {selectedCourseData.semester}
              </p>
            </div>

            <Chart
              options={viewType === 'pie' ? pieChartOptions : barChartOptions}
              series={series}
              type={viewType}
              height={350}
            />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500">Total Students</h4>
                <p className="text-2xl font-bold mt-1">
                  {selectedCourseData.stats.totalStudents}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500">Passing Rate</h4>
                <p className="text-2xl font-bold mt-1">
                  {selectedCourseData.stats.passingRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h4 className="font-medium">Grade Distribution</h4>
              </div>
              <div className="divide-y">
                {selectedCourseData.grades.map(grade => (
                  <div
                    key={grade.grade}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-lg font-semibold">{grade.grade}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {grade.count} students
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        grade.trend === 'up' 
                          ? 'text-green-500' 
                          : grade.trend === 'down' 
                          ? 'text-red-500' 
                          : 'text-gray-500'
                      }`}>
                        {grade.percentage.toFixed(1)}%
                      </span>
                      {grade.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                      {grade.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function processGradeDistribution(courses: any[], grades: any[]): CourseGrades[] {
  // Helper function to calculate grade point
  const getGradePoint = (grade: string) => {
    const points: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return points[grade] || 0;
  };

  return courses.map(course => {
    const courseGrades = grades.filter(g => g.courseId === course.id);
    const gradeCount = new Map<string, number>();
    const previousGradeCount = new Map<string, number>(); // For trend calculation
    
    courseGrades.forEach(grade => {
      const g = grade.grade;
      gradeCount.set(g, (gradeCount.get(g) || 0) + 1);
    });

    const totalGrades = courseGrades.length;
    const passingGrades = courseGrades.filter(g => 
      getGradePoint(g.grade) >= 1.0
    ).length;

    const gradeData: GradeData[] = Array.from(gradeCount.entries())
      .map(([grade, count]) => {
        const percentage = (count / totalGrades) * 100;
        const previousCount = previousGradeCount.get(grade) || 0;
        const trend = count > previousCount ? 'up' : count < previousCount ? 'down' : 'stable';

        return { grade, count, percentage, trend };
      })
      .sort((a, b) => getGradePoint(b.grade) - getGradePoint(a.grade));

    const averageGrade = courseGrades.reduce((sum, g) => 
      sum + getGradePoint(g.grade), 0
    ) / totalGrades;

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      department: course.department,
      semester: 'Fall 2023', // You might want to make this dynamic
      grades: gradeData,
      stats: {
        totalStudents: totalGrades,
        passingRate: (passingGrades / totalGrades) * 100,
        averageGrade,
        highestGrade: gradeData[0]?.grade || 'N/A',
        lowestGrade: gradeData[gradeData.length - 1]?.grade || 'N/A',
      },
    };
  });
} 