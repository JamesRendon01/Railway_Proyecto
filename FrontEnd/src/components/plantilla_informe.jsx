import React from "react";

export default function PlantillaInforme({ nombreInforme, fecha, titulo, imagenGrafica }) {
  return (
    <div
      className="p-8 bg-white text-gray-900 w-[1123px] h-[794px]"
      style={{
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <header className="text-center mb-6 border-b pb-4">
        <img
            className="mx-auto w-40"
            src="/img/logo.png"
            alt="logo"
          />
        <h1 className="text-3xl font-bold text-blue-700">{nombreInforme}</h1>
        <p className="text-gray-600">Fecha de generación: {fecha}</p>
      </header>

      <section className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{titulo}</h2>
      </section>

      <section className="flex justify-center">
        <img
          src={imagenGrafica}
          alt="Gráfica del informe"
          style={{
            maxWidth: "90%",
            maxHeight: "450px",
            borderRadius: "12px",
            border: "2px solid #ccc",
            objectFit: "contain",
          }}
        />
      </section>

      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>Generado automáticamente por el sistema de reportes turísticos</p>
      </footer>
    </div>
  );
}
