'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

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
}

interface FacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: Faculty | null;
}

export function FacultyModal({ isOpen, onClose, faculty }: FacultyModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    courses: [] as number[],
  });

  useEffect(() => {
    fetchCourses();
    if (faculty) {
      setFormData(faculty);
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        courses: [],
      });
    }
  }, [faculty]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (faculty) {
        await axios.put(`http://localhost:3001/faculty/${faculty.id}`, formData);
        toast.success('Faculty member updated successfully');
      } else {
        await axios.post('http://localhost:3001/faculty', formData);
        toast.success('Faculty member added successfully');
      }
      onClose();
    } catch (error) {
      toast.error(faculty ? 'Failed to update faculty member' : 'Failed to add faculty member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {faculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
          </h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700">Assigned Courses</label>
            <select
              multiple
              value={formData.courses}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => Number(option.value));
                setFormData({ ...formData, courses: selected });
              }}
              className="mt-1 block w-full border rounded-md px-3 py-2 h-32"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple courses</p>
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
              {faculty ? 'Update' : 'Add'} Faculty Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 