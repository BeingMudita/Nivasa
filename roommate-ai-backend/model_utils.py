# model_utils.py

import joblib
import pandas as pd

# Load the model
model = joblib.load("compatibility_model.pkl")

def preprocess_input(data: dict):
    # Convert dict to DataFrame for prediction
    df = pd.DataFrame([data])

    # Convert categorical fields
    df['food_preference'] = df['food_preference'].map({'veg': 0, 'non-veg': 1})

    return df

def predict_compatibility(input_data: dict):
    df = preprocess_input(input_data)
    prediction = model.predict(df)
    return prediction[0]
