import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4">
      <h1 className="text-6xl font-extrabold text-red-500 mb-4">403</h1>
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        You do not have permission to view this resource. Please make sure you are logged in with the correct role.
      </p>
      <Link to="/" className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl font-semibold transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default Unauthorized;
