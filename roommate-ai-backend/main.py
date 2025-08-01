from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import joblib
import numpy as np
import os

# Load .env
load_dotenv()

# Mongo URI from .env
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB client setup
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("roommate_ai")
    collection = db.get_collection("predictions")
    admin_collection = db.get_collection("admins")
    db.list_collection_names()  # test connection
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

# Load ML model
try:
    model = joblib.load("compatibility_model.pkl")
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Model loading failed: {e}")

# FastAPI app
app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input for prediction
class CompatibilityInput(BaseModel):
    age_difference: int
    cleanliness: int
    night_owl: int
    introvert: int
    noise_tolerance: int
    cooking_frequency: int

# Input for admin check
class EmailCheck(BaseModel):
    email: str

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

        # Save to DB
        record = data.dict()
        record["compatibility_score"] = int(prediction)
        collection.insert_one(record)

        return {"compatibility_score": int(prediction)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-admin")
def check_admin(data: EmailCheck):
    try:
        result = admin_collection.find_one({"email": data.email})
        is_admin = result is not None
        return {"is_admin": is_admin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin check failed: {e}")
