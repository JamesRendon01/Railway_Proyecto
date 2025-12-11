import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import FormularioGenerico from "../../components/form_admin.jsx";
import NavDashAdmin from "../../components/navDashAdmin.jsx";

export default function CreatePlan() {
  const navigate = useNavigate();

  // ===============================
  // 🔹 Estado principal
  // ===============================
  const [plan, setPlan] = useState({
    nombre: "",
    descripcion_corta: "",
    descripcion: "",
    costo_persona: "",
    id_ciudad: "",
    id_informe: "",
    imagen: null,
    mostrar_en_carrusel: false, // ✅ Nuevo campo booleano
  });

  const [preview, setPreview] = useState(null);
  const [ciudades, setCiudades] = useState([]);

  // ===============================
  // 🔹 Cargar ciudades al inicio
  // ===============================
  useEffect(() => {
    fetch("http://localhost:8000/ciudad/listar_ciudades")
      .then((res) => res.json())
      .then(setCiudades)
      .catch(() => message.error("No se pudieron cargar las ciudades"));
  }, []);

  // ===============================
  // 🔹 Definición de campos dinámicos
  // ===============================
  const campos = [
    { nombre: "imagen", label: "Imagen", tipo: "file", preview },
    { nombre: "nombre", label: "Nombre", tipo: "text", required: true },
    { nombre: "descripcion_corta", label: "Descripción Corta", tipo: "text", required: true },
    { nombre: "descripcion", label: "Descripción", tipo: "textarea", required: true },
    { nombre: "costo_persona", label: "Costo por Persona", tipo: "number", required: true },
    {
      nombre: "id_ciudad",
      label: "Ciudad",
      tipo: "select",
      opciones: ciudades,
      required: true,
    },
    {
      nombre: "mostrar_en_carrusel",
      label: "Mostrar en carrusel principal",
      tipo: "checkbox", // ✅ Campo nuevo
    },
  ];

  // ===============================
  // 🔹 Manejadores
  // ===============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlan((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPlan((prev) => ({ ...prev, imagen: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔸 Validaciones básicas
    if (!plan.nombre.trim()) return message.warning("El nombre es obligatorio");
    if (!plan.descripcion_corta.trim()) return message.warning("La descripción corta es obligatoria");
    if (!plan.descripcion.trim()) return message.warning("La descripción es obligatoria");
    if (!plan.costo_persona) return message.warning("El precio por persona es obligatorio");
    if (!plan.id_ciudad) return message.warning("Debe seleccionar una ciudad");

    // 🔸 Crear objeto FormData
    const formData = new FormData();
    formData.append("nombre", plan.nombre);
    formData.append("descripcion_corta", plan.descripcion_corta);
    formData.append("descripcion", plan.descripcion);
    formData.append("costo_persona", parseFloat(plan.costo_persona));
    formData.append("id_ciudad", Number(plan.id_ciudad));
    formData.append("mostrar_en_carrusel", plan.mostrar_en_carrusel); // ✅ Nuevo

    if (plan.imagen) formData.append("imagen", plan.imagen);

    try {
      const res = await fetch("http://localhost:8000/plan/crear-plan", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        message.success("✅ Plan creado correctamente");
        navigate("/listar_planes_admin");
      } else {
        const errorData = await res.json();
        message.error(errorData.detail || "❌ Error al crear el plan");
      }
    } catch (error) {
      console.error(error);
      message.error("❌ Error de conexión con el servidor");
    }
  };

  // ===============================
  // 🔹 Render principal
  // ===============================
  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex justify-center items-center">
        <FormularioGenerico
          titulo="Crear Plan"
          campos={campos}
          valores={plan}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          botonTexto="Crear Plan"
        />
      </main>
    </div>
  );
}
