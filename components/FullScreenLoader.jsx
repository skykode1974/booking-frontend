import React from "react";

export default function FullScreenLoader({ message }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-400 mb-4"></div>
      <p className="text-lg font-medium text-center px-6">{message}</p>
    </div>
  );
}
