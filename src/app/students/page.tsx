'use client';

import { useState } from 'react';
import { StudentList } from '@/components/students/StudentList';
import { StudentModal } from '@/components/students/StudentModal';
import { PlusCircle } from 'lucide-react';

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusCircle className="h-5 w-5" />
          Add Student
        </button>
      </div>

      <StudentList
        onEdit={(student) => {
          setSelectedStudent(student);
          setIsModalOpen(true);
        }}
      />

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
} 