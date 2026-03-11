import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  nombre: z.string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre no puede exceder 100 caracteres" }),
  empresa: z.string()
    .trim()
    .min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" })
    .max(150, { message: "El nombre de la empresa no puede exceder 150 caracteres" }),
  telefono: z.string()
    .trim()
    .min(10, { message: "El teléfono debe tener al menos 10 dígitos" })
    .max(15, { message: "El teléfono no puede exceder 15 dígitos" })
    .regex(/^[0-9+\s()-]+$/, { message: "El teléfono solo puede contener números y caracteres válidos" }),
  correo: z.string()
    .trim()
    .email({ message: "Ingresa un correo electrónico válido" })
    .max(255, { message: "El correo no puede exceder 255 caracteres" }),
  tipoRequerimiento: z.string({
    required_error: "Selecciona un tipo de requerimiento",
  }),
  mensaje: z.string()
    .trim()
    .min(10, { message: "El mensaje debe tener al menos 10 caracteres" })
    .max(1000, { message: "El mensaje no puede exceder 1000 caracteres" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contacto = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nombre: "",
      empresa: "",
      telefono: "",
      correo: "",
      tipoRequerimiento: "",
      mensaje: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate form submission - in production, this would send to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Solicitud Enviada",
        description: "Nos pondremos en contacto contigo a la brevedad posible.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu solicitud. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          ¿Listo para proteger a tu equipo?
        </h1>
        <div className="mb-4 h-1 w-16 rounded bg-accent" />
        <p className="max-w-2xl text-lg text-muted-foreground">
          Completa el formulario y te responderemos a la brevedad.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Solicitud de Cotización</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa *</FormLabel>
                          <FormControl>
                            <Input placeholder="Constructora ABC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono *</FormLabel>
                          <FormControl>
                            <Input placeholder="55 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="correo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contacto@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="tipoRequerimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Requerimiento *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cotizacion">Cotización de Productos</SelectItem>
                            <SelectItem value="epp">Equipo de Protección Personal (EPP)</SelectItem>
                            <SelectItem value="materiales">Materiales para Obra</SelectItem>
                            <SelectItem value="herramientas">Herramientas y Equipo</SelectItem>
                            <SelectItem value="senalizacion">Señalización y Seguridad</SelectItem>
                            <SelectItem value="servicios">Servicios Personalizados</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mensaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu requerimiento: productos necesarios, cantidades estimadas, ubicación de obra, fechas de entrega..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    * Campos obligatorios. Al enviar este formulario, aceptas nuestro{" "}
                    <a href="/privacidad" className="text-primary hover:underline">
                      Aviso de Privacidad
                    </a>
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">
                    Av. Jaime Balmes No. 11<br />
                    Mezanine 33, Oficina 122<br />
                    Polanco I Sección<br />
                    Miguel Hidalgo, CDMX
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Teléfonos</p>
                  <p className="text-sm text-muted-foreground">
                    Tel: 55 5162 7054<br />
                    Cel: 55 3901 5860
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Correo Electrónico</p>
                  <p className="text-sm text-muted-foreground">
                    info@distribuidorasis.com.mx
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Horario de Atención</p>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Viernes: 9:00 - 18:00<br />
                    Sábados: 9:00 - 14:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">¿Necesitas Atención Inmediata?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Contáctanos por WhatsApp para respuesta rápida
              </p>
              <Button
                onClick={() => {
                  const phoneNumber = "525551627054";
                  const message = "Hola, me gustaría solicitar información sobre sus productos y servicios.";
                  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                }}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Abrir WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
