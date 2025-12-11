// storage/favoritos_storage.js
import { create } from "zustand";

// Recuperar favoritos guardados en localStorage
const storedFavoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

export const useFavoritosStore = create((set) => ({
  favoritos: storedFavoritos,

  // Agregar o quitar favorito SOLO en localStorage
  toggleFavorito: (card) => {
    set((state) => {
      const existe = state.favoritos.find((fav) => fav.id === card.id);
      let nuevosFavoritos;

      if (existe) {
        // Quitar favorito
        nuevosFavoritos = state.favoritos.filter((fav) => fav.id !== card.id);
      } else {
        // Agregar favorito
        nuevosFavoritos = [...state.favoritos, card];
      }

      // Guardar en localStorage
      localStorage.setItem("favoritos", JSON.stringify(nuevosFavoritos));

      return { favoritos: nuevosFavoritos };
    });
  },

  // Cargar favoritos desde localStorage
  cargarFavoritos: () => {
    const data = JSON.parse(localStorage.getItem("favoritos")) || [];
    set({ favoritos: data });
  },

  // Limpiar favoritos (ej: logout)
  limpiarFavoritos: () => {
    set({ favoritos: [] });
    localStorage.removeItem("favoritos");
  },
}));
