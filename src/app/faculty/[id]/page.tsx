'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Book, GraduationCap, Mail } from 'lucide-react';
import Link from 'next/link';
import { GradeModal } from '@/components/faculty/GradeModal';

interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  courses: number[];
}

interface Course {
  id: number;
  name: string;
  code: string;
  enrollmentCount: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Grade {
  id: number;
  studentId: number;
  courseId: number;
  grade: string;
  semester: string;
}

export default function FacultyProfile({ params }: { params: { id: string } }) {
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchFacultyData();
  }, [params.id]);

  const fetchFacultyData = async () => {
    try {
      const [facultyRes, coursesRes, studentsRes, gradesRes] = await Promise.all([
        axios.get(`http://localhost:3001/faculty/${params.id}`),
        axios.get('http://localhost:3001/courses'),
        axios.get('http://localhost:3001/students'),
        axios.get('http://localhost:3001/grades'),
      ]);

      setFaculty(facultyRes.data);
      setCourses(coursesRes.data);
      setStudents(studentsRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      toast.error('Failed to fetch faculty data');
    }
  };

  if (!faculty) {
    return <div>Loading...</div>;
  }

  const facultyCourses = courses.filter(course => faculty.courses.includes(course.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/faculty"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="ml-1">Back to Faculty</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Faculty Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {faculty.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{faculty.name}</h2>
              <div className="flex items-center text-gray-500">
                <Mail className="h-4 w-4 mr-1" />
                {faculty.email}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <span>{faculty.department}</span>
            </p>
            <p className="flex items-center gap-2">
              <Book className="h-5 w-5 text-gray-400" />
              <span>{facultyCourses.length} Courses</span>
            </p>
          </div>
        </div>

        {/* Course List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Assigned Courses</h3>
            </div>
            <div className="p-4">
              {facultyCourses.map(course => (
                <div
                  key={course.id}
                  className="mb-4 last:mb-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{course.name} ({course.code})</h4>
                    <span className="text-sm text-gray-500">
                      {course.enrollmentCount} students
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-4">
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        onChange={(e) => {
                          const studentId = Number(e.target.value);
                          if (studentId) {
                            setSelectedStudent(students.find(s => s.id === studentId) || null);
                            setSelectedCourse(course.id);
                            setIsGradeModalOpen(true);
                          }
                        }}
                      >
                        <option value="">Select student to grade...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      {grades
                        .filter(g => g.courseId === course.id)
                        .map(grade => {
                          const student = students.find(s => s.id === grade.studentId);
                          return (
                            <div
                              key={grade.id}
                              className="flex justify-between items-center p-2 bg-white rounded"
                            >
                              <span>{student?.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                  {grade.semester}
                                </span>
                                <span className="font-medium">{grade.grade}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GradeModal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setSelectedStudent(null);
          setSelectedCourse(null);
        }}
        student={selectedStudent}
        courseId={selectedCourse}
        onGradeSubmit={fetchFacultyData}
      />
    </div>
  );
} 