import { Leaf } from "lucide-react";

export default function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
        <Leaf className="h-6 w-6 text-primary-foreground" />
      </div>
    </div>
  );
}
