import React from 'react';

const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020202] text-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">
        Loading Data
      </p>
    </div>
  );
};

export default Spinner;