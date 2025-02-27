'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  gpa: number;
  department: string;
}

export function TopStudents() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchTopStudents = async () => {
      try {
        const response = await axios.get('http://localhost:3001/students');
        const sortedStudents = response.data
          .sort((a: Student, b: Student) => b.gpa - a.gpa)
          .slice(0, 5);
        setStudents(sortedStudents);
      } catch (error) {
        console.error('Error fetching top students:', error);
      }
    };

    fetchTopStudents();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
        <h2 className="text-lg font-semibold">Top Performing Students</h2>
      </div>
      <div className="space-y-4">
        {students.map((student, index) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <div className="ml-3">
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-500">{student.department}</p>
              </div>
            </div>
            <span className="font-semibold">GPA: {student.gpa}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 