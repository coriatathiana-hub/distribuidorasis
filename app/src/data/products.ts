// Product data - consolidated catalog (duplicates by size/color removed)
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  image?: string;
}

export const CATEGORIES = {
  EPP: "Equipo de Protección Personal",
  SENALIZACION: "Señalización y Delimitación",
  ACCESORIOS: "Accesorios de Seguridad",
  HERRAMIENTAS: "Herramientas y Equipos",
} as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  EPP: [
    "Protección de Cabeza",
    "Protección Ocular/Facial",
    "Protección Respiratoria",
    "Protección Auditiva",
    "Protección de Manos",
    "Calzado Industrial",
    "Ropa de Trabajo",
    "Alta Visibilidad",
    "Seguridad en Alturas",
  ],
  SENALIZACION: ["Cintas", "Mallas", "Señalamientos"],
  ACCESORIOS: ["Soportes", "Complementos"],
  HERRAMIENTAS: ["Cuerdas", "Equipos Diversos"],
};

export const PRODUCTS: Product[] = [
  // --- Seguridad en Alturas ---
  { id: "1", name: "Arnés de Seguridad 3 Aros", description: "Arnés de seguridad de 3 aros para trabajo en alturas", category: "EPP", subcategory: "Seguridad en Alturas", image: "/products/arnes-3-aros.jpg" },
  { id: "2", name: "Arnés V-Form MSA", description: "Arnés V-Form Raceform con argolla D en espalda, ajuste rápido en piernas, marca MSA", category: "EPP", subcategory: "Seguridad en Alturas", image: "/products/arnes-vform-msa.jpg" },
  { id: "3", name: "Línea de Vida Tejida", description: "Línea de vida tejida para sistemas de protección contra caídas", category: "EPP", subcategory: "Seguridad en Alturas", image: "/products/linea-vida-tejida.jpg" },

  // --- Protección de Cabeza ---
  { id: "4", name: "Casco Ala Ancha MSA", description: "Casco de seguridad Clase E, Tipo 1, ala ancha, marca MSA. Disponible en varios colores", category: "EPP", subcategory: "Protección de Cabeza", image: "/products/casco-ala-ancha-msa.jpg" },
  { id: "5", name: "Casco Tipo Cachucha MSA", description: "Casco de seguridad Clase E, Tipo 1, tipo cachucha con suspensión de puntos, marca MSA", category: "EPP", subcategory: "Protección de Cabeza", image: "/products/casco-cachucha-msa.jpg" },
  { id: "6", name: "Casco con Matraca MSA", description: "Casco de seguridad Clase E, Tipo 1, ala ancha con sistema de ajuste matraca, marca MSA", category: "EPP", subcategory: "Protección de Cabeza", image: "/products/casco-matraca-msa.jpg" },
  { id: "7", name: "Barbiquejo para Casco", description: "Barbiquejo de sujeción para casco de seguridad industrial", category: "EPP", subcategory: "Protección de Cabeza", image: "/products/barbiquejo.jpg" },
  { id: "8", name: "Cubre Nuca", description: "Cubre nuca para protección solar adaptable a casco de seguridad", category: "EPP", subcategory: "Protección de Cabeza", image: "/products/cubre-nuca.jpg" },

  // --- Protección Ocular/Facial ---
  { id: "9", name: "Lentes de Seguridad Claros", description: "Lentes de seguridad transparentes Kleenguard / MSA Cooper para protección ocular", category: "EPP", subcategory: "Protección Ocular/Facial", image: "/products/lentes-claros.jpg" },
  { id: "10", name: "Lentes de Seguridad Oscuros", description: "Lentes de seguridad con filtro oscuro para trabajo en exteriores", category: "EPP", subcategory: "Protección Ocular/Facial", image: "/products/lentes-oscuros.jpg" },
  { id: "11", name: "Careta para Soldador", description: "Careta de soldador adaptable a casco MSA tipo cachucha", category: "EPP", subcategory: "Protección Ocular/Facial", image: "/products/careta-soldador.jpg" },

  // --- Protección Respiratoria ---
  { id: "12", name: "Mascarilla de Seguridad", description: "Mascarilla de protección respiratoria para partículas y vapores", category: "EPP", subcategory: "Protección Respiratoria", image: "/products/mascarilla.jpg" },

  // --- Protección Auditiva ---
  { id: "13", name: "Orejeras de Seguridad", description: "Orejeras de protección auditiva para ambientes industriales de alto ruido", category: "EPP", subcategory: "Protección Auditiva", image: "/products/orejeras.jpg" },
  { id: "14", name: "Tapones Auditivos", description: "Tapones auditivos desechables para protección contra ruido", category: "EPP", subcategory: "Protección Auditiva", image: "/products/tapones-auditivos.jpg" },

  // --- Protección de Manos ---
  { id: "15", name: "Guante de Alto Impacto", description: "Guante de alto impacto grado 5 para trabajo pesado industrial", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-alto-impacto.jpg" },
  { id: "16", name: "Guante de Nitrilo Ansell", description: "Guante de nitrilo marca Ansell para manejo de químicos y líquidos", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-nitrilo-ansell.jpg" },
  { id: "17", name: "Guante Anticorte Nitrilo", description: "Guante anticorte recubierto de nitrilo, marca Truper", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-anticorte-nitrilo.jpg" },
  { id: "18", name: "Guante Anticorte Poliuretano", description: "Guante anticorte recubierto de poliuretano, marca Truper", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-anticorte-pu.jpg" },
  { id: "19", name: "Guante para Soldador", description: "Guantes largos reforzados de carnaza para soldador", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-soldador.jpg" },
  { id: "20", name: "Guante para Argonero", description: "Guantes especializados para soldadura con argón (TIG)", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-argonero.jpg" },
  { id: "21", name: "Guante de Látex Uline", description: "Guantes recubiertos de látex Super Gription marca Uline", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-latex-uline.jpg" },
  { id: "22", name: "Guante de Carnaza Pretul", description: "Guante de carnaza para trabajo general, marca Pretul", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-carnaza-pretul.jpg" },
  { id: "23", name: "Guante de Tela", description: "Guantes de tela para trabajo ligero y manejo de materiales", category: "EPP", subcategory: "Protección de Manos", image: "/products/guante-tela.jpg" },

  // --- Calzado Industrial ---
  { id: "24", name: "Bota con Casquillo", description: "Bota de seguridad con casquillo tipo II, diversas tallas disponibles", category: "EPP", subcategory: "Calzado Industrial", image: "/products/bota-casquillo.jpg" },
  { id: "25", name: "Bota Tipo Petrolera", description: "Bota de seguridad tipo petrolero para trabajo pesado en campo", category: "EPP", subcategory: "Calzado Industrial", image: "/products/bota-petrolera.jpg" },
  { id: "26", name: "Bota Red Wing", description: "Bota de seguridad premium marca Red Wing Shoes modelo 8241", category: "EPP", subcategory: "Calzado Industrial", image: "/products/bota-red-wing.jpg" },
  { id: "27", name: "Bota de Hule", description: "Botas de hule impermeables para trabajo en condiciones húmedas", category: "EPP", subcategory: "Calzado Industrial", image: "/products/bota-hule.jpg" },
  { id: "28", name: "Calzado Borceguí", description: "Calzado borceguí de seguridad tipo II con punta de polímero", category: "EPP", subcategory: "Calzado Industrial", image: "/products/calzado-borcegui.jpg" },

  // --- Ropa de Trabajo ---
  { id: "29", name: "Overol Retardante al Fuego", description: "Overol 100% algodón retardante al fuego con cintas reflejantes, norma NRF-006-PEMEX-2011", category: "EPP", subcategory: "Ropa de Trabajo", image: "/products/overol-retardante.jpg" },
  { id: "30", name: "Camisa de Mezclilla", description: "Camisa de mezclilla manga larga 13.5 onzas para uso industrial con bordados de certificaciones", category: "EPP", subcategory: "Ropa de Trabajo", image: "/products/camisa-mezclilla.jpg" },
  { id: "31", name: "Pantalón de Mezclilla", description: "Pantalón de mezclilla industrial para trabajo pesado", category: "EPP", subcategory: "Ropa de Trabajo", image: "/products/pantalon-mezclilla.jpg" },
  { id: "32", name: "Impermeable Tipo Gabardina", description: "Impermeable tipo gabardina para protección contra lluvia en campo", category: "EPP", subcategory: "Ropa de Trabajo", image: "/products/impermeable-gabardina.jpg" },
  { id: "33", name: "Camisa Algodón Formal", description: "Camisa de algodón manga larga para uso corporativo con bordados institucionales", category: "EPP", subcategory: "Ropa de Trabajo", image: "/products/camisa-algodon-formal.jpg" },

  // --- Alta Visibilidad ---
  { id: "34", name: "Chaleco Reflejante", description: "Chaleco de seguridad reflejante naranja de alta visibilidad", category: "EPP", subcategory: "Alta Visibilidad", image: "/products/chaleco-reflejante.jpg" },
  { id: "35", name: "Chaleco Tipo Reportero", description: "Chaleco tipo reportero de poliéster con múltiples bolsillos", category: "EPP", subcategory: "Alta Visibilidad", image: "/products/chaleco-reportero.jpg" },
  { id: "36", name: "Chaleco Tipo Rescatista", description: "Chaleco rojo tipo rescatista con cinta reflejante, unitalla", category: "EPP", subcategory: "Alta Visibilidad", image: "/products/chaleco-rescatista.jpg" },
  { id: "37", name: "Chaleco Tipo Brigadista", description: "Chaleco tipo brigadista para equipos de emergencia y respuesta", category: "EPP", subcategory: "Alta Visibilidad", image: "/products/chaleco-brigadista.jpg" },

  // --- Señalización ---
  { id: "38", name: "Cinta Delimitadora Precaución", description: "Cinta delimitadora amarilla de precaución para delimitar áreas de trabajo", category: "SENALIZACION", subcategory: "Cintas", image: "/products/cinta-precaucion.jpg" },
  { id: "39", name: "Cinta Delimitadora Peligro", description: "Cinta delimitadora roja de peligro para zonas de alto riesgo", category: "SENALIZACION", subcategory: "Cintas", image: "/products/cinta-peligro.jpg" },
  { id: "40", name: "Cinta Adherible de Seguridad", description: "Cinta adherible amarilla con negro para señalización de pisos y escalones", category: "SENALIZACION", subcategory: "Cintas", image: "/products/cinta-adherible.jpg" },
  { id: "41", name: "Malla Naranja de Seguridad", description: "Malla naranja de seguridad para delimitación de áreas y obras", category: "SENALIZACION", subcategory: "Mallas", image: "/products/malla-naranja.jpg" },

  // --- Accesorios ---
  { id: "42", name: "Faja Lumbar", description: "Faja soporte lumbar y abdominal con cinturón extra para carga pesada", category: "ACCESORIOS", subcategory: "Complementos", image: "/products/faja-lumbar.jpg" },
  { id: "43", name: "Rodilleras Industriales", description: "Rodilleras de protección para trabajo industrial y soldadores", category: "ACCESORIOS", subcategory: "Complementos", image: "/products/rodilleras-industriales.jpg" },
  { id: "44", name: "Peto de Carnaza", description: "Peto de carnaza para protección del torso en soldadura", category: "ACCESORIOS", subcategory: "Complementos", image: "/products/peto-carnaza.jpg" },
  { id: "45", name: "Mandil Industrial", description: "Mandil de protección para trabajo industrial", category: "ACCESORIOS", subcategory: "Complementos", image: "/products/mandil-industrial.jpg" },

  // --- Herramientas ---
  { id: "46", name: 'Cuerda Industrial 3/4"', description: 'Cuerda industrial de 3/4 de pulgada para uso general en obra', category: "HERRAMIENTAS", subcategory: "Cuerdas", image: "/products/cuerda-industrial.jpg" },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return PRODUCTS.filter(p => p.subcategory === subcategory);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return PRODUCTS.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
