from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import joblib
import numpy as np
import os

# Load environment variables from .env
load_dotenv()

# MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

# Initialize MongoDB client
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("roommate_ai")
    collection = db.get_collection("predictions")
    # Test connection
    db.list_collection_names()
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

# Load trained model
try:
    model = joblib.load("compatibility_model.pkl")
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Model loading failed: {e}")

# FastAPI app setup
app = FastAPI()

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for input
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

@app.get("/test-db")
def test_db_connection():
    try:
        collections = db.list_collection_names()
        return {"message": "Database connected successfully", "collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

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

        # Save result to MongoDB
        record = data.dict()
        record["compatibility_score"] = int(prediction)
        collection.insert_one(record)

        return {"compatibility_score": int(prediction)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
