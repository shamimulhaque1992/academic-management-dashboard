'use client';

import { useState } from 'react';
import { CourseList } from '@/components/courses/CourseList';
import { CourseModal } from '@/components/courses/CourseModal';
import { PlusCircle } from 'lucide-react';

export default function CoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <button
          onClick={() => {
            setSelectedCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusCircle className="h-5 w-5" />
          Add Course
        </button>
      </div>

      <CourseList
        onEdit={(course) => {
          setSelectedCourse(course);
          setIsModalOpen(true);
        }}
      />

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
      />
    </div>
  );
} 