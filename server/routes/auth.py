from fastapi import APIRouter, HTTPException
from models.user import UserCredentials
from database import users_collection, admin_emails_collection

router = APIRouter()

@router.post("/signup")
def signup(user: UserCredentials):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    users_collection.insert_one(user.dict())
    return {"message": "Signup successful", "is_admin": is_admin(user.email)}

@router.post("/login")
def login(user: UserCredentials):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "is_admin": is_admin(user.email)}

def is_admin(email: str) -> bool:
    return admin_emails_collection.find_one({"email": email}) is not None
