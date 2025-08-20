import json
import os
from supabase import create_client, Client
# Simple config generation without complex imports
from dotenv import load_dotenv

# Load .env file from project root (../ relative to /math folder)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # use service role key for uploads

if not url or not key:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(url, key)

def generate_config():
    """
    Generate a simple game config with default values.
    """
    rtp = 0.97
    house_edge = 1.0 - rtp
    
    return {
        "game_id": "0_0_asample",
        "provider_name": "sample_provider",
        "game_name": "sample_lines",
        "rtp": rtp,
        "house_edge": house_edge,
        "max_bet": 1000,
    }

def main():
    config = generate_config()
    data = json.dumps(config).encode("utf-8")

    file_name = "game-config.json"
    bucket = "configs"

    try:
        res = supabase.storage.from_(bucket).upload(
            file_name,
            data,
            {
                "content-type": "application/json",
                "upsert": "true"
            }
        )
        print("✅ Uploaded:", res)
    except Exception as e:
        print("❌ Upload failed:", e)

if __name__ == "__main__":
    main()
