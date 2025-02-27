'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
  facultyId: number;
  enrollmentCount: number;
  credits: number;
  department: string;
}

interface Faculty {
  id: number;
  name: string;
  department: string;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export function CourseModal({ isOpen, onClose, course }: CourseModalProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    facultyId: 0,
    enrollmentCount: 0,
    credits: 3,
    department: '',
  });

  useEffect(() => {
    fetchFaculty();
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        name: '',
        code: '',
        facultyId: 0,
        enrollmentCount: 0,
        credits: 3,
        department: '',
      });
    }
  }, [course]);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('http://localhost:3001/faculty');
      setFaculty(response.data);
    } catch (error) {
      toast.error('Failed to fetch faculty data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (course) {
        await axios.put(`http://localhost:3001/courses/${course.id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await axios.post('http://localhost:3001/courses', formData);
        toast.success('Course added successfully');
      }
      onClose();
    } catch (error) {
      toast.error(course ? 'Failed to update course' : 'Failed to add course');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {course ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Faculty</label>
            <select
              value={formData.facultyId}
              onChange={(e) => setFormData({ ...formData, facultyId: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select Faculty</option>
              {faculty.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Credits</label>
            <input
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
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
              {course ? 'Update' : 'Add'} Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 