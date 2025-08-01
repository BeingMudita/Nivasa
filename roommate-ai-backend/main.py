from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
from database import responses_collection

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the ML model
try:
    with open("compatibility_model.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    model = None
    print(f"Error loading model: {e}")

# Request schema
class SurveyResponse(BaseModel):
    age: int
    cleanliness: int
    introvert_extrovert: int
    wake_sleep: int
    music: int
    food: int
    work_schedule: int

@app.get("/")
def root():
    return {"message": "Roommate Compatibility API is running"}

@app.get("/test-db")
def test_database():
    try:
        responses_collection.insert_one({"test": "connection success"})
        return {"message": "Database connection successful!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

@app.post("/predict")
def predict_compatibility(response: SurveyResponse):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Convert input to model format
    input_data = [[
        response.age,
        response.cleanliness,
        response.introvert_extrovert,
        response.wake_sleep,
        response.music,
        response.food,
        response.work_schedule
    ]]

    try:
        prediction = model.predict(input_data)[0]
        record = response.dict()
        record["prediction"] = prediction

        # Save to MongoDB
        responses_collection.insert_one(record)

        return {"compatibility_score": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
