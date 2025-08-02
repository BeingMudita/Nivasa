// MatchPopup.tsx
// src/components/MatchPopup.tsx
import { useState, useEffect } from "react";

export default function MatchPopup() {
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(false), 3000); // Auto-close after 3s
    return () => clearTimeout(timer);
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
        <h2 className="text-xl font-semibold mb-3">🎉 You've Been Matched!</h2>
        <p className="text-gray-700 mb-5">
          Based on your survey, we’ve found great roommate options for you!
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(false)}
        >
          View Matches
        </button>
      </div>
    </div>
  );
}
