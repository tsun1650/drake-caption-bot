// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const host = 'http://localhost:3001';
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Create a preview URL for the selected image
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const response = await axios.post(`${host}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCaptions(response.data.captions);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Drizzy Caption Generator</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit" disabled={!file || loading}>
          Generate Captions
        </button>
      </form>
      {previewUrl && (
        <div className="image-preview">
          <h2>Uploaded Image:</h2>
          <img src={previewUrl} alt="Uploaded preview" style={{ maxWidth: '300px' }} />
        </div>
      )}
      {loading && <p>Loading...</p>}
      {captions.length > 0 && (
        <div>
          <h2>Potential Captions:</h2>
          <ul>
            {captions.map((caption, index) => (
              <li key={index}>{caption.replace(/["]+/g, '')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;