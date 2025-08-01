from motor.motor_asyncio import AsyncIOMotorClient
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client.roommateDB
user_collection = db.users
match_collection = db.matches
