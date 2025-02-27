'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Medal, Trophy, Award, Download } from 'lucide-react';
import { downloadCSV } from '@/lib/exportUtils';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface Student {
  id: string;
  name: string;
  email: string;
  gpa: number;
  department: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface TopPerformer {
  studentId: string;
  studentName: string;
  grade: string;
  gpa: number;
  department: string;
}

interface CoursePerformance {
  courseId: string;
  courseName: string;
  courseCode: string;
  topStudents: TopPerformer[];
}

export function TopPerformers() {
  const [overallToppers, setOverallToppers] = useState<Student[]>([]);
  const [coursePerformers, setCoursePerformers] = useState<CoursePerformance[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [studentsRes, coursesRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:3001/students'),
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/grades'),
      ]);

      // Process overall top performers (by GPA)
      const sortedStudents = [...studentsRes.data].sort((a, b) => b.gpa - a.gpa);
      setOverallToppers(sortedStudents.slice(0, 5));

      // Process top performers per course
      const courseData = processTopPerformers(
        coursesRes.data,
        studentsRes.data,
        gradesRes.data
      );
      setCoursePerformers(courseData);
      if (courseData.length > 0) {
        setSelectedCourse(courseData[0].courseId);
      }
    } catch (error) {
      toast.error('Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourseData = coursePerformers.find(c => c.courseId === selectedCourse);

  const chartOptions = {
    chart: {
      type: 'bar' as const,
    },
    xaxis: {
      categories: overallToppers.map(s => s.name),
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
      },
    },
    colors: ['#3B82F6'],
  };

  const series = [
    {
      name: 'GPA',
      data: overallToppers.map(s => s.gpa),
    },
  ];

  const handleExportOverall = () => {
    const exportData = overallToppers.map((student, index) => ({
      'Rank': index + 1,
      'Name': student.name,
      'Department': student.department,
      'GPA': student.gpa.toFixed(2),
      'Email': student.email
    }));
    
    downloadCSV(exportData, 'overall-top-performers');
  };

  const handleExportCourse = () => {
    if (!selectedCourse) return;
    
    const courseData = coursePerformers.find(c => c.courseId === selectedCourse);
    if (!courseData) return;
    
    const exportData = courseData.topStudents.map((performer, index) => ({
      'Rank': index + 1,
      'Name': performer.studentName,
      'Department': performer.department,
      'Grade': performer.grade,
      'Email': performer.studentName
    }));
    
    downloadCSV(exportData, `top-performers-${courseData.courseCode}`);
  };

  if (loading) {
    return <div>Loading performance data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Institute Top Performers */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Overall Top Performers</h2>
          <button
            onClick={handleExportOverall}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {overallToppers.map((student, index) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-lg shadow flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <Medal className="h-8 w-8 text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="h-8 w-8 text-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="h-8 w-8 text-amber-700" />
                  ) : (
                    <Award className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{student.gpa.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">GPA</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <Chart
              options={chartOptions}
              series={series}
              type="bar"
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Course-wise Top Performers */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Course-wise Top Performers</h2>
          {selectedCourse && (
            <button
              onClick={handleExportCourse}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
        <div className="flex gap-2 mb-6">
          {coursePerformers.map(course => (
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
          <div className="grid gap-4">
            {selectedCourseData.topStudents.map((student, index) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-gray-500">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium">{student.studentName}</h4>
                    <p className="text-sm text-gray-500">{student.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{student.grade}</p>
                  <p className="text-sm text-gray-500">Grade</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function processTopPerformers(
  courses: Course[],
  students: Student[],
  grades: any[]
): CoursePerformance[] {
  return courses.map(course => {
    const courseGrades = grades
      .filter(g => g.courseId === course.id)
      .map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        return {
          studentId: student?.id || '',
          studentName: student?.name || '',
          grade: grade.grade,
          gpa: student?.gpa || 0,
          department: student?.department || '',
        };
      })
      .sort((a, b) => {
        // Sort by grade (A > B > C etc.)
        const gradeOrder = { 'A+': 0, 'A': 1, 'A-': 2, 'B+': 3, 'B': 4, 'B-': 5, 'C+': 6, 'C': 7, 'C-': 8, 'D': 9, 'F': 10 };
        return (gradeOrder[a.grade as keyof typeof gradeOrder] || 0) - (gradeOrder[b.grade as keyof typeof gradeOrder] || 0);
      })
      .slice(0, 5); // Get top 5 students

    return {
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      topStudents: courseGrades,
    };
  });
} 