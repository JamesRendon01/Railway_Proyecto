import os
from starlette.responses import Response

# Detecta el entorno (usa una variable de entorno ENV=dev o ENV=prod)
ENV = os.getenv("ENV", "dev")  # Por defecto "dev" si no está definida

async def security_headers(request, call_next):
    response: Response = await call_next(request)

    # Política básica de seguridad
    response.headers["Content-Security-Policy"] = (
        "default-src 'self' data: blob:; "
        "img-src 'self' http://localhost:8000 data: blob:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # X-Frame-Options: distinto para dev y producción
    if ENV == "production":
        # 🔒 En producción, bloquea iframes externos
        response.headers["X-Frame-Options"] = "DENY"
    else:
        # 💻 En desarrollo, permite iframes (útil para React en localhost)
        response.headers["X-Frame-Options"] = "SAMEORIGIN"

    return response
