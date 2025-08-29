from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import joblib
import numpy as np
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
import datetime
from database.firebase import users_collection, predictions_collection

# 🔹 Mapping free-form survey answers → standardized values for ML
ANSWER_MAPPINGS = {
    "sleep_pattern": {
        "early": "Early",
        "night owl": "Night owl",
        "on-time": "On-time"
    },
    "diet_type": {
        "vegetarian": "Vegetarian",
        "non-vegetarian": "Non-vegetarian",
        "flexitarian": "Flexitarian",
        "vegan": "Vegan"
    },
    "cleanliness_score": {
        "messy": 1,
        "average": 3,
        "clean": 5
    },
    "sociability": {
        "chill": "Social/Chill",
        "balanced": "Balanced",
        "outgoing": "Outgoing"
    },
    "sharing_comfort": {
        "comfortable": "Very open",
        "fine with it": "Somewhat okay",
        "not comfortable": "Not comfortable"
    }
}


# Initialize Firestore
db = firestore.client()
users_collection = db.collection('users')
survey_responses_collection = db.collection('predictions')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileUpdate(BaseModel):
    uid: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    bio: Optional[str] = None
    schedule: Optional[str] = None
    budget: Optional[str] = None
from firebase_admin import auth, firestore
from firebase_admin._auth_utils import EmailAlreadyExistsError
from database.firebase import (
    users_collection,
    predictions_collection
)


class SurveyResponse(BaseModel):
    uid: str
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
    first_name: str
    last_name: str
    apartment_name: Optional[str] = None
    role: str

    class Config:
        allow_population_by_field_name = True
        fields = {
            "first_name": "firstName",
            "last_name": "lastName",
            "apartment_name": "apartmentName"
        }



# Routes
@app.get("/")
def root():
    return {"message": "Roommate Compatibility API is running"}

@app.get("/check-admin")
def check_admin(email: str):
    try:
        # Look up user by email
        users_ref = users_collection.where("email", "==", email).limit(1).get()
        if not users_ref:
            return {"is_admin": False}

        user_doc = users_ref[0].to_dict()
        is_admin = user_doc.get("role", "").lower() == "admin"

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
        # 1. Check if user already exists in Firebase Auth
        resp_check = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}",
            json={"email": data.email, "password": data.password, "returnSecureToken": True}
        )
        if resp_check.status_code == 200:
            # Email exists and password matches → login existing user
            uid = resp_check.json()["localId"]
            user_doc = users_collection.document(uid).get()
            user_data = user_doc.to_dict() if user_doc.exists else {}
            return {
                "message": "Email already registered, logging in...",
                "user": {
                    "id": uid,
                    "email": data.email,
                    "firstName": user_data.get("firstName", data.first_name),
                    "lastName": user_data.get("lastName", data.last_name),
                    "apartmentName": user_data.get("apartmentName", data.apartment_name),
                    "role": user_data.get("role", data.role)
                }
            }
        
        # 2. If email not registered, create new user
        resp = requests.post(
            f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}",
            json={"email": data.email, "password": data.password, "returnSecureToken": True}
        )
        if resp.status_code != 200:
            raise Exception(resp.json())

        user_data = resp.json()
        uid = user_data["localId"]

        # Save profile in Firestore
        users_collection.document(uid).set({
            "email": data.email,
            "firstName": data.first_name,
            "lastName": data.last_name,
            "apartmentName": data.apartment_name,
            "role": data.role
        })

        return {
            "message": "Signup successful",
            "user": {
                "id": uid,
                "email": data.email,
                "firstName": data.first_name,
                "lastName": data.last_name,
                "apartmentName": data.apartment_name,
                "role": data.role
            }
        }

    except Exception as e:
        print(e)
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
                "email": user_data.get("email", ""),
                "firstName": user_data.get("firstName", ""),
                "lastName": user_data.get("lastName", ""),
                "role": user_data.get("role", "")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore error: {e}")
    

@app.post("/survey-response")
def save_survey_response(data: SurveyResponse):
    try:
        user_doc_ref = users_collection.document(data.uid)
        user_doc = user_doc_ref.get()

        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = user_doc.to_dict()
        user_email = user_data.get("email", "unknown")

        responses = data.responses

        # 🔹 Transform responses → standardized format for ML
        formatted = {
            "id": data.uid,
            "sleep": ANSWER_MAPPINGS["sleep_pattern"].get(responses.get("sleep_pattern", "").lower(), "Unknown"),
            "eating": ANSWER_MAPPINGS["diet_type"].get(responses.get("diet_type", "").lower(), "Unknown"),
            "cleanliness": ANSWER_MAPPINGS["cleanliness_score"].get(responses.get("cleanliness_score", "").lower(), 3),
            "sociability": ANSWER_MAPPINGS["sociability"].get(responses.get("sociability", "").lower(), "Balanced"),
            "sharing": ANSWER_MAPPINGS["sharing_comfort"].get(responses.get("sharing_comfort", "").lower(), "Somewhat okay"),
        }

        # Save in users
        user_doc_ref.set({
            "email": user_email,
            "responses": responses,
            "formatted": formatted,   # 🔹 Keep structured version
            "timestamp": firestore.SERVER_TIMESTAMP
        }, merge=True)

        # Save in predictions collection
        predictions_collection.add({
            **formatted,
            "email": user_email,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return {"message": "Survey stored successfully", "formatted": formatted}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save survey: {e}")


@app.get("/user-profile")
async def get_user_profile(uid: str = Query(...)):
    try:
        # First try to get from surveyResponses collection
        survey_doc = survey_responses_collection.document(uid).get()
        if survey_doc.exists:
            survey_data = survey_doc.to_dict()
            return {
                "profile": {
                    "firstName": survey_data.get("firstName", ""),
                    "lastName": survey_data.get("lastName", ""),
                    "email": survey_data.get("email", ""),
                    "age": survey_data.get("age", 0),
                    "occupation": survey_data.get("occupation", ""),
                    "bio": survey_data.get("bio", ""),
                    "schedule": survey_data.get("schedule", ""),
                    "budget": survey_data.get("budget", ""),
                    "role": survey_data.get("role", ""),
                    "createdAt": survey_data.get("createdAt", ""),
                    "survey": {
                        "sleep_pattern": survey_data.get("sleep_pattern", ""),
                        "diet_type": survey_data.get("diet_type", ""),
                        "sharing_comfort": survey_data.get("sharing_comfort", ""),
                        "cleanliness_score": survey_data.get("cleanliness_score", ""),
                        "conflict_style": survey_data.get("conflict_style", ""),
                        "autonomy": survey_data.get("autonomy", "")
                    }
                }
            }
        
        # Fallback to users collection
        user_doc = users_collection.document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = user_doc.to_dict()
        profile = {
            "firstName": user_data.get("firstName", ""),
            "lastName": user_data.get("lastName", ""),
            "email": user_data.get("email", ""),
            "role": user_data.get("role", ""),
            "createdAt": user_data.get("createdAt", ""),
            "survey": user_data.get("survey", {})
        }
        return {"profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-profile")
async def update_profile(profile_update: ProfileUpdate):
    try:
        # Update in surveyResponses collection
        survey_ref = survey_responses_collection.document(profile_update.uid)
        update_data = {k: v for k, v in profile_update.dict().items() if v is not None and k != 'uid'}
        update_data['updatedAt'] = datetime.datetime.now()
        
        survey_ref.set(update_data, merge=True)

        
        return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))