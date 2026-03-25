import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function AICoachChat() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/coach")}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 animate-pulse"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
