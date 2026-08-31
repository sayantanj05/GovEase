from pymongo import MongoClient
from dotenv import load_dotenv
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
load_dotenv("Backend_Node.js/.env")
client = MongoClient(os.getenv("MONGO_URI"))
db = os.getenv("MONGO_DB_NAME", "GovEase")

print(f"Database: {db}")
print("\nUsers with field values:")
for user in client[db].users.find({"email": "fieldtest.user@example.com"}):
    print(f"  _id: {user['_id']}")
    print(f"  email: {user.get('email')}")
    print(f"  emailVerified: {user.get('emailVerified')}")
    print(f"  phoneVerified: {user.get('phoneVerified')}")
    print(f"  mfaEnabled: {user.get('mfaEnabled')}")

client.close()