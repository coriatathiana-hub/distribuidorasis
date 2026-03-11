import { Button } from "@/components/ui/button";
import whatsappIcon from "@/assets/whatsapp-icon.png";

const WhatsAppButton = () => {
  const phoneNumber = "525551627054"; // +52 55 5162 7054 in international format
  const defaultMessage = "Hola, me gustaría solicitar información sobre sus productos y servicios.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
