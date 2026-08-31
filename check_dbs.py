from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv("Backend_Node.js/.env")
client = MongoClient(os.getenv("MONGO_URI"))

print("All databases in cluster:")
for db_name in client.list_database_names():
    db = client[db_name]
    collections = db.list_collection_names()
    print(f"\n  Database: {db_name}")
    print(f"  Collections: {collections}")
    for coll_name in collections:
        count = db[coll_name].count_documents({})
        print(f"    - {coll_name}: {count} documents")

client.close()