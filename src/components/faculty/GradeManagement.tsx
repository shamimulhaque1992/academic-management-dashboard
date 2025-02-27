'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  grade: string;
  semester: string;
}

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export function GradeManagement({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSemester, setCurrentSemester] = useState('Spring 2024');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        axios.get('http://localhost:3001/students'),
        axios.get('http://localhost:3001/grades'),
      ]);

      const enrolledStudents = studentsRes.data.filter((student: Student) => 
        student.enrolledCourses?.includes(Number(courseId))
      );
      
      setStudents(enrolledStudents);
      setGrades(gradesRes.data.filter((grade: Grade) => grade.courseId === courseId));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const updateGrade = async (studentId: string, newGrade: string) => {
    try {
      const existingGrade = grades.find(
        g => g.studentId === studentId && g.courseId === courseId && g.semester === currentSemester
      );

      if (existingGrade) {
        // Update existing grade
        await axios.patch(`http://localhost:3001/grades/${existingGrade.id}`, {
          grade: newGrade
        });
      } else {
        // Create new grade
        await axios.post('http://localhost:3001/grades', {
          studentId,
          courseId,
          grade: newGrade,
          semester: currentSemester
        });
      }

      toast.success('Grade updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update grade');
    }
  };

  const getStudentGrade = (studentId: string) => {
    const gradeEntry = grades.find(
      g => g.studentId === studentId && g.courseId === courseId && g.semester === currentSemester
    );
    return gradeEntry?.grade || '';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={currentSemester}
          onChange={(e) => setCurrentSemester(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="Spring 2024">Spring 2024</option>
          <option value="Fall 2023">Fall 2023</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">{student.email}</p>
            </div>
            <select
              value={getStudentGrade(student.id)}
              onChange={(e) => updateGrade(student.id, e.target.value)}
              className="px-3 py-1 border rounded-md"
            >
              <option value="">Select Grade</option>
              {GRADE_OPTIONS.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
} 