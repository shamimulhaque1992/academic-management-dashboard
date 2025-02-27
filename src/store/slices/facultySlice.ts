import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  courses: number[];
}

interface FacultyState {
  faculty: Faculty[];
  loading: boolean;
  error: string | null;
}

const initialState: FacultyState = {
  faculty: [],
  loading: false,
  error: null,
};

const facultySlice = createSlice({
  name: 'faculty',
  initialState,
  reducers: {
    setFaculty: (state, action: PayloadAction<Faculty[]>) => {
      state.faculty = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addFaculty: (state, action: PayloadAction<Faculty>) => {
      state.faculty.push(action.payload);
    },
    updateFaculty: (state, action: PayloadAction<Faculty>) => {
      const index = state.faculty.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.faculty[index] = action.payload;
      }
    },
    deleteFaculty: (state, action: PayloadAction<number>) => {
      state.faculty = state.faculty.filter(f => f.id !== action.payload);
    },
  },
});

export const {
  setFaculty,
  setLoading,
  setError,
  addFaculty,
  updateFaculty,
  deleteFaculty,
} = facultySlice.actions;

export default facultySlice.reducer; 