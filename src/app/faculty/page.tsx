'use client';

import { useState } from 'react';
import { FacultyList } from '@/components/faculty/FacultyList';
import { FacultyModal } from '@/components/faculty/FacultyModal';
import { PlusCircle } from 'lucide-react';

export default function FacultyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <button
          onClick={() => {
            setSelectedFaculty(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusCircle className="h-5 w-5" />
          Add Faculty
        </button>
      </div>

      <FacultyList
        onEdit={(faculty) => {
          setSelectedFaculty(faculty);
          setIsModalOpen(true);
        }}
      />

      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faculty={selectedFaculty}
      />
    </div>
  );
} 