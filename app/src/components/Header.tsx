import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/nosotros", label: "Nosotros" },
    { to: "/contacto", label: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/" end className="flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Distribuidora SIS" 
            className="h-10 w-auto"
          />
          <span className="hidden font-title font-bold text-foreground sm:inline-block tracking-wide">
            Distribuidora SIS
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex md:items-center md:gap-6" aria-label="Navegacion principal">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground touch-target flex items-center"
                activeClassName="text-foreground"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetTitle className="sr-only">Navegacion principal</SheetTitle>
            <SheetDescription className="sr-only">
              Menu principal para navegar entre secciones del sitio.
            </SheetDescription>
            <div className="flex flex-col gap-4 py-8">
              <div className="flex items-center justify-between px-2 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <img 
                    src={logoImg} 
                    alt="Distribuidora SIS" 
                    className="h-10 w-auto"
                  />
                  <span className="font-title font-bold text-foreground tracking-wide">
                    Distribuidora SIS
                  </span>
                </div>
              </div>
              <nav className="flex flex-col gap-2" aria-label="Navegacion principal mobile">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setIsOpen(false)}
                    className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground touch-target"
                    activeClassName="bg-accent text-accent-foreground"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
