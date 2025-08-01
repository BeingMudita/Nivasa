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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const handleAnswer = (answer: string) => {
    const currentKey = questions[currentQuestionIndex].key;

    let processedAnswer: any = answer;

    if (answer.toLowerCase() === "yes") processedAnswer = 1;
    else if (answer.toLowerCase() === "no") processedAnswer = 0;
    else if (!isNaN(Number(answer))) processedAnswer = Number(answer);

    setAnswers((prev: any) => ({
      ...prev,
      [currentKey]: processedAnswer,
    }));

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      sendToBackend({ ...answers, [currentKey]: processedAnswer });
    }
  };

  const sendToBackend = async (data: any) => {
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

  return (
    <div className="survey-container">
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
