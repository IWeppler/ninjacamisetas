import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  camisetaId: string;
  equipo: string;
  temporada: string;
  tipo?: string;
  talle: string;
  precio: number;
  cantidad: number;
  imagenUrl?: string | null;
  stockMaximo: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (camisetaId: string, talle: string) => void;
  updateQuantity: (camisetaId: string, talle: string, cantidad: number) => void;
  clearCart: () => void;
  
  // Control de la UI
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  
  // Selectores derivados (Getters)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          // Buscamos si ya existe EXACTAMENTE la misma camiseta en el mismo talle
          const existingItemIndex = state.items.findIndex(
            (item) => item.camisetaId === newItem.camisetaId && item.talle === newItem.talle
          );

          if (existingItemIndex >= 0) {
            // Si ya existe, actualizamos la cantidad (respetando el stock máximo)
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingItemIndex];
            
            const newQuantity = Math.min(
              currentItem.cantidad + newItem.cantidad, 
              currentItem.stockMaximo
            );

            updatedItems[existingItemIndex] = {
              ...currentItem,
              cantidad: newQuantity,
            };

            return { items: updatedItems, isOpen: true }; // Lo abrimos al agregar
          }

          // Si no existe, lo agregamos como nuevo ítem
          return { 
            items: [...state.items, newItem],
            isOpen: true // Lo abrimos al agregar
          };
        });
      },

      removeItem: (camisetaId, talle) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.camisetaId === camisetaId && item.talle === talle)
          ),
        }));
      },

      updateQuantity: (camisetaId, talle, cantidad) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.camisetaId === camisetaId && item.talle === talle) {
              // Nos aseguramos de no pasar el stock máximo ni bajar de 1
              const safeQuantity = Math.max(1, Math.min(cantidad, item.stockMaximo));
              return { ...item, cantidad: safeQuantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setIsOpen: (isOpen) => set({ isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      },
    }),
    {
      name: 'ninja-cart-storage', // Nombre clave en el localStorage
      // Solo persistimos los items, NO queremos que el carrito amanezca abierto por defecto
      partialize: (state) => ({ items: state.items }), 
    }
  )
);