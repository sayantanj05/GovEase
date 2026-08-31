from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv("Backend_Node.js/.env")
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME", "GovEase")]

print(f"Database: {db.name}")
print(f"Total users in 'users' collection: {db.users.count_documents({})}")
print("\nAll users:")
for user in db.users.find({}, {"password": 0, "mfaSecret": 0}):
    print(f"  - ID: {user['_id']}")
    print(f"    Email: {user.get('email')}")
    print(f"    Name: {user.get('fullName')}")
    print(f"    Role: {user.get('role')}")
    print(f"    Status: {user.get('status')}")
    print()

client.close()