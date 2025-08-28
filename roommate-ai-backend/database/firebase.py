import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firebase app (only once)
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

# Collections
users_collection = db.collection("users")
predictions_collection = db.collection("predictions")
