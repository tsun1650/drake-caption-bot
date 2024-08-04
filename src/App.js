// frontend/src/App.js
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaGithub } from "react-icons/fa"; // Import GitHub icon

import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const host = "http://localhost:3001";

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setImageChanged(true);

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post(`${host}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCaptions(response.data.response);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setLoading(false);
    setImageChanged(false);
  };

  return (
    <div className="App">
      <h1>Drizzy Caption Generator</h1>
      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Uploaded preview" />
        </div>
      )}
      {loading && <p>Loading...</p>}
      {captions.length > 0 && !loading && (
        <div>
          <h2>Drake says...</h2>
          <ul>
            {captions.split(";").map((caption, index) => (
              <li key={index}>{caption}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? "active" : ""}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p>File selected: {file.name}</p>
          ) : (
            <p>Drag 'n' drop an image here, or click to select one</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!file || loading || !imageChanged}
          className="submit-button"
        >
          Upload
        </button>
      </form>

      <footer className="footer">
        <div className="footer-content">
          <a
            href="https://github.com/tsun1650"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
