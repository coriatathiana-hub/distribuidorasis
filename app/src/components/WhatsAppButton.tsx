import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp-icon.png";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

const WhatsAppButton = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();

  const handleWhatsAppClick = () => {
    const context = {
      source: pathname,
      contextType: "floating_button" as const,
    };
    const message = buildWhatsAppPrefilledMessage(context);
    const url = buildWhatsAppDeepLink(getWhatsAppPhoneNumber(), message);
    const openedSuccessfully = tryOpenWhatsApp(url);

    if (!openedSuccessfully) {
      toast({
        title: "No se pudo abrir WhatsApp",
        description:
          "Tu navegador bloqueó la apertura. Intenta nuevamente o usa el formulario en /contacto.",
        variant: "destructive",
      });
    }

    void trackWhatsAppIntent(
      buildIntentInputFromContext(context, message, openedSuccessfully),
    );
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      size="lg"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 shadow-lg transition-transform hover:scale-110 md:h-16 md:w-16"
      aria-label="Contactar por WhatsApp"
    >
      <img 
        src={whatsappIcon} 
        alt="WhatsApp" 
        className="h-full w-full rounded-full object-cover"
      />
    </Button>
  );
};

export default WhatsAppButton;
