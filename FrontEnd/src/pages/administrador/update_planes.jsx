import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import FormularioGenerico from "../../components/form_admin.jsx"; // 🧩 Tu formulario genérico
import NavDashAdmin from "../../components/navDashAdmin.jsx";

export default function UpdatePlanes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState({
    nombre: "",
    descripcion_corta: "",
    descripcion: "",
    costo_persona: "",
    id_ciudad: "",
    imagen: null,
    mostrar_en_carrusel: false, // ✅ Nuevo campo
  });

  const [ciudades, setCiudades] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // 🔹 Cargar datos del plan y ciudades
  // ==========================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, ciudadesRes] = await Promise.all([
          fetch(`http://localhost:8000/plan/listar-plan-id/${id}`),
          fetch("http://localhost:8000/ciudad/listar_ciudades"),
        ]);

        const planData = await planRes.json();
        const ciudadesData = await ciudadesRes.json();

        setPlan({
          nombre: planData.nombre || "",
          descripcion_corta: planData.descripcion_corta || "",
          descripcion: planData.descripcion || "",
          costo_persona: planData.costo_persona || "",
          id_ciudad: planData.id_ciudad || "",
          imagen: planData.imagen || null,
          mostrar_en_carrusel: planData.mostrar_en_carrusel || false, // ✅ Cargar estado
        });

        if (planData.imagen)
          setPreview(`http://localhost:8000/uploads/planes_img/${planData.imagen}`);

        setCiudades(ciudadesData);
      } catch (error) {
        console.error("Error al cargar los datos del plan", error);
        message.error("Error al cargar la información del plan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ==========================================================
  // 🔹 Definir los campos dinámicos del formulario
  // ==========================================================
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
      label: "Mostrar en carrusel",
      tipo: "checkbox", // ✅ Nuevo campo tipo checkbox
    },
  ];

  // ==========================================================
  // 🔹 Manejadores
  // ==========================================================
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
    } else if (plan.imagen && typeof plan.imagen === "string") {
      setPreview(`http://localhost:8000/uploads/planes_img/${plan.imagen}`);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", plan.nombre);
    formData.append("descripcion_corta", plan.descripcion_corta);
    formData.append("descripcion", plan.descripcion);
    formData.append("costo_persona", plan.costo_persona);
    formData.append("id_ciudad", plan.id_ciudad);
    formData.append("mostrar_en_carrusel", plan.mostrar_en_carrusel); // ✅ Agregado

    if (plan.imagen instanceof File) {
      formData.append("imagen", plan.imagen);
    }

    try {
      const res = await fetch(`http://localhost:8000/plan/update/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        message.success("✅ Plan actualizado correctamente");
        navigate("/listar_planes_admin");
      } else {
        const errorData = await res.json();
        message.error(errorData.detail || "❌ Error al actualizar el plan");
      }
    } catch (error) {
      console.error("Error en la actualización:", error);
      message.error("❌ Error de conexión con el servidor");
    }
  };

  // ==========================================================
  // 🔹 Render principal
  // ==========================================================
  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div>

      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      <main className="flex-1 flex justify-center items-center">
        <FormularioGenerico
          titulo={`Editar Plan #${id}`}
          campos={campos}
          valores={plan}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          botonTexto="Guardar Cambios"
        />
      </main>
    </div>
  );
}
