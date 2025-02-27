'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Plus, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  enrollmentCount: number;
}

export function AssignStudents({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      const [studentsRes, enrollmentsRes] = await Promise.all([
        axios.get('http://localhost:3001/students'),
        axios.get(`http://localhost:3001/courses/${courseId}`),
      ]);

      const enrolled = studentsRes.data.filter((student: Student) => 
        student.enrolledCourses.includes(Number(courseId))
      );
      setEnrolledStudents(enrolled);
      setStudents(studentsRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const assignStudent = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Update student's enrolled courses
      await axios.patch(`http://localhost:3001/students/${studentId}`, {
        enrolledCourses: [...student.enrolledCourses, Number(courseId)]
      });

      // Update course enrollment count
      const course = await axios.get(`http://localhost:3001/courses/${courseId}`);
      await axios.patch(`http://localhost:3001/courses/${courseId}`, {
        enrollmentCount: course.data.enrollmentCount + 1
      });

      toast.success('Student assigned successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to assign student');
    }
  };

  const removeStudent = async (studentId: string) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      // Update student's enrolled courses
      await axios.patch(`http://localhost:3001/students/${studentId}`, {
        enrolledCourses: student.enrolledCourses.filter(id => id !== Number(courseId))
      });

      // Update course enrollment count
      const course = await axios.get(`http://localhost:3001/courses/${courseId}`);
      await axios.patch(`http://localhost:3001/courses/${courseId}`, {
        enrollmentCount: Math.max(0, course.data.enrollmentCount - 1)
      });

      toast.success('Student removed successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  const filteredStudents = students.filter(student => 
    !enrolledStudents.find(e => e.id === student.id) &&
    (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     student.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="font-medium mb-2">Enrolled Students ({enrolledStudents.length})</h3>
          <div className="grid gap-2">
            {enrolledStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <button
                  onClick={() => removeStudent(student.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Available Students</h3>
          <div className="grid gap-2">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <button
                  onClick={() => assignStudent(student.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="h-4 w-4 text-blue-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 