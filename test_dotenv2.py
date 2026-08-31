from dotenv import dotenv_values

config = dotenv_values("Backend_Node.js/.env")
print("All keys found:")
for key, value in config.items():
    print(f"  {key}: {value[:50] if value else 'None'}...")
    
print(f"\nMONGO_URI specifically: {config.get('MONGO_URI', 'KEY NOT FOUND')}")