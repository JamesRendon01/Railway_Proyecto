import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const GraficoHorizontalPorcentual = ({ apiUrl = "http://localhost:8000/dashboard/resumenReservasPlanes" }) => {
  const [datos, setDatos] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(apiUrl)
      .then(res => {
        const data = res.data;
        setDatos(data);

        // Detectar automáticamente las subcategorías
        if (data.length > 0) {
          const keys = Object.keys(data[0]).filter(k => k !== "plan");
          setSubcategorias(keys);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <p>Cargando gráfica...</p>;
  if (datos.length === 0) return <p>No hay datos para mostrar.</p>;

  const categorias = datos.map(d => d.plan);

  const traces = subcategorias.map(sub => ({
    y: categorias,                // eje Y: categorías
    x: datos.map(d => d[sub]),    // eje X: valores
    name: sub,
    type: "bar",
    orientation: "h",             // barras horizontales
    text: datos.map(d => d[sub]),
    textposition: "auto",
  }));

  return (
    <Plot
      data={traces}
      layout={{
        title: "Distribución porcentual horizontal",
        barmode: "relative",
        barnorm: "percent",
        xaxis: { title: "Porcentaje", ticksuffix: "%" },
        yaxis: { title: "" },
        legend: { orientation: "h", y: -0.2 },
        margin: { t: 50, l: 100, r: 50, b: 50 },
      }}
      style={{ width: "100%", height: "400px" }}
      config={{ responsive: true }}
    />
  );
};

export default GraficoHorizontalPorcentual;
