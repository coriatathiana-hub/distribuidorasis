import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-2 text-xl text-muted-foreground">Ruta no encontrada</p>
        <p className="mb-6 text-sm text-muted-foreground">
          La pagina que intentaste abrir no existe o fue movida.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="touch-target min-w-40">
            <Link to="/">Ir a Inicio</Link>
          </Button>
          <Button asChild variant="outline" className="touch-target min-w-40">
            <Link to="/catalogo">Ver Catalogo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
