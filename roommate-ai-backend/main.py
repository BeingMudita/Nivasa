from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load the trained model
model = joblib.load("compatibility_model.pkl")

# Define input format for the API
class CompatibilityInput(BaseModel):
    age_difference: int
    cleanliness: int
    night_owl: int
    introvert: int
    noise_tolerance: int
    cooking_frequency: int

@app.get("/")
def root():
    return {"message": "Roommate Compatibility API is running"}

@app.post("/predict")
def predict_compatibility(data: CompatibilityInput):
    try:
        input_data = np.array([[ 
            data.age_difference,
            data.cleanliness,
            data.night_owl,
            data.introvert,
            data.noise_tolerance,
            data.cooking_frequency
        ]])

        prediction = model.predict(input_data)
        return {"compatibility_score": int(prediction[0])}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
