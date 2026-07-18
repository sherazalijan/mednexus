# Use the folder structure: app -> database -> base.py
from app.database.base import engine 

try:
    with engine.connect() as connection:
        print("Successfully connected to the Neon database!")
except Exception as e:
    print(f"Connection failed: {e}")