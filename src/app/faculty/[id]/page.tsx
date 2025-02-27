'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GradeManagement } from '@/components/faculty/GradeManagement';
import { AssignStudents } from '@/components/faculty/AssignStudents';

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function FacultyPage({ params }: { params: { id: string } }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyData();
  }, [params.id]);

  const fetchFacultyData = async () => {
    try {
      const facultyRes = await axios.get(`http://localhost:3001/faculty/${params.id}`);
      const coursesRes = await axios.get('http://localhost:3001/courses');
      
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
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <Tabs defaultValue="grades">
          <TabsList>
            <TabsTrigger value="grades">Manage Grades</TabsTrigger>
            <TabsTrigger value="students">Assign Students</TabsTrigger>
          </TabsList>
          <TabsContent value="grades">
            <GradeManagement courseId={selectedCourse} />
          </TabsContent>
          <TabsContent value="students">
            <AssignStudents courseId={selectedCourse} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 