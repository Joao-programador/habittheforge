import os
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Form, Response, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

async def get_user_id(request: Request) -> Optional[str]:
    token = request.cookies.get("sb-access-token")
    if not token:
        return None
    try:
        user_res = supabase.auth.get_user(token)
        return user_res.user.id
    except:
        return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
        
    try:
        response = supabase.table("habits").select("*").eq("user_id", user_id).execute()
        habits_data = []
        for h in response.data:
            meta = {}
            if h.get("description"):
                try:
                    meta = json.loads(h["description"])
                except:
                    pass
            habits_data.append({
                "id": h["id"],
                "name": h.get("title", ""),
                "emoji": meta.get("emoji", "🚀"),
                "color": meta.get("color", "#4f46e5")
            })
    except Exception as e:
        habits_data = []
        
    return templates.TemplateResponse(
        request=request, name="pages/dashboard.html", context={"title": "Dashboard - Habit Forge", "habits_json": habits_data}
    )

@app.get("/habits", response_class=HTMLResponse)
async def habits_page(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
        
    try:
        response = supabase.table("habits").select("*").eq("user_id", user_id).execute()
        habits_data = []
        for h in response.data:
            meta = {}
            if h.get("description"):
                try:
                    meta = json.loads(h["description"])
                except:
                    pass
            habits_data.append({
                "id": h["id"],
                "name": h.get("title", ""),
                "emoji": meta.get("emoji", "🚀"),
                "color": meta.get("color", "#4f46e5")
            })
    except Exception as e:
        habits_data = []
        
    return templates.TemplateResponse(
        request=request, name="pages/habits.html", context={"title": "Hábitos - Habit Forge", "habits_json": habits_data}
    )

@app.get("/auth", response_class=HTMLResponse)
async def auth(request: Request):
    return templates.TemplateResponse(
        request=request, name="pages/auth.html", context={"title": "Login - Habit Forge"}
    )

@app.post("/login", response_class=HTMLResponse)
async def login(response: Response, request: Request, email: str = Form(...), password: str = Form(...)):
    try:
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if auth_response.user:
            # Em aplicações reais, usaríamos JWT cookies. 
            # Como é ambiente desktop, usaremos um redirecionamento simples via HTMX.
            res = Response(status_code=200)
            res.set_cookie(
                key="sb-access-token", 
                value=auth_response.session.access_token, 
                httponly=True,
                secure=True,
                samesite="strict"
            )
            res.headers['HX-Redirect'] = '/'
            return res
    except Exception as e:
        return f'<div id="auth-error" class="text-destructive text-sm text-center mt-2">Erro: {str(e)}</div>'


@app.get("/planner", response_class=HTMLResponse)
async def planner(request: Request):
    return templates.TemplateResponse(
        request=request, name="pages/planner.html", context={"title": "Planner - Habit Forge"}
    )

@app.get("/todos", response_class=HTMLResponse)
async def todos(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
        
    try:
        response = supabase.table("todos").select("*").eq("user_id", user_id).execute()
        todos_data = response.data
    except Exception as e:
        todos_data = []
        
    return templates.TemplateResponse(
        request=request, name="pages/todos.html", context={"title": "Tarefas - Habit Forge", "todos_json": todos_data}
    )

from pydantic import BaseModel

class TodoCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    due_date: Optional[str] = None
    color: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    due_date: Optional[str] = None
    color: Optional[str] = None
    completed: Optional[bool] = None

@app.post("/api/todos")
async def create_todo(todo: TodoCreate, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    data = todo.model_dump()
    data["user_id"] = user_id
    if not data["due_date"]: del data["due_date"]
    res = supabase.table("todos").insert(data).execute()
    return res.data[0]

@app.put("/api/todos/{todo_id}")
async def update_todo(todo_id: str, todo: TodoUpdate, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    data = todo.model_dump(exclude_unset=True)
    if "due_date" in data and not data["due_date"]: data["due_date"] = None
    res = supabase.table("todos").update(data).eq("id", todo_id).eq("user_id", user_id).execute()
    return res.data[0] if res.data else {}

@app.delete("/api/todos/{todo_id}")
async def delete_todo(todo_id: str, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    supabase.table("todos").delete().eq("id", todo_id).eq("user_id", user_id).execute()
    return {"success": True}

class HabitCreate(BaseModel):
    name: str
    emoji: Optional[str] = '🚀'
    color: Optional[str] = '#4f46e5'

class HabitUpdate(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None

@app.post("/api/habits")
async def create_habit(habit: HabitCreate, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    
    description_json = json.dumps({"emoji": habit.emoji, "color": habit.color})
    data = {
        "title": habit.name,
        "description": description_json,
        "user_id": user_id
    }
    res = supabase.table("habits").insert(data).execute()
    row = res.data[0]
    
    # Return formatted for frontend
    return {
        "id": row["id"],
        "name": row["title"],
        "emoji": habit.emoji,
        "color": habit.color
    }

@app.put("/api/habits/{habit_id}")
async def update_habit(habit_id: str, habit: HabitUpdate, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    
    # Fetch existing to merge description
    existing = supabase.table("habits").select("*").eq("id", habit_id).eq("user_id", user_id).execute()
    if not existing.data: raise HTTPException(status_code=404)
    
    try:
        meta = json.loads(existing.data[0].get("description") or "{}")
    except:
        meta = {}
        
    if habit.emoji: meta["emoji"] = habit.emoji
    if habit.color: meta["color"] = habit.color
    
    data = {"description": json.dumps(meta)}
    if habit.name: data["title"] = habit.name
        
    res = supabase.table("habits").update(data).eq("id", habit_id).eq("user_id", user_id).execute()
    return {"success": True}

@app.delete("/api/habits/{habit_id}")
async def delete_habit(habit_id: str, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id: raise HTTPException(status_code=401)
    supabase.table("habits").delete().eq("id", habit_id).eq("user_id", user_id).execute()
    return {"success": True}

@app.get("/journal", response_class=HTMLResponse)
async def journal(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
    return templates.TemplateResponse(
        request=request, name="pages/journal.html", context={"title": "Diário - Habit Forge"}
    )

@app.get("/achievements", response_class=HTMLResponse)
async def achievements(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
    return templates.TemplateResponse(
        request=request, name="pages/achievements.html", context={"title": "Conquistas - Habit Forge"}
    )

@app.get("/settings", response_class=HTMLResponse)
async def settings(request: Request, user_id: Optional[str] = Depends(get_user_id)):
    if not user_id:
        return RedirectResponse(url="/auth", status_code=302)
    return templates.TemplateResponse(
        request=request, name="pages/settings.html", context={"title": "Configurações - Habit Forge"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
