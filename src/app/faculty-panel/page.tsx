'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { GradeManagement } from '@/components/faculty/GradeManagement';
import { AssignStudents } from '@/components/faculty/AssignStudents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
}

interface Faculty {
  id: string;
  name: string;
  courses: number[];
}

export default function FacultyPanelPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    // For demo, we'll use faculty ID 1. In real app, get from auth
    const facultyId = "1";
    fetchFacultyData(facultyId);
  }, []);

  const fetchFacultyData = async (facultyId: string) => {
    try {
      const [facultyRes, coursesRes] = await Promise.all([
        axios.get(`http://localhost:3001/faculty/${facultyId}`),
        axios.get('http://localhost:3001/courses'),
      ]);

      setFaculty(facultyRes.data);
      
      // Filter courses assigned to this faculty
      const facultyCourses = coursesRes.data.filter((course: Course) => 
        facultyRes.data.courses.includes(Number(course.id))
      );
      
      setCourses(facultyCourses);
      if (facultyCourses.length > 0) {
        setSelectedCourse(facultyCourses[0].id);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch faculty data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Panel</h1>
          <p className="text-gray-600">Welcome, {faculty?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Select Course:</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white shadow-sm"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse && (
        <div className="bg-white rounded-lg shadow">
          <Tabs defaultValue="grades" className="p-6">
            <TabsList className="grid grid-cols-2 gap-4 mb-6">
              <TabsTrigger value="grades" className="w-full">
                Manage Grades
              </TabsTrigger>
              <TabsTrigger value="students" className="w-full">
                Manage Students
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grades">
              <div className="bg-gray-50 p-6 rounded-lg">
                <GradeManagement courseId={selectedCourse} />
              </div>
            </TabsContent>

            <TabsContent value="students">
              <div className="bg-gray-50 p-6 rounded-lg">
                <AssignStudents courseId={selectedCourse} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 