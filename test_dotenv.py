from pathlib import Path
from dotenv import load_dotenv
import os

dotenv_path = Path("Backend_Node.js/.env")
print(f"Looking for .env at: {dotenv_path.absolute()}")
print(f"Exists: {dotenv_path.exists()}")

load_dotenv(dotenv_path)

print(f"MONGO_URI: {os.getenv('MONGO_URI', 'NOT FOUND')}")
print(f"MONGO_DB_NAME: {os.getenv('MONGO_DB_NAME', 'NOT FOUND')}")