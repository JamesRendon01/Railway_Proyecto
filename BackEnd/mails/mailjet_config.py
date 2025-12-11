from mailjet_rest import Client
import os
import base64
from dotenv import load_dotenv

# 🔹 Cargar variables de entorno
load_dotenv()

api_key = os.getenv("MAILJET_API_KEY")
api_secret = os.getenv("MAILJET_API_SECRET")

mailjet = Client(auth=(api_key, api_secret), version='v3.1')

# 📌 Correo de recuperación
def enviar_correo_recuperacion(destinatario, pin):
    data = {
        'Messages': [
            {
                "From": {"Email": "escapadeparfaite@gmail.com", "Name": "Escapade Parfaite"},
                "To": [{"Email": destinatario, "Name": "Usuario"}],
                "Subject": "Recuperación de contraseña",
                "TextPart": f"Tu código de recuperación es: {pin}",
                "HTMLPart": f"<h3>Recuperación de contraseña</h3><p>Tu código de recuperación es: <b>{pin}</b></p>"
            }
        ]
    }

    try:
        response = mailjet.send.create(data=data)
        body = response.json()
        status = body.get('Messages', [{}])[0].get('Status', 'error')
        return status.lower() == 'success'
    except Exception as e:
        print("❌ Excepción al enviar correo de recuperación:", e)
        return False


# 📌 Correo de bienvenida
def enviar_correo_bienvenida(destinatario, nombre_usuario):
    data = {
        'Messages': [
            {
                "From": {"Email": "escapadeparfaite@gmail.com", "Name": "Escapade Parfaite"},
                "To": [{"Email": destinatario, "Name": nombre_usuario}],
                "Subject": "¡Bienvenido a Escapade Parfaite! 🎉",
                "TextPart": f"Hola {nombre_usuario}, gracias por registrarte en Escapade Parfaite.",
                "HTMLPart": f"""
                    <h2>¡Bienvenido {nombre_usuario}! 🎉</h2>
                    <p>Gracias por registrarte en <b>Escapade Parfaite</b>. 
                    A partir de ahora podrás explorar y reservar experiencias únicas.</p>
                    <br>
                    <p>¡Estamos felices de tenerte con nosotros! 🌍✨</p>
                """
            }
        ]
    }

    try:
        response = mailjet.send.create(data=data)
        body = response.json()
        status = body.get('Messages', [{}])[0].get('Status', 'error')
        return status.lower() == 'success'
    except Exception as e:
        print("❌ Excepción al enviar correo de bienvenida:", e)
        return False


# 📌 Correo con comprobante PDF
def enviar_comprobante(reserva, pdf_bytes):
    data = {
        'Messages': [
            {
                "From": {"Email": "escapadeparfaite@gmail.com", "Name": "Escapade Parfaite"},
                "To": [
                    {
                        "Email": reserva.turista.correo,
                        "Name": reserva.turista.nombre
                    }
                ],
                "Subject": "Comprobante de Pago",
                "TextPart": "Adjunto encontrarás tu comprobante de pago.",
                "Attachments": [
                    {
                        "ContentType": "application/pdf",
                        "Filename": f"Comprobante_{reserva.id}.pdf",
                        "Base64Content": base64.b64encode(pdf_bytes).decode("utf-8")
                    }
                ]
            }
        ]
    }
    try:
        response = mailjet.send.create(data=data)
        return response.status_code
    except Exception as e:
        print("❌ Excepción al enviar comprobante:", e)
        return None
