// components/CrudTable.jsx
import React from "react";
import Paginacion from "./paginacion";
import ButtonGenerico from "./button_create";
import { useNavigate } from "react-router-dom";

export default function CrudTable({
  headers = [],
  data = [],
  currentPage = 1,
  pageSize = 5,
  totalItems = 0,
  onPageChange,
  onCreate,
  onEdit,
  onDelete,
  renderActions, // 👈 Opción para personalizar las acciones
}) {
  // Calcular datos paginados
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const dataPaginada = data.slice(startIndex, endIndex);
  const navigate = useNavigate();

  return (
    <div className="pt-10 bg-fondo flex flex-col items-center">
      <table className="w-300 bg-white border-2 border-black rounded-lg text-center">
        <thead className="bg-gray-100 font-title">
          <tr>
            {headers.map((head) => (
              <th
                key={head.key}
                className="py-2 px-4 text-center border-b border-gray-800 font-medium"
              >
                {head.label}
              </th>
            ))}
            {onCreate && (
              <th>
                <ButtonGenerico
                  texto="Nuevo Plan"
                  onClick={() => navigate("/create-plan")} />
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {dataPaginada.length > 0 ? (
            dataPaginada.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {headers.map((head) => (
                  <td
                    key={head.key}
                    className="py-2 px-4 border-b text-center"
                  >
                    {head.render
                      ? head.render(item[head.key], item)
                      : item[head.key]}
                  </td>
                ))}
                {renderActions && (
                  <td className="py-2 px-4 border-b">{renderActions(item)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length + (renderActions ? 1 : 0)}
                className="text-center py-4"
              >
                No hay registros disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Paginación */}
      <div className="mt-5">
        <Paginacion
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onChange={onPageChange}
        />
      </div>
    </div>
  );
}
