"""
Supabase client setup.
We create two clients:
- supabase: uses anon key for normal user operations
- supabase_admin: uses service key for admin operations (bypasses RLS)
"""
from supabase import create_client, Client
from app.config import settings

# Regular client - respects Row Level Security
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Admin client - bypasses RLS, use carefully on backend only
supabase_admin: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
