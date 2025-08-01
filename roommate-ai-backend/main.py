from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database("roommate_ai")
collection = db.get_collection("predictions")

# Load the trained model
model = joblib.load("compatibility_model.pkl")

# FastAPI setup
app = FastAPI()

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input format
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

        prediction = model.predict(input_data)[0]

        # Save to MongoDB
        record = data.dict()
        record["compatibility_score"] = int(prediction)
        collection.insert_one(record)

        return {"compatibility_score": int(prediction)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
