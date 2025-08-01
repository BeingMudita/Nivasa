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

# Initialize DB connection
client = None
db = None
collection = None
admin_collection = None
user_collection = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()  # Trigger connection
    db = client.get_database("roommate_ai")
    collection = db.get_collection("predictions")
    admin_collection = db.get_collection("admins")
    user_collection = db.get_collection("users")
except Exception as e:
    print(f"⚠️ Warning: Database connection failed: {e}")

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

# Request schemas
class CompatibilityInput(BaseModel):
    age_difference: int
    cleanliness: int
    night_owl: int
    introvert: int
    noise_tolerance: int
    cooking_frequency: int

class EmailCheck(BaseModel):
    email: str

class SignupInput(BaseModel):
    email: str

@app.get("/")
def root():
    return {"message": "Roommate Compatibility API is running"}

@app.get("/test-db")
def test_db_connection():
    if db is None:
        raise HTTPException(status_code=500, detail="No database connection")
    try:
        collections = db.list_collection_names()
        return {"message": "Database connected", "collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

@app.post("/predict")
def predict_compatibility(data: CompatibilityInput):
    if db is None or collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

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
        record = data.dict()
        record["compatibility_score"] = int(prediction)
        collection.insert_one(record)
        return {"compatibility_score": int(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-admin")
def check_admin(data: EmailCheck):
    if db is None or admin_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        result = admin_collection.find_one({"email": data.email})
        is_admin = result is not None
        return {"is_admin": is_admin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin check failed: {e}")

@app.post("/signup")
def signup_user(data: SignupInput):
    if db is None or user_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # check if user already exists
        if user_collection.find_one({"email": data.email}):
            return {"message": "User already exists", "email": data.email}
        
        user_collection.insert_one({"email": data.email})
        return {"message": "User signed up successfully", "email": data.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {e}")
