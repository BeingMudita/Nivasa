// frontend/src/components/Survey.tsx

import React, { useState } from 'react';

const Survey: React.FC = () => {
  const questions = [
    { key: "age_difference", text: "What is your age difference preference?" },
    { key: "cleanliness", text: "How clean are you on a scale of 1 to 10?" },
    { key: "night_owl", text: "Are you a night owl? Say yes or no." },
    { key: "introvert", text: "Are you introverted? Say yes or no." },
    { key: "noise_tolerance", text: "How tolerant are you of noise on a scale of 1 to 10?" },
    { key: "cooking_frequency", text: "How often do you cook in a week?" },
  ];

  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleLogin = async () => {
    const response = await fetch('http://localhost:8000/login-or-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setIsAdmin(data.is_admin);
    setIsLoggedIn(true);
  };

  const handleAnswer = (answer: string) => {
    const currentKey = questions[currentQuestionIndex].key;
    let processedAnswer: string | number = answer;

    if (answer.toLowerCase() === "yes") processedAnswer = 1;
    else if (answer.toLowerCase() === "no") processedAnswer = 0;
    else if (!isNaN(Number(answer))) processedAnswer = Number(answer);

    const updatedAnswers = {
      ...answers,
      [currentKey]: processedAnswer,
    };

    setAnswers(updatedAnswers);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      sendToBackend(updatedAnswers);
    }
  };

  const sendToBackend = async (data: Record<string, string | number>) => {
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setFinalScore(result.compatibility_score);
  };

  // If not logged in yet, show login screen
  if (!isLoggedIn) {
    return (
      <div className="login-section">
        <h3>Login / Signup</h3>
        <input
          type="email"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Continue</button>
      </div>
    );
  }

  // If user is an admin, redirect to admin dashboard (mockup)
  if (isAdmin) {
    return (
      <div className="admin-section">
        <h2>Welcome Admin</h2>
        <p>You have admin access. Please visit the admin dashboard.</p>
        {/* Replace with actual redirect logic or admin component */}
      </div>
    );
  }

  // If logged in and not admin, show survey
  return (
    <div className="survey-container">
      <div className="user-info">
        <p>Logged in as: <strong>{email}</strong></p>
      </div>

      {finalScore !== null ? (
        <div className="result">
          Your Compatibility Score: <strong>{finalScore}</strong>
        </div>
      ) : (
        <div className="question-section">
          <h3>{questions[currentQuestionIndex].text}</h3>
          <input
            type="text"
            placeholder="Type your answer..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAnswer((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Survey;
