import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentsSlice';
import coursesReducer from './slices/coursesSlice';
import facultyReducer from './slices/facultySlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    courses: coursesReducer,
    faculty: facultyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 