import React, { useState } from 'react';

const FileUpload = ({ sourceName }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(`Selected: ${e.target.files[0].name}`);
  };

  const handleUpload = () => {
    if (!file) {
      setStatus('Please select a file first!');
      return;
    }
    // Logic: This will eventually be your Axios POST request to the Data Hub
    setStatus(`Uploading ${file.name} from ${sourceName} to Bronze Layer...`);
    
    // Reset after "upload"
    setTimeout(() => {
      setStatus('Upload Successful!');
      setFile(null);
    }, 2000);
  };

  return (
    <div className="upload-container">
      <h2>{sourceName}</h2>
      
      
      <div className="upload-box">
        <input 
          type="file" 
          id={`file-input-${sourceName}`} 
          onChange={handleFileChange} 
          hidden 
        />
        <label htmlFor={`file-input-${sourceName}`} className="select-btn">
          Choose File
        </label>
        <div className="status-text">{status || 'No file chosen'}</div>
        <button onClick={handleUpload} className="upload-btn">
          Inject Data
        </button>
      </div>
    </div>
  );
};

export default FileUpload