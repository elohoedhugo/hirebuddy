import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from '../slices/jobsSlice'
import resumeReducer from '../slices/resumeSlice'


export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    resume: resumeReducer,
  },
})