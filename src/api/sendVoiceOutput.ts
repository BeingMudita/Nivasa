// src/api/sendVoiceOutput.ts
export async function sendVoiceOutput(responses: Record<string, string>, email: string, uid: string) {
  try {
    // 1. Predict compatibility
    const compatibilityRes = await fetch("http://localhost:8000/predict-compatibility/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses }),
    });

    if (!compatibilityRes.ok) {
      const err = await compatibilityRes.json();
      throw new Error(err.detail || "Prediction failed");
    }

    const result = await compatibilityRes.json();
    const score = result.compatibility_score;

    // 2. Save survey + score to backend
    await fetch("http://localhost:8000/survey-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, uid, responses }),
    });

    return score;
  } catch (error) {
    console.error("❌ Error sending voice data:", error);
    throw error;
  }
}
