// src/pages/Matches.tsx
import React, { useEffect, useState } from "react";

const Matches = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/matches")
      .then(res => res.json())
      .then(data => {
        setMatches(data.matches);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch matches:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Your Matches</h1>
      <div className="grid gap-4 mt-4">
        {matches.map((match, idx) => (
          <div key={idx} className="border p-4 rounded shadow">
            <p><strong>Email:</strong> {match.email}</p>
            <p><strong>Score:</strong> {match.compatibility_score ?? "N/A"}</p>
            <p><strong>Responses:</strong></p>
            <ul className="list-disc ml-6 text-sm">
              {match.responses && Object.entries(match.responses).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
