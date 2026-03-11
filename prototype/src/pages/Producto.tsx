import { useParams, Link } from "react-router-dom";
import { getProductById } from "@/data/products";
import ProductGallery from "@/components/ProductGallery";
import SpecificationsTable from "@/components/SpecificationsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Phone, Mail } from "lucide-react";

const Producto = () => {
  const { id } = useParams();
  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <div className="container px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            Producto no encontrado
          </h1>
          <p className="mb-6 text-muted-foreground">
            El producto que buscas no existe en nuestro catálogo
          </p>
          <Button asChild>
            <Link to="/catalogo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/catalogo">Catálogo</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/catalogo">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column: Gallery */}
        <div>
          <ProductGallery productName={product.name} imageUrl={product.image} />
        </div>

        {/* Right column: Product info */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.subcategory}</Badge>
            </div>
            <h1 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>
          </div>

          {/* Contact CTA */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-3 text-lg font-semibold">Solicitar Cotización</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Contacta a nuestro equipo para obtener información sobre disponibilidad,
              precios y especificaciones detalladas.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link to="/contacto">
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href="tel:+525555555555">
                  <Phone className="mr-2 h-4 w-4" />
                  Llamar
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications table */}
      <div className="mt-12">
        <SpecificationsTable description={product.description} />
      </div>
    </div>
  );
};

export default Producto;
