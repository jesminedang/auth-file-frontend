import React, { useState } from 'react';
import axios from 'axios';
import { Backend_URL } from '../../constants';
import { useAuth } from '../AuthContext';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);

  const { logout } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const response = await axios.post(`${Backend_URL}/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('File uploaded:', response.data);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleUpload} className="max-w-md mx-auto mt-10 p-4 bg-white shadow-md rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Upload File</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Select File</label>
        <input
          type="file"
          accept=".pdf,.jpeg"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700">Upload</button>
    </form>
  );
};

export default UploadForm;
