import { Shield, Target, Eye, Award, Package, Wrench, HardHat, Triangle, CheckCircle, Handshake } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Nosotros = () => {
  const valores = [
    { icon: CheckCircle, title: "Cumplimiento", description: "Entregamos en tiempo y forma según lo acordado" },
    { icon: Shield, title: "Seguridad", description: "Priorizamos la protección en cada operación" },
    { icon: Award, title: "Calidad", description: "Productos y servicios que superan expectativas" },
    { icon: Handshake, title: "Responsabilidad", description: "Comprometidos con nuestros clientes y proyectos" },
    { icon: Target, title: "Enfoque en Resultados", description: "Orientados a la satisfacción total del cliente" }
  ];

  const lineasProducto = [
    {
      icon: HardHat,
      title: "Equipo de Protección Personal (EPP)",
      items: [
        "Cascos de seguridad",
        "Chalecos reflejantes",
        "Botas con casquillo",
        "Arnés y líneas de vida",
        "Lentes, guantes y protección auditiva"
      ]
    },
    {
      icon: Package,
      title: "Materiales para Obra",
      items: [
        "Cemento, cal y agregados",
        "Varilla, malla y acero",
        "Block, tabique y materiales de obra negra",
        "Materiales de obra gris"
      ]
    },
    {
      icon: Wrench,
      title: "Herramientas y Equipo",
      items: [
        "Herramienta manual",
        "Herramienta eléctrica",
        "Equipos de medición",
        "Accesorios para obra"
      ]
    },
    {
      icon: Triangle,
      title: "Señalización y Seguridad en Obra",
      items: [
        "Conos y barreras",
        "Cintas de seguridad",
        "Señalización preventiva y normativa",
        "Equipamiento para control de acceso"
      ]
    }
  ];

  return (
    <div className="container px-4 py-12">
      {/* Quiénes Somos */}
      <section className="mb-16">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Quiénes Somos</h1>
        <div className="mb-6 h-1 w-16 rounded bg-accent" />
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Somos una comercializadora especializada en el suministro de materiales, 
              equipos e insumos para la industria de la construcción, atendiendo obras 
              civiles, industriales y desarrollos inmobiliarios.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Nos distinguimos por nuestro <strong className="text-foreground">cumplimiento</strong>, 
              <strong className="text-foreground"> rapidez</strong> y <strong className="text-foreground">capacidad 
              de adaptación</strong> a las necesidades de obra.
            </p>
          </div>
          <Card className="border-border bg-muted">
            <CardContent className="flex flex-col justify-center p-6">
              <p className="text-base italic leading-relaxed text-muted-foreground">
                Experiencia sólida en equipamiento y seguridad industrial, con la flexibilidad 
                de adaptarnos a los requerimientos específicos de cada cliente, en tiempo y forma.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="mb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-muted">
            <CardHeader>
              <Target className="mb-2 h-10 w-10 text-accent" />
              <CardTitle className="text-2xl">Misión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                Proveer soluciones confiables y oportunas para proyectos de construcción, 
                contribuyendo al cumplimiento de tiempos, costos y calidad de nuestros clientes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted">
            <CardHeader>
              <Eye className="mb-2 h-10 w-10 text-accent" />
              <CardTitle className="text-2xl">Visión</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-muted-foreground">
                Ser una comercializadora referente en el sector construcción a nivel nacional, 
                reconocida por su seriedad, capacidad operativa y atención especializada.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Valores */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          Nuestros Valores
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {valores.map((valor, index) => {
            const Icon = valor.icon;
            return (
              <Card
                key={index}
                className="group text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 hover:border-accent/40"
              >
                <CardHeader>
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:bg-primary">
                    <Icon className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{valor.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{valor.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Líneas de Producto */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
          Principales Líneas de Producto
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {lineasProducto.map((linea, index) => {
            const Icon = linea.icon;
            return (
              <Card key={index} className="border-l-4 border-l-accent/60">
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-accent" />
                  <CardTitle className="text-xl">{linea.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {linea.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default Nosotros;
