'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Edit2, Trash2, Book } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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

interface FacultyListProps {
  onEdit: (faculty: Faculty) => void;
}

export function FacultyList({ onEdit }: FacultyListProps) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchFaculty();
    fetchCourses();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('http://localhost:3001/faculty');
      setFaculty(response.data);
    } catch (error) {
      toast.error('Failed to fetch faculty data');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3001/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await axios.delete(`http://localhost:3001/faculty/${id}`);
        toast.success('Faculty member deleted successfully');
        fetchFaculty();
      } catch (error) {
        toast.error('Failed to delete faculty member');
      }
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || f.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(faculty.map(f => f.department)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search faculty..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          className="border rounded-lg px-4 py-2"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaculty.map((f) => {
              const facultyCourses = courses.filter(c => f.courses.includes(c.id));
              return (
                <tr key={f.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Book className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{facultyCourses.length} courses</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {facultyCourses.map(c => c.code).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/faculty/${f.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Book className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => onEdit(f)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 