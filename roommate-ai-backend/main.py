from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import numpy as np
import requests
from dotenv import load_dotenv

from firebase_admin import auth, firestore
from firebase_admin._auth_utils import EmailAlreadyExistsError
from database.firebase import (
    db,
    users_collection,
    admin_emails_collection,
    predictions_collection
)

# === Load environment variables ===
load_dotenv()
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

# === FastAPI Setup ===
app = FastAPI()

# Allow CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],  # Replace "" with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Load Models ===
BASE_DIR = os.path.dirname(_file_)
MODEL_DIR = os.path.join(BASE_DIR, "models")
MAPPING_PATH = os.path.join(MODEL_DIR, "mappings.pkl")
ROOMMATE_MODEL_PATH = os.path.join(MODEL_DIR, "roomate_model.pkl")
COMPATIBILITY_MODEL_PATH = os.path.join(MODEL_DIR, "compatibility_model.pkl")

try:
    mappings = joblib.load(MAPPING_PATH)
    roommate_model = joblib.load(ROOMMATE_MODEL_PATH)
    model = joblib.load(COMPATIBILITY_MODEL_PATH)
    print("✅ All models loaded.")
except Exception as e:
    raise RuntimeError(f"❌ Error loading models: {e}")

# === Pydantic Request Models ===
class VoiceResponse(BaseModel):
    responses: dict

class CompatibilityInput(BaseModel):
    age_difference: int
    cleanliness: int
    night_owl: int
    introvert: int
    noise_tolerance: int
    cooking_frequency: int

class EmailCheck(BaseModel):
    email: str

class FullSignupInput(BaseModel):
    email: str
    password: str
    name: str

class LoginInput(BaseModel):
    email: str
    password: str

class SurveyResponse(BaseModel):
    email: str
    responses: dict
    uid: str

# === Helper: Text to Numeric Conversion ===
def preprocess_input(responses: dict):
    numeric_features = []
    for key, text_value in responses.items():
        try:
            mapped_val = mappings[key][text_value.lower()]
            numeric_features.append(mapped_val)
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid value '{text_value}' for '{key}'")
    return numeric_features

# === Endpoints ===
@app.get("/")
async def root():
    return {"message": "Roommate Compatibility API is running."}

@app.post("/predict-compatibility/")
async def predict_compatibility(data: VoiceResponse):
    try:
        numeric_input = preprocess_input(data.responses)
        input_array = np.array(numeric_input).reshape(1, -1)
        prediction = roommate_model.predict(input_array)
        return {"compatibility_score": float(prediction[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
def predict(data: CompatibilityInput):
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
        predictions_collection.add(record)
        return {"compatibility_score": int(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check-admin")
def check_admin(email: str):
    admins_ref = db.collection("admins").where("email", "==", email).get()
    is_admin = len(admins_ref) > 0
    return {"is_admin": is_admin}

@app.post("/check-admin")
def check_admin_post(data: EmailCheck):
    try:
        docs = admin_emails_collection.where("email", "==", data.email).stream()
        is_admin = any(True for _ in docs)
        return {"is_admin": is_admin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin check failed: {e}")

@app.get("/matches")
def get_matches():
    try:
        docs = predictions_collection.stream()
        matches = [doc.to_dict() for doc in docs]
        return {"matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-db")
def test_db_connection():
    try:
        collections = ["users", "admins", "predictions"]
        return {"message": "Firebase connected", "collections": collections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {e}")

@app.post("/signup")
def signup(data: FullSignupInput):
    try:
        resp = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}",
            json={
                "email": data.email,
                "password": data.password,
                "returnSecureToken": True
            }
        )
        if resp.status_code != 200:
            raise Exception(f"Identity Toolkit error: {resp.json()}")

        user_data = resp.json()
        uid = user_data["localId"]

        users_collection.document(uid).set({
            "email": data.email,
            "name": data.name,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return {
            "message": "Signup successful",
            "user": {
                "id": uid,
                "email": data.email,
                "name": data.name
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {e}")

@app.post("/login")
def login(data: LoginInput):
    resp = requests.post(
        f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}",
        json={
            "email": data.email,
            "password": data.password,
            "returnSecureToken": True
        }
    )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    uid = resp.json()["localId"]

    try:
        user_doc = users_collection.document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User profile not found")

        user_data = user_doc.to_dict()

        return {
            "message": "Login successful",
            "user": {
                "id": uid,
                "email": user_data["email"],
                "name": user_data.get("name", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore error: {e}")

@app.post("/survey-response")
def save_survey_response(data: SurveyResponse):
    try:
        user_doc = users_collection.document(data.uid).get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        user_email = user_data.get("email", "unknown")

        users_collection.document(data.uid).set({
            "survey": data.responses
        }, merge=True)

        predictions_collection.add({
            "uid": data.uid,
            "email": user_email,
            "responses": data.responses,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return {"message": "Survey stored in users and predictions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save survey: {e}")