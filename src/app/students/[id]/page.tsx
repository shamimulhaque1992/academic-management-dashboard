'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Book, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: number;
  name: string;
  email: string;
  year: number;
  gpa: number;
  department: string;
  enrolledCourses: number[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
}

interface Grade {
  id: number;
  studentId: number;
  courseId: number;
  grade: string;
  semester: string;
}

export default function StudentProfile({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentRes, coursesRes, gradesRes] = await Promise.all([
          axios.get(`http://localhost:3001/students/${params.id}`),
          axios.get('http://localhost:3001/courses'),
          axios.get(`http://localhost:3001/grades?studentId=${params.id}`),
        ]);

        setStudent(studentRes.data);
        setCourses(coursesRes.data);
        setGrades(gradesRes.data);
      } catch (error) {
        toast.error('Failed to fetch student data');
      }
    };

    fetchStudentData();
  }, [params.id]);

  if (!student) {
    return <div>Loading...</div>;
  }

  const enrolledCourses = courses.filter(course => 
    student.enrolledCourses.includes(course.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/students"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="ml-1">Back to Students</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-gray-500">{student.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <span>Year {student.year}</span>
            </p>
            <p className="flex items-center gap-2">
              <Book className="h-5 w-5 text-gray-400" />
              <span>{student.department}</span>
            </p>
            <p className="text-lg font-semibold">GPA: {student.gpa}</p>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
          <div className="space-y-3">
            {enrolledCourses.map(course => (
              <div
                key={course.id}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-gray-500">{course.code}</p>
                </div>
                <span className="text-sm text-gray-500">{course.credits} credits</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Grade Summary</h3>
          <div className="space-y-3">
            {grades.map(grade => {
              const course = courses.find(c => c.id === grade.courseId);
              return (
                <div
                  key={grade.id}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{course?.name}</p>
                    <p className="text-sm text-gray-500">{grade.semester}</p>
                  </div>
                  <span className="font-semibold">{grade.grade}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 