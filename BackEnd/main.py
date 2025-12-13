from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from security.headers import security_headers

# Importar los controladores
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

# 🔹 APScheduler para tareas automáticas
from apscheduler.schedulers.background import BackgroundScheduler
from utils.actualizar_reservas import actualizar_reservas_finalizadas

# 🧩 Inicialización de FastAPI
app = FastAPI(title="API de Reservas Turísticas", version="1.0")

# 🌐 CORS ────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "https://cbbtpx6d-4000.use2.devtunnels.ms",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://railway-proyecto.vercel.app"],        # dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],          # todos los métodos (GET, POST, PUT, DELETE)
    allow_headers=["*"],          # todos los encabezados
)

# 🧱 Archivos estáticos ──────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 🔗 Rutas ────────────────────────────────────────────────
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

# 🛡️ Middleware de seguridad ─────────────────────────────
# ⚠️ Se registra después del CORS para no eliminar sus encabezados
app.middleware("http")(security_headers)

# 🕒 ────────────────────────────────────────────────
#     CONFIGURACIÓN DE TAREA AUTOMÁTICA (APScheduler)
# ──────────────────────────────────────────────────
scheduler = BackgroundScheduler()
scheduler.add_job(actualizar_reservas_finalizadas, "interval", hours=24)
scheduler.start()

# 🟢 Ejecutar al iniciar el servidor también
@app.on_event("startup")
def startup_event():
    print("🚀 Servidor iniciado. Verificando reservas vencidas...")
    actualizar_reservas_finalizadas()
