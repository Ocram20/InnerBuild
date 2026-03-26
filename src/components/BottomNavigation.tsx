import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Compass,
  User,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
const navItems = [
  { path: "/dashboard", labelKey: "nav.home", icon: LayoutDashboard },
  { path: "/explore", labelKey: "nav.tools", icon: Compass },
  { path: "/learn", labelKey: "nav.learn", icon: BookOpen },
  { path: "/profile", labelKey: "nav.profile", icon: User },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => {
    if (path === "/explore") {
      return [
        "/explore", 
        "/porn-recovery", 
        "/coach", 
        "/trigger-tracking",
        "/daily-planning",
        "/challenges",
        "/habits",
        "/evening-reflection"
      ].includes(location.pathname);
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-between h-16 max-w-lg mx-auto px-2 sm:px-4 gap-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-200 sm:px-3",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "max-w-full truncate text-[10px] font-medium transition-all duration-200",
                active && "font-semibold"
              )}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
