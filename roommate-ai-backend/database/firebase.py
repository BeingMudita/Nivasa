import firebase_admin
from firebase_admin import credentials, firestore, auth

# Initialize Firebase app (run once)
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

# Collections
users_collection = db.collection("users")
admin_emails_collection = db.collection("admin_emails")
predictions_collection = db.collection("predictions")
auth_collection = db.collection("auth")  # for login/signup user profile info
