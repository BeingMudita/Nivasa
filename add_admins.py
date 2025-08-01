from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.get_database("roommate_ai")
admin_emails_collection = db.get_collection("admins")

# List of admin emails to add
emails_to_add = [
    "admin1@example.com",
    "admin2@example.com",
    "richa@example.com",
    "priti@example.com"
]

# Insert if not already present
for email in emails_to_add:
    if not admin_emails_collection.find_one({"email": email}):
        admin_emails_collection.insert_one({"email": email})
        print(f"Added admin: {email}")
    else:
        print(f"Already exists: {email}")
