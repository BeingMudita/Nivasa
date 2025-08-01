import React, { useState } from "react";

const PredictForm = () => {
  const [formData, setFormData] = useState({
    age_difference: 0,
    cleanliness: 0,
    night_owl: 0,
    introvert: 0,
    noise_tolerance: 0,
    cooking_frequency: 0,
  });

  const [score, setScore] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseInt(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    setScore(data.compatibility_score);
  };

  return (
    <div>
      <h2>Roommate Compatibility Predictor</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key}</label>
            <input
              type="number"
              name={key}
              value={(formData as any)[key]}
              onChange={handleChange}
              min={0}
              max={10}
            />
          </div>
        ))}
        <button type="submit">Predict</button>
      </form>

      {score !== null && (
        <div>
          <h3>Predicted Compatibility Score: {score}</h3>
        </div>
      )}
    </div>
  );
};

export default PredictForm;
