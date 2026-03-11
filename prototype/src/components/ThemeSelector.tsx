import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useEffect } from "react";

type Theme = "theme-1" | "theme-2" | "theme-3";

const themes = [
  {
    id: "theme-1" as Theme,
    name: "Industrial Corporativa",
    description: "Azul técnico con amarillo seguridad",
  },
  {
    id: "theme-2" as Theme,
    name: "Seguridad Alta Visibilidad",
    description: "Azul corporativo con naranja seguridad",
  },
  {
    id: "theme-3" as Theme,
    name: "Minimal Industrial Moderna",
    description: "Negro carbón con amarillo señalización",
  },
];

export const ThemeSelector = () => {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "theme-1");

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove("theme-1", "theme-2", "theme-3");
    // Add the selected theme class
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="touch-target">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Seleccionar Paleta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex flex-col items-start gap-1 cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className={`h-3 w-3 rounded-full ${
                  theme === t.id ? "bg-accent" : "bg-muted"
                }`}
              />
              <span className="font-medium">{t.name}</span>
            </div>
            <span className="text-xs text-muted-foreground pl-5">
              {t.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
