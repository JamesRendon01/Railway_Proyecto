// components/breadcrumb.jsx
import React from "react";
import { Breadcrumb } from "antd";
import { useBreadcrumb } from "../context/breadcrumb_context.jsx";
import { Link } from "react-router-dom";

export default function BreadcrumbNav() {
  const breadcrumbContext = useBreadcrumb();

  // ⚠️ Previene errores si el contexto aún no está disponible
  if (!breadcrumbContext) {
    console.warn("⚠️ BreadcrumbNav se está renderizando sin BreadcrumbProvider");
    return null;
  }

  const { breadcrumbItems } = breadcrumbContext;

  // ⚠️ Verificación adicional
  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <div className="px-6">
      <Breadcrumb
        separator=">"
        items={breadcrumbItems.map((item, index) => ({
          title:
            index === breadcrumbItems.length - 1 ? (
              <span className="text-black font-bold">{item.title}</span>
            ) : (
              <Link to={item.path} className="text-white hover:underline">
                {item.title}
              </Link>
            ),
        }))}
      />
    </div>
  );
}
