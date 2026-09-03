import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

try:
    print(f"Tentando conectar no Supabase URL: {url}...")
    supabase: Client = create_client(url, key)
    
    # Simple query to check if we can reach the database
    # Assuming there might be a 'users' or 'habits' table, or just checking auth
    response = supabase.table('habits').select("*").limit(1).execute()
    print("Conexão bem sucedida!")
    print(f"Dados retornados da tabela 'habits': {response.data}")
except Exception as e:
    # If the table doesn't exist, it will throw a Postgrest API error, but we still connected successfully to the API
    if "relation" in str(e) and "does not exist" in str(e):
        print("Conexão com a API foi bem sucedida! O banco está respondendo.")
        print("Aviso: A tabela 'habits' ainda não existe no banco de dados.")
    else:
        print(f"Erro ao conectar: {e}")
