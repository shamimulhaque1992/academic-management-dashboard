'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  courseId: number | null;
  onGradeSubmit: () => void;
}

export function GradeModal({ isOpen, onClose, student, courseId, onGradeSubmit }: GradeModalProps) {
  const [formData, setFormData] = useState({
    grade: '',
    semester: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !courseId) return;

    try {
      await axios.post('http://localhost:3001/grades', {
        studentId: student.id,
        courseId,
        ...formData,
      });
      toast.success('Grade added successfully');
      onGradeSubmit();
      onClose();
    } catch (error) {
      toast.error('Failed to add grade');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Grade for {student.name}</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              placeholder="e.g., A, B+, C"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <input
              type="text"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              placeholder="e.g., Fall 2023"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Grade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 