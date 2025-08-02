from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import joblib
import numpy as np
import os
import requests

from firebase_admin import auth, firestore
from firebase_admin._auth_utils import EmailAlreadyExistsError
from database.firebase import (
    db,
    users_collection,
    admin_emails_collection,
    predictions_collection
)

class SurveyResponse(BaseModel):
    email: str
    responses: dict

# Load environment
load_dotenv()
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY")

# Load ML model
try:
    model = joblib.load("compatibility_model.pkl")
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Model loading failed: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class CompatibilityInput(BaseModel):
    age_difference: int
    cleanliness: int
    night_owl: int
    introvert: int
    noise_tolerance: int
    cooking_frequency: int

class EmailCheck(BaseModel):
    email: str

class LoginInput(BaseModel):
    email: str
    password: str

class FullSignupInput(BaseModel):
    email: str
    password: str
    name: str

# Routes
@app.get("/")
def root():
    return {"message": "Roommate Compatibility API is running"}

@app.get("/check-admin")
def check_admin(email: str):
    admins_ref = db.collection("admins").where("email", "==", email).get()
    is_admin = len(admins_ref) > 0
    return {"is_admin": is_admin}

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
        record = data.dict()
        record["compatibility_score"] = int(prediction)
        predictions_collection.add(record)
        return {"compatibility_score": int(prediction)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-admin")
def check_admin(data: EmailCheck):
    try:
        docs = admin_emails_collection.where("email", "==", data.email).stream()
        is_admin = any(True for _ in docs)
        return {"is_admin": is_admin}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Admin check failed: {e}")

@app.post("/signup")
def signup(data: FullSignupInput):
    try:
        # Create user and set password in one go via Identity Toolkit
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

        # Save user info to Firestore
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
    # Step 1: Sign in user using Firebase Identity Toolkit
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

    # Step 2: Get user's Firestore profile
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
        print("📥 Received survey data:", data.dict())
        user_doc = users_collection.document(data.uid).get()

        if not user_doc.exists:
            print("❌ User not found in Firestore for UID:", data.uid)
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        user_email = user_data.get("email", "unknown")

        print("✅ Found user:", user_email)
        print("💾 Saving responses:", data.responses)

        # Save to users
        users_collection.document(data.uid).set({
            "survey": data.responses
        }, merge=True)

        # Save to predictions
        predictions_collection.add({
            "uid": data.uid,
            "email": user_email,
            "responses": data.responses,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        print("✅ Survey saved successfully")
        return {"message": "Survey stored in users and predictions"}

    except Exception as e:
        print("🔥 Error saving survey:", e)
        raise HTTPException(status_code=500, detail=f"Failed to save survey: {e}")
