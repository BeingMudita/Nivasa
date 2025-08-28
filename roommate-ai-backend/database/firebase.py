import firebase_admin
from firebase_admin import credentials, firestore

# Only initialize if no app exists
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase_key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
users_collection = db.collection("users")
predictions_collection = db.collection("predictions")
