import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (searchTerm = '') => {
    const response = await axios.get(`${backendUrl}/api/jobs?search=${encodeURIComponent(searchTerm)}`)
    return response.data.data
  }
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    status: 'idle',
    error: null,
    searchTerm: '',
  },
  reducers: {
    setSearchTerm(state, action){
      state.searchTerm = action.payload
    }
  },

  extraReducers(builders){
    builders
    .addCase(fetchJobs.pending, (state) => {
      state.status = 'loading'
    })
    .addCase(fetchJobs.fulfilled, (state, action) => {
      state.status = 'succeeded'
      state.jobs = action.payload
    })
    .addCase(fetchJobs.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message
    })
  }
})

export const { setSearchTerm } = jobsSlice.actions
export default jobsSlice.reducer