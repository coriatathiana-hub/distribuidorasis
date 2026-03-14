import { MapPin, Phone, Mail } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const getRuntimeLabel = () => {
  const hostname = window.location.hostname;

  if (hostname === "www.distribuidorasis.com.mx") {
    return "production";
  }

  if (hostname === "staging.distribuidorasis.com.mx") {
    return import.meta.env.DEV ? "staging (local)" : "staging";
  }

  return import.meta.env.DEV ? "local" : hostname;
};

const Footer = () => {
  const runtimeLabel = getRuntimeLabel();

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Distribuidora SIS" 
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-primary-foreground/80">
              Tu aliado en seguridad industrial
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/catalogo" className="text-primary-foreground/80 hover:text-primary-foreground touch-target inline-block">
                  Catálogo
                </NavLink>
              </li>
              <li>
                <NavLink to="/nosotros" className="text-primary-foreground/80 hover:text-primary-foreground touch-target inline-block">
                  Nosotros
                </NavLink>
              </li>
              <li>
                <NavLink to="/contacto" className="text-primary-foreground/80 hover:text-primary-foreground touch-target inline-block">
                  Contacto
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Av. Jaime Balmes No. 11, Mezanine 33, Oficina 122<br />
                  Polanco I Sección, Miguel Hidalgo, CDMX
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Tel: 55 5162 7054<br />
                  Cel: 55 3901 5860
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  ventas@distribuidorasis.com.mx
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/privacidad" className="text-primary-foreground/80 hover:text-primary-foreground touch-target inline-block">
                  Aviso de Privacidad
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Distribuidora SIS. Todos los derechos reservados.</p>
          <p className="mt-5 text-[10px] normal-case tracking-[0.08em] text-primary-foreground/35">
            {runtimeLabel} · {__APP_COMMIT_SHA__}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
