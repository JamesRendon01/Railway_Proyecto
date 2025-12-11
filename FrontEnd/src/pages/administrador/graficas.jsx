import { useEffect, useState } from "react";
import axios from "axios";
import NavDashAdmin from "../../components/navDashAdmin.jsx";
import GraficasGenerico from "../../components/graficasGenerico.jsx";
import Contador from "../../components/contador.jsx";
import BarraCarga from "../../components/barraCarga.jsx";
import FiltroFechas from "../../components/filtroGraficas.jsx";

// =====================================================
// 🗓️ Funciones auxiliares de formato
// =====================================================

// 🔹 Formatear cualquier tipo de periodo (día, semana, mes o año)
const formatearPeriodo = (valor, modo) => {
  if (!valor) return "Sin datos";

  // 📅 Día: YYYY-MM-DD
  if (modo === "dia" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const fecha = new Date(valor + "T00:00:00");
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // 📆 Mes: YYYY-MM
  if (modo === "mes" && /^\d{4}-\d{2}$/.test(valor)) {
    const [anio, mes] = valor.split("-");
    const nombresMeses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    return `${nombresMeses[parseInt(mes) - 1]} ${anio}`;
  }

  // 🗓️ Semana: 2025-W42
  if (modo === "semana" && /^\d{4}-W?\d{1,2}$/.test(valor)) {
    const [anio, semana] = valor.replace("W", "-").split("-");
    return `Sem ${semana} - ${anio}`;
  }

  // 📊 Año: YYYY
  if (modo === "anio" && /^\d{4}$/.test(valor)) {
    return valor;
  }

  // 🔸 Valor por defecto
  return valor;
};

// 🔹 Calcular diferencia de días entre dos fechas
const diasEntreFechas = (inicio, fin) => {
  if (!inicio || !fin) return 0;
  const diff = Math.abs(new Date(fin) - new Date(inicio));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// 🔹 Determinar modo de agrupación según el rango
const determinarModo = (inicio, fin) => {
  const dias = diasEntreFechas(inicio, fin);
  if (dias <= 7) return "dia";
  if (dias <= 30) return "semana";
  if (dias <= 365) return "mes";
  return "anio";
};

// =====================================================
// 📊 Componente principal
// =====================================================
export default function Estadisticas() {
  const [totales, setTotales] = useState(null);
  const [dataPlanes, setDataPlanes] = useState([]);
  const [dataCiudades, setDataCiudades] = useState([]);
  const [dataReservas, setDataReservas] = useState([]);
  const [modoPlanes, setModoPlanes] = useState("mes");
  const [modoReservas, setModoReservas] = useState("mes");
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:8000/graficas";

  // =====================================================
  // 🧠 Helper genérico de carga de datos
  // =====================================================
  const fetchData = async (url, params = {}, transform = (x) => x) => {
    try {
      const res = await axios.get(url, { params });
      return transform(res.data.data);
    } catch (err) {
      console.error(`Error al cargar datos desde ${url}:`, err);
      return [];
    }
  };

  // =====================================================
  // 📈 Carga de información
  // =====================================================
  const cargarTotales = async () => {
    try {
      const res = await axios.get("http://localhost:8000/dashboard/totales");
      setTotales(res.data);
    } catch (err) {
      console.error("Error al cargar totales:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarPlanes = async (inicio, fin) => {
    const modo = inicio && fin ? determinarModo(inicio, fin) : "mes";
    setModoPlanes(modo);
    const data = await fetchData(
      `${BASE_URL}/planes_por_periodo`,
      { fecha_inicio: inicio, fecha_fin: fin, agrupacion: modo },
      (datos) =>
        datos.map((d) => ({
          ...d,
          periodo: formatearPeriodo(d.periodo, modo),
        }))
    );
    setDataPlanes(data);
  };

  const cargarCiudades = async (inicio, fin) => {
    const data = await fetchData(
      `${BASE_URL}/ciudades_mas_reservas`,
      { fecha_inicio: inicio, fecha_fin: fin }
    );
    setDataCiudades(data);
  };

  const cargarReservas = async (inicio, fin) => {
    const modo = inicio && fin ? determinarModo(inicio, fin) : "mes";
    setModoReservas(modo);
    const data = await fetchData(
      `${BASE_URL}/reservas_por_periodo`,
      { fecha_inicio: inicio, fecha_fin: fin, agrupacion: modo },
      (datos) =>
        datos.map((d) => ({
          ...d,
          periodo: formatearPeriodo(d.periodo, modo),
        }))
    );
    setDataReservas(data);
  };

  // =====================================================
  // 🚀 Carga inicial por mes (sin filtro)
  // =====================================================
  useEffect(() => {
    Promise.all([
      cargarTotales(),
      cargarPlanes(),
      cargarCiudades(),
      cargarReservas(),
    ]);
  }, []);

  // =====================================================
  // ⏳ Estado de carga
  // =====================================================
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <BarraCarga size={80} color="primary" />
        <p className="text-gray-700 text-lg font-semibold">
          Cargando información del dashboard...
        </p>
      </div>
    );

  // =====================================================
  // 📊 Contadores principales
  // =====================================================
  const items = [
    { titulo: "Total Reservas", valor: totales?.total_reservas ?? 0 },
    { titulo: "Total Turistas", valor: totales?.total_turistas ?? 0 },
    { titulo: "Total Planes", valor: totales?.total_planes ?? 0 },
  ];

  // =====================================================
  // 🧭 Render principal
  // =====================================================
  return (
    <div className="flex min-h-screen">
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      <main className="flex-1 p-6">
        <section>
          <Contador items={items} />
          <hr className="border-t-2 border-black my-6 w-full" />

          {/* 📆 Planes creados */}
          <FiltroFechas
            titulo="📆 Filtro de Planes"
            onFiltrar={cargarPlanes}
          />
          <GraficasGenerico
            data={dataPlanes}
            campoEjeX="periodo"
            campoValor="total_planes"
            titulo="Planes creados"
            tipo="barras"
            modoTiempo={modoPlanes}
          />

          <hr className="border-t-2 border-black my-6 w-full" />

          {/* 🗓️ Reservas */}
          <FiltroFechas
            titulo="🗓️ Filtro de Reservas"
            onFiltrar={cargarReservas}
          />
          <GraficasGenerico
            data={dataReservas}
            campoEjeX="periodo"
            campoValor="total_reservas"
            titulo="Reservas"
            tipo="lineas"
            modoTiempo={modoReservas}
          />

          <hr className="border-t-2 border-black my-6 w-full" />

          {/* 🏙️ Ciudades */}
          <FiltroFechas
            titulo="🏙️ Filtro de Ciudades"
            onFiltrar={cargarCiudades}
          />
          <GraficasGenerico
            data={dataCiudades}
            campoEjeX="ciudad"
            campoValor="total_reservas"
            titulo="Ciudades con más reservas"
            tipo="pastel"
          />
        </section>
      </main>
    </div>
  );
}
