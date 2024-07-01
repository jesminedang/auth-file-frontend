import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to the App Auth-file</h1>
      <Link to="/login" className="text-blue-500">Login</Link>
      <Link to="/register" className="text-blue-500 mt-2">Register</Link>
    </div>
  );
};

export default Home;
