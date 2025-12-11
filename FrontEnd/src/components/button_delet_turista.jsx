import { useNavigate } from "react-router-dom";

export default function ButtonDeleteTurista({ onDeleted }) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        const confirm1 = window.confirm("¿Seguro que deseas eliminar tu cuenta?");
        if (!confirm1) return;

        const confirm2 = window.confirm("⚠️ Esta acción es irreversible. ¿Confirmas eliminar tu cuenta?");
        if (!confirm2) return;

        try {
            const response = await fetch("http://localhost:8000/turista/eliminar-perfil", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                alert("✅ Cuenta eliminada correctamente");
                localStorage.removeItem("token"); // Limpiar token
                if (onDeleted) onDeleted(); // callback opcional
                navigate("/turista"); // redirigir al login
            } else {
                const error = await response.json();
                alert("❌ Error al eliminar: " + (error.detail || "Error desconocido"));
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error de conexión con el servidor");
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="w-30 h-12 rounded-xl bg-red-500 text-white px-3 py-1 hover:bg-red-600 border-2 border-black font-bold"
        >
            Eliminar mi cuenta
        </button>
    );
}
