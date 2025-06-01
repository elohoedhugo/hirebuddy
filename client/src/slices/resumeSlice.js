import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'

const backendUrl =  'http://localhost:5000'  || import.meta.env.VITE_BACKEND_URL

export const parseResume = createAsyncThunk(
  'resume/parseResume',
  async(file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await axios.post(`${backendUrl}/api/parse-resume`, formData, {
      headers: { 'Content-Type':'multipart/form-data' }
    })

    return response.data.data
  }
)

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    skills: [],
    roles: [],
    resumeStatus: 'idle',
    resumeError: null,
  },
  reducers: {
    clearResume(state){
      state.skills = []
      state.roles = []
      state.resumeStatus = 'idle'
      state.resumeError = null
    }
  },

  extraReducers(builder){
    builder
    .addCase(parseResume.pending, (state) => {
      state.resumeStatus = 'loading'
    })
    .addCase(parseResume.fulfilled, (state, action) => {
      state.resumeStatus= 'succeeded'
      state.skills = action.payload.skills
      state.roles = action.payload.roles
    })
    .addCase(parseResume.rejected, (state, action) => {
      state.resumeStatus = 'failed'
      state.resumeError = action.error.message
    })
  }
})

export const { clearResume } = resumeSlice.actions
export default resumeSlice.reducer