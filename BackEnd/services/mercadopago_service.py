import requests

ACCESS_TOKEN = "TEST-2869344087763886-091422-a912886999b193ec65815b9afba28d8b-2669873305"
BASE_URL = "https://api.mercadopago.com/v1/payments"

def crear_pago(token_tarjeta: str, monto: float, descripcion: str, email_cliente: str):
    """
    Crea un pago en Mercado Pago y devuelve un diccionario con status y status_detail
    """
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "transaction_amount": monto,
        "token": token_tarjeta,
        "description": descripcion,
        "installments": 1,
        "payment_method_id": "visa",  # opcional: puede venir del frontend
        "payer": {"email": email_cliente}
    }

    try:
        response = requests.post(BASE_URL, json=data, headers=headers)
        response.raise_for_status()  # lanza error si el HTTP status es 4xx o 5xx
        pago = response.json()

        # Asegurarse de que siempre existan estos campos
        return {
            "id": pago.get("id"),
            "status": pago.get("status"),
            "status_detail": pago.get("status_detail"),
            "raw": pago  # todo el objeto para debugging
        }

    except requests.exceptions.HTTPError as http_err:
        # Retornar un formato consistente incluso si falla
        return {
            "status": "failed",
            "status_detail": f"HTTP error: {http_err}",
            "raw": response.text if response else str(http_err)
        }
    except Exception as e:
        return {
            "status": "failed",
            "status_detail": f"Error inesperado: {str(e)}",
            "raw": str(e)
        }
