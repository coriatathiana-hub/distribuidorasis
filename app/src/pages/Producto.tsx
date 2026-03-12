import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import SpecificationsTable from "@/components/SpecificationsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProductBySlug, type PublicProduct } from "@/lib/api/public-catalog-service";
import {
  buildWhatsAppDeepLink,
  buildWhatsAppPrefilledMessage,
  getWhatsAppPhoneNumber,
  tryOpenWhatsApp,
} from "@/lib/contact/whatsapp-cta";
import {
  buildIntentInputFromContext,
  trackWhatsAppIntent,
} from "@/lib/api/whatsapp-intent-service";

const Producto = () => {
  // Route param `:id` is treated as a slug — no App.tsx route change needed.
  const { id: slug } = useParams<{ id: string }>();

  // undefined = loading, null = not found, PublicProduct = loaded
  const [product, setProduct] = useState<PublicProduct | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      return;
    }
    setProduct(undefined);
    setError(null);
    getProductBySlug(slug)
      .then(setProduct)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Error al cargar el producto.")
      );
  }, [slug]);

  if (product === undefined && !error) {
    return (
      <div className="container flex min-h-[400px] items-center justify-center px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button asChild className="touch-target">
            <Link to="/catalogo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <Button asChild className="touch-target">
            <Link to="/catalogo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const contactPath = `/contacto?origen=detalle&productoId=${encodeURIComponent(product.slug)}&producto=${encodeURIComponent(product.name)}`;

  const handleWhatsAppClick = () => {
    const context = {
      source: "/producto",
      contextType: "product_detail" as const,
      productSlug: product.slug,
      productName: product.name,
    };
    const message = buildWhatsAppPrefilledMessage(context);
    const url = buildWhatsAppDeepLink(getWhatsAppPhoneNumber(), message);
    const openedSuccessfully = tryOpenWhatsApp(url);

    if (!openedSuccessfully) {
      toast({
        title: "No se pudo abrir WhatsApp",
        description:
          "Tu navegador bloqueó la apertura. Puedes continuar con el formulario de contacto.",
        variant: "destructive",
      });
    }

    void trackWhatsAppIntent(
      buildIntentInputFromContext(context, message, openedSuccessfully),
    );
  };

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
      <Button variant="ghost" size="sm" asChild className="mb-6 touch-target">
        <Link to="/catalogo">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column: Gallery */}
        <div>
          <ProductGallery
            productName={product.name}
            images={product.images}
          />
        </div>

        {/* Right column: Product info */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category_name}</Badge>
            </div>
            <h1 className="mb-4 text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="text-muted-foreground">{product.short_description}</p>
            )}
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
                <Link to={contactPath}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleWhatsAppClick}
                aria-label="Contactar por WhatsApp sobre este producto"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications table */}
      {product.description && (
        <div className="mt-12">
          <SpecificationsTable description={product.description} />
        </div>
      )}
    </div>
  );
};

export default Producto;
