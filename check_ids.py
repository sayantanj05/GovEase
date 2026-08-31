from pymongo import MongoClient
from dotenv import load_dotenv
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
load_dotenv("Backend_Node.js/.env")
client = MongoClient(os.getenv("MONGO_URI"))
db = os.getenv("MONGO_DB_NAME", "GovEase")

print(f"Database: {db}")
print(f"Total users: {client[db].users.count_documents({})}")
print("\nAll users with custom IDs:")
for user in client[db].users.find({}).sort("_id", 1):
    print(f"  - _id: {user['_id']}")
    print(f"    Email: {user.get('email')}")
    print(f"    Name: {user.get('fullName')}")
    print()

client.close()