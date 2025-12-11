import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const BreadcrumbContext = createContext();

export const useBreadcrumb = () => useContext(BreadcrumbContext);

export const BreadcrumbProvider = ({ children }) => {
  // 🔹 1. Inicializar desde localStorage si existe, si no usar valor por defecto
  const [breadcrumbItems, setBreadcrumbItems] = useState(() => {
    const stored = localStorage.getItem("breadcrumbItems");
    return stored
      ? JSON.parse(stored)
      : [
          { title: "Inicio", path: "/inicio" },
          { title: "Perfil", path: "/turista/editar/:id" },
        ];
  });

  const location = useLocation();
  const navigationType = useNavigationType();

  // 🔹 2. Guardar siempre que cambien los breadcrumbs
  useEffect(() => {
    localStorage.setItem("breadcrumbItems", JSON.stringify(breadcrumbItems));
  }, [breadcrumbItems]);

  // 🔹 3. Manejar cambio de ruta
  useEffect(() => {
    const path = location.pathname;

    // Si estamos en la página de inicio, solo mostrar Inicio
    if (path === "/inicio") {
      setBreadcrumbItems([{ title: "Inicio", path }]);
      return;
    }

    // Si el usuario navega hacia atrás (POP), limpia breadcrumb de la ruta actual
    if (navigationType === "POP") {
      setBreadcrumbItems((prev) => prev.filter((b) => b.path !== path));
    }
  }, [location.pathname, navigationType]);

  // 🔹 4. Función para agregar breadcrumb evitando duplicados
  const addBreadcrumb = useCallback((item) => {
    setBreadcrumbItems((prev) => {

      if (prev.some((b) => b.path === item.path)) return prev;
      return [...prev, item];
    });
  }, []);

  // 🔹 5. Resetear breadcrumb
  const resetBreadcrumb = useCallback(() => {
    const initial = [
      { title: "Inicio", path: "/inicio" },
      { title: "Perfil", path: "/turista/editar/:id" },
    ];
    setBreadcrumbItems(initial);
    localStorage.setItem("breadcrumbItems", JSON.stringify(initial));
  }, []);

  return (
    <BreadcrumbContext.Provider
      value={{ breadcrumbItems, addBreadcrumb, resetBreadcrumb }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};
export default BreadcrumbContext;