import { HardHat, Boxes, Truck, ShieldCheck, Package, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import heroImage from "@/assets/hero-industrial.jpg";

const Home = () => {
  const features = [
    {
      icon: HardHat,
      title: "Equipos de Protección Personal",
      description: "Soluciones certificadas de seguridad industrial para proteger a tu equipo de trabajo",
    },
    {
      icon: Boxes,
      title: "Suministros Industriales",
      description: "Amplio catálogo de productos especializados para operaciones industriales y comerciales",
    },
    {
      icon: Truck,
      title: "Logística Empresarial",
      description: "Entrega programada y servicio de distribución confiable a nivel nacional",
    },
    {
      icon: ShieldCheck,
      title: "Garantía Profesional",
      description: "Respaldo técnico y productos de fabricantes reconocidos en la industria",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary min-h-[520px] sm:min-h-[600px]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/30" />

        <div className="container relative z-10 flex items-center min-h-[520px] sm:min-h-[600px] px-4 py-16">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              Tu aliado en seguridad industrial
            </h1>
            <p className="mb-8 text-lg text-white/90 sm:text-xl drop-shadow-md">
              Equipamos a tu empresa con los mejores productos industriales y de protección personal
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 touch-target shadow-lg">
                <NavLink to="/catalogo">Ver Catálogo</NavLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 touch-target backdrop-blur-sm">
                <NavLink to="/contacto">Contactar</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Personalizados */}
      <section className="py-16 sm:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Servicios Personalizados
            </h2>
            <p className="text-lg text-muted-foreground/80 leading-relaxed">
              Adaptamos nuestro servicio a las necesidades específicas de tu proyecto
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {[
              { icon: HardHat, title: "Equipos de Protección Personal", description: "Soluciones certificadas de seguridad industrial para proteger a tu equipo de trabajo" },
              { icon: Boxes, title: "Suministros Industriales", description: "Materiales bajo especificación técnica para requerimientos únicos de tu proyecto" },
              { icon: Truck, title: "Logística Empresarial", description: "Entrega programada y servicio de distribución confiable a nivel nacional" },
              { icon: ShieldCheck, title: "Garantía Profesional", description: "Respaldo técnico y productos de fabricantes reconocidos en la industria" },
            ].map((service, index) => (
              <Card key={index} className="group border-border/50 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted ring-1 ring-border transition-all duration-300 group-hover:ring-accent/40">
                    <service.icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-lg font-semibold leading-tight">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground/90">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-muted via-background to-muted py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container relative px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Solicite una Cotización Personalizada
            </h2>
            <p className="mb-10 text-lg text-muted-foreground/90 leading-relaxed">
              Nuestro equipo comercial está listo para asesorarle en la selección de productos y soluciones específicas para su industria
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="touch-target text-base px-8">
                <NavLink to="/contacto">Solicitar Cotización</NavLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="touch-target text-base px-8">
                <NavLink to="/catalogo">Explorar Catálogo</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
