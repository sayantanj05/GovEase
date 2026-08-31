from pymongo import MongoClient
from dotenv import load_dotenv
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
load_dotenv("Backend_Node.js/.env")
client = MongoClient(os.getenv("MONGO_URI"))
db_name = os.getenv("MONGO_DB_NAME", "GovEase")
db = client[db_name]

print("=== Profile Management Module - Data Verification ===")
print(f"\nDatabase: {db_name}")

print(f"\n1. Users: {db.users.count_documents({})}")
for u in db.users.find({}, {"password": 0}):
    print(f"   - {u['_id']}: {u.get('fullName')} ({u.get('email')})")

print(f"\n2. Profiles: {db.profiles.count_documents({})}")
for p in db.profiles.find({}):
    print(f"   - {p['_id']}: {p.get('fatherName')}, Age: {p.get('age')}, Score: {p.get('completenessScore')}%")

print(f"\n3. Addresses: {db.addresses.count_documents({})}")

print(f"\n4. Education: {db.education.count_documents({})}")
for e in db.education.find({}):
    print(f"   - {e['_id']}: {e.get('educationType')} - {e.get('degree')} ({e.get('institution')})")

print(f"\n5. Experience: {db.experience.count_documents({})}")
for x in db.experience.find({}):
    print(f"   - {x['_id']}: {x.get('organization')} - {x.get('role')} ({x.get('durationMonths')} months)")

print(f"\n6. Skills: {db.skills.count_documents({})}")
for s in db.skills.find({}):
    print(f"   - {s['_id']}: {s.get('name')} ({s.get('skillType')}) - {s.get('proficiency')}")

print(f"\n7. Identities: {db.identities.count_documents({})}")
for i in db.identities.find({}):
    for id_item in i.get("ids", []):
        print(f"   - {id_item.get('idType')}: {id_item.get('idNumber')} (Image: {'Yes' if id_item.get('imageFileId') else 'No'})")

print(f"\n8. Preferences: {db.user_preferences.count_documents({})}")
for p in db.user_preferences.find({}):
    print(f"   - Hobbies: {p.get('hobbies')}")
    print(f"     Interests: {p.get('interests')}")

client.close()