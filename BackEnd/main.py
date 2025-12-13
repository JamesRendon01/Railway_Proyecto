from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
load_dotenv()

from security.headers import security_headers
# Controladores
from controllers.turista_controller import router as turista_router
from controllers.administrador_controller import router as admin_router
from controllers.favorito_controller import router as favorito_router
from controllers.informe_controller import router as informe_router
from controllers.plan_controller import router as plan_router
from controllers.ubicacion_controller import router as ubicacion_router
from controllers.reserva_controller import router as reserva_router
from controllers.persona_reserva_controller import router as persona_reserva_router
from controllers.ciudad_controller import router as ciudad_router
from controllers.filtro_controller import router as filtro_router
from controllers.dashboard_controller import router as dashboard_router
from controllers.graficas_controller import router as graficas_router

# Scheduler
from apscheduler.schedulers.background import BackgroundScheduler
from utils.actualizar_reservas import actualizar_reservas_finalizadas

# =====================================================
# APP
# =====================================================
app = FastAPI(
    title="API de Reservas Turísticas",
    version="1.0"
)

# =====================================================
# CORS
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://railway-proyecto.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Static files (uploads)
# =====================================================
UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# =====================================================
# RUTAS
# =====================================================
app.include_router(turista_router)
app.include_router(admin_router)
app.include_router(favorito_router)
app.include_router(informe_router)
app.include_router(plan_router)
app.include_router(ubicacion_router)
app.include_router(reserva_router)
app.include_router(persona_reserva_router)
app.include_router(ciudad_router)
app.include_router(filtro_router)
app.include_router(dashboard_router)
app.include_router(graficas_router)

# =====================================================
# Security headers
# =====================================================
app.middleware("http")(security_headers)

# =====================================================
# Scheduler
# =====================================================
scheduler = BackgroundScheduler(timezone="UTC")

@app.on_event("startup")
def startup_event():
    print("🚀 Servidor iniciado")
    
    if not scheduler.running:
        scheduler.add_job(
            actualizar_reservas_finalizadas,
            "interval",
            hours=24,
            id="actualizar_reservas_job",
            replace_existing=True
        )
        scheduler.start()
        print("⏰ Scheduler iniciado")

    actualizar_reservas_finalizadas()
