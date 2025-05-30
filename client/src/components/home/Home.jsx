import React, { useState, useEffect, useRef } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { FileUp, XCircle } from "lucide-react";
import { fetchJobs, setSearchTerm } from "../../slices/jobsSlice";
import { parseResume, clearResume } from "../../slices/resumeSlice";
import { useDispatch, useSelector } from "react-redux";
import "../home/home.css";

export const Home = () => {
  const inputRef = useRef();
  const [fileName, setFileName] = useState(null);

  const dispatch = useDispatch();
  const { jobs, status, error, searchTerm } = useSelector(
    (state) => state.jobs
  );
  const { skills, roles, resumeStatus, resumeError } = useSelector(
    (state) => state.resume
  );




  useEffect(() => {
    if (roles && roles.length > 0) {
      const predictedSearchTerm = roles.map(role => role.toLowerCase()).join(' ');

      console.log("Searching jobs with:", predictedSearchTerm);
      dispatch(setSearchTerm(predictedSearchTerm));
      dispatch(fetchJobs(predictedSearchTerm));
    }
  }, [roles, dispatch]);

  const handleIconClick = () => {
    inputRef.current.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      dispatch(parseResume(file));
    }
  };

  const onClearResume = () => {
    setFileName(null);
    dispatch(clearResume());
    dispatch(setSearchTerm(''))
    dispatch(fetchJobs('')); 
  };

  const onSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchJobs(searchTerm));
  };

  return (
    <div className="home">
      <nav>
              <h1>Welcome to Hirebuddy</h1>

      <form onSubmit={onSearchSubmit}>
        <input className="searchinput"
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search for jobs..."
        />
        <button className="searchbutton"
          type="submit"
        >
          Search
        </button>
      </form>
      <div className="adddiv" onClick={handleIconClick} title="Upload Resume">
       <FaPlusCircle className="react-icon"/>
      <p style={{fontWeight: '700'}}>Add resume</p> 
      </div>
       
      </nav>


      <div className="fileinputdiv">
        <input
        className="fileinput"
          type="file"
          accept=".pdf,.docx"
          ref={inputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
        />


        {fileName && <p className="filep">Selected: {fileName}</p>}

        {resumeStatus === "loading" && <p className="filep">Parsing resume...</p>}
        {resumeStatus === "failed" && <p className="failedP text-red-600">{resumeError}</p>}
        {resumeStatus === "succeeded" && (
          <div className="skillsdiv bg-gray-100 p-4 rounded-md w-full">
            <h3 className="extractedP font-semibold">Extracted Skills:</h3>
            {skills.length > 0 ? (
              <ul className=" pl-5">
                {skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>No skills detected</p>
            )}

            <h3 className="extractedP font-semibold mt-4">Extracted Roles:</h3>
            {roles.length > 0 ? (
              <ul className="pl-5">
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            ) : (
              <p>No roles found</p>
            )}

            
            <button
              onClick={onClearResume}
              className="clearbutton mt-4 flex items-center text-red-600 hover:text-red-800 transition"
              title="Clear Resume"
            >
              <XCircle className="w-5 h-5 mr-1" />
              Clear Resume
            </button>
          </div>
        )}
      </div>

      <div>
        {status === "loading" && <p>Loading jobs...</p>}
        {status === "failed" && <p className="text-red-600">{error}</p>}
        {status === "succeeded" && jobs.length === 0 && <p>No jobs found</p>}
        {status === "succeeded" && jobs.length > 0 && (
          <ul className="job-list">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="border p-4 rounded-md hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                <p className="text-sm mt-2 text-blue-600 font-medium">{job.location}</p>
                <a
                  href={job.applyLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Apply Now
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
