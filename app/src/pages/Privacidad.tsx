import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Privacidad = () => {
  return (
    <div className="container px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">
          Aviso de Privacidad
        </h1>
        
        <p className="mb-8 text-lg text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identidad y Domicilio del Responsable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong className="text-foreground">SUMINISTROS INDUSTRIALES Y DE SEGURIDAD SIS, S.A. DE C.V.</strong> (en adelante "Distribuidora SIS"), 
              con domicilio en Av. Jaime Balmes No. 11, Mezanine 33, Oficina 122, Colonia Polanco I Sección, 
              Alcaldía Miguel Hidalgo, Ciudad de México, C.P. 11510, es responsable del tratamiento de sus datos personales.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Datos Personales que Recabamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para las finalidades señaladas en el presente Aviso de Privacidad, podemos recabar sus datos personales de distintas formas:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Cuando nos los proporciona directamente a través de formularios, correo electrónico o llamadas telefónicas</li>
              <li>Cuando visita nuestro sitio web</li>
              <li>Cuando solicita cotizaciones o información sobre nuestros productos y servicios</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Los datos personales que recabamos incluyen, de manera enunciativa mas no limitativa:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Nombre completo</li>
              <li>Empresa o razón social</li>
              <li>Teléfono de contacto</li>
              <li>Correo electrónico</li>
              <li>Información sobre requerimientos y necesidades de obra</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Finalidades del Tratamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sus datos personales serán utilizados para las siguientes finalidades:
            </p>
            
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Finalidades Primarias (necesarias para el servicio)</h3>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Procesar y dar seguimiento a sus solicitudes de cotización</li>
                <li>Proveer los productos y servicios solicitados</li>
                <li>Gestionar pedidos y entregas</li>
                <li>Atención a consultas, quejas y comentarios</li>
                <li>Facturación y cobros</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Finalidades Secundarias (no necesarias pero valiosas)</h3>
              <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                <li>Mercadotecnia, publicidad y prospección comercial</li>
                <li>Envío de información sobre productos, servicios y promociones</li>
                <li>Elaboración de estudios de mercado y mejora de servicios</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                En caso de que no desee que sus datos personales sean tratados para estas finalidades secundarias, 
                puede manifestarlo enviando un correo a: privacidad@distribuidorasis.com.mx
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Derechos ARCO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li><strong className="text-foreground">Acceder</strong> a sus datos personales y conocer los detalles del tratamiento</li>
              <li><strong className="text-foreground">Rectificar</strong> sus datos en caso de ser inexactos o incompletos</li>
              <li><strong className="text-foreground">Cancelar</strong> sus datos cuando considere que no se requieren para alguna de las finalidades señaladas</li>
              <li><strong className="text-foreground">Oponerse</strong> al tratamiento de sus datos para fines específicos</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Para ejercer estos derechos, puede enviar su solicitud a:
            </p>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Correo electrónico:</strong> privacidad@distribuidorasis.com.mx<br />
                <strong className="text-foreground">Teléfono:</strong> 55 5162 7054<br />
                <strong className="text-foreground">Dirección:</strong> Av. Jaime Balmes No. 11, Mezanine 33, Oficina 122, Polanco I Sección, Miguel Hidalgo, CDMX
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transferencia de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sus datos personales no serán transferidos a terceros, salvo en los casos previstos por la Ley Federal de 
              Protección de Datos Personales en Posesión de los Particulares, o cuando usted nos haya otorgado su consentimiento.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Uso de Cookies y Tecnologías de Rastreo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Le informamos que en nuestra página de internet utilizamos cookies, web beacons y otras tecnologías de rastreo 
              a través de las cuales es posible monitorear su comportamiento como usuario de internet, brindarle un mejor 
              servicio y experiencia de usuario al navegar en nuestra página.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cambios al Aviso de Privacidad</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de efectuar modificaciones o actualizaciones al presente Aviso de Privacidad en cualquier 
              momento. Estas modificaciones estarán disponibles en nuestro sitio web www.distribuidorasis.com.mx
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Para cualquier duda o aclaración sobre este Aviso de Privacidad, puede contactarnos en:<br />
            <strong className="text-foreground">privacidad@distribuidorasis.com.mx</strong> o al teléfono <strong className="text-foreground">55 5162 7054</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacidad;
