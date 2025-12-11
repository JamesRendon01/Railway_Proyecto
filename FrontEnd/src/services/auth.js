// src/services/auth.js
export async function loginTurista(formData) {
  const res = await fetch("http://localhost:8000/turista/iniciarsesion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Credenciales inválidas");
  return data;
}
