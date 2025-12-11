import axios from "axios";

const API_URL = "http://localhost:8000/informe"; // Ajusta si cambia tu backend

/**
 * 📤 Envía el archivo PDF al backend y crea el registro en la BD
 */
export const subirInforme = async (nombre, idAdministrador, archivo) => {
  try {
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("id_administrador", idAdministrador);
    formData.append("archivo", archivo);

    const response = await axios.post(API_URL + "/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al subir el informe:", error);
    throw error;
  }
};
