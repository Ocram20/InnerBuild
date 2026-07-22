import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  User,
  BookOpen,
  Plus,
  Target,
  Flame,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CreateHabitModal from "@/components/CreateHabitModal";
import CreateChallengeModal from "@/components/CreateChallengeModal";

const leftItems = [
  { path: "/dashboard", labelKey: "nav.home", icon: LayoutDashboard },
  { path: "/explore",   labelKey: "nav.tools", icon: Compass },
];

const rightItems = [
  { path: "/learn",   labelKey: "nav.learn",    icon: BookOpen },
  { path: "/profile", labelKey: "nav.profile",  icon: User },
];

const BottomNavigation = () => {
  const location  = useLocation();
  const { t }     = useTranslation();
  const navigate  = useNavigate();

  const [fabOpen,           setFabOpen]           = useState(false);
  const [showCreateHabit,   setShowCreateHabit]   = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);

  const isActive = (path: string) => {
    if (path === "/explore") {
      return [
        "/explore",
        "/the-forge",
        "/coach",
        "/trigger-tracking",
        "/daily-planning",
        "/challenges",
        "/habits",
        "/evening-reflection",
      ].includes(location.pathname);
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const NavBtn = ({ path, labelKey, icon: Icon }: typeof leftItems[0]) => {
    const active = isActive(path);
    return (
      <button
        key={path}
        onClick={() => navigate(path)}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-all duration-200 sm:px-3",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className={cn("p-2 rounded-xl transition-all duration-200", active && "bg-primary/10")}>
          <Icon className={cn("h-5 w-5 transition-all duration-200", active && "scale-110")} />
        </div>
        <span className={cn("max-w-full truncate text-[10px] font-medium transition-all duration-200", active && "font-semibold")}>
          {t(labelKey)}
        </span>
      </button>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-between h-16 max-w-lg mx-auto px-2 sm:px-4 gap-1 relative">
          {/* Left nav items */}
          {leftItems.map((item) => (
            <NavBtn key={item.path} {...item} />
          ))}

          {/* Central FAB — always visible */}
          <div className="relative flex flex-col items-center justify-center flex-shrink-0 px-1">
            <Popover open={fabOpen} onOpenChange={setFabOpen}>
                <PopoverTrigger asChild>
                  <button
                    id="fab-add"
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      "bg-foreground text-background dark:bg-primary dark:text-white",
                      "-mt-8 shadow-[0_15px_30px_-5px_rgba(15,23,42,0.35)] dark:shadow-[0_15px_30px_-5px_rgba(75,155,117,0.4)]",
                      "border-4 border-background",
                      "transition-transform active:scale-95 hover:scale-105"
                    )}
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 mb-2 z-50" align="center" side="top">
                  <div className="space-y-1">
                    <button
                      onClick={() => { setFabOpen(false); setShowCreateHabit(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Nuova Abitudine</span>
                    </button>
                    <button
                      onClick={() => { setFabOpen(false); setShowCreateChallenge(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                        <Flame className="h-4 w-4 text-destructive" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Nuova Sfida Detox</span>
                    </button>
                    <button
                      onClick={() => { setFabOpen(false); navigate("/daily-planning"); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Nuova Task</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <span className="text-[10px] font-medium text-muted-foreground mt-1">Nuovo</span>
            </div>

          {/* Right nav items */}
          {rightItems.map((item) => (
            <NavBtn key={item.path} {...item} />
          ))}
        </div>
      </nav>

      <CreateHabitModal
        open={showCreateHabit}
        onOpenChange={setShowCreateHabit}
        onSuccess={() => {}}
      />
      <CreateChallengeModal
        open={showCreateChallenge}
        onOpenChange={setShowCreateChallenge}
        onSuccess={() => {}}
      />
    </>
  );
};

export default BottomNavigation;
