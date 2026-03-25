import { useState, useEffect } from "react";
import { 
  Sparkles, Droplets, Wind, Brain, Heart, Footprints, Moon, Sun, Music, Book, 
  Smile, Coffee, Eye, Hand, Leaf, MessageCircle, PenLine, Target, Clock, 
  Compass, Lightbulb, Shield, Zap, Home, Phone, Users, Gift, Star, Palette, Volume2
} from "lucide-react";

interface MicroAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  completed: boolean;
}

const allMicroActions: Omit<MicroAction, 'id' | 'completed'>[] = [
  { title: "Mindful Breathing", description: "Take 5 deep breaths slowly", icon: Wind, duration: "1 min" },
  { title: "Hydrate", description: "Drink a full glass of water", icon: Droplets, duration: "30 sec" },
  { title: "Quick Walk", description: "Walk around your space", icon: Footprints, duration: "5 min" },
  { title: "Body Scan", description: "Notice how your body feels right now", icon: Brain, duration: "2 min" },
  { title: "Gratitude Moment", description: "Think of one thing you're grateful for", icon: Heart, duration: "1 min" },
  { title: "Morning Stretch", description: "Stretch your arms and back", icon: Sun, duration: "2 min" },
  { title: "Nature Glimpse", description: "Look outside or at a plant", icon: Leaf, duration: "30 sec" },
  { title: "Positive Affirmation", description: "Say something kind to yourself", icon: Smile, duration: "30 sec" },
  { title: "Listen & Relax", description: "Play a calming sound or song", icon: Music, duration: "3 min" },
  { title: "Read a Page", description: "Read something inspiring or educational", icon: Book, duration: "2 min" },
  { title: "Rest Your Eyes", description: "Close your eyes and relax", icon: Moon, duration: "1 min" },
  { title: "Mindful Sip", description: "Enjoy a warm drink slowly", icon: Coffee, duration: "3 min" },
  { title: "Eye Break", description: "Look at something 20 feet away for 20 seconds", icon: Eye, duration: "30 sec" },
  { title: "Tidy One Spot", description: "Organize one small area near you", icon: Home, duration: "3 min" },
  { title: "Write One Goal", description: "Write down one thing you want to achieve today", icon: Target, duration: "1 min" },
  { title: "Shoulder Rolls", description: "Roll your shoulders forward and back", icon: Hand, duration: "1 min" },
  { title: "Express Kindness", description: "Send a kind message to someone", icon: MessageCircle, duration: "2 min" },
  { title: "Journal Thought", description: "Write down one thought or feeling", icon: PenLine, duration: "2 min" },
  { title: "Power Pose", description: "Stand tall with hands on hips for confidence", icon: Shield, duration: "1 min" },
  { title: "Quick Meditation", description: "Sit quietly and focus on your breath", icon: Compass, duration: "3 min" },
  { title: "Brain Dump", description: "Write down everything on your mind", icon: Lightbulb, duration: "3 min" },
  { title: "Energy Boost", description: "Do 10 jumping jacks or squats", icon: Zap, duration: "1 min" },
  { title: "Phone-Free Moment", description: "Put your phone away for 5 minutes", icon: Phone, duration: "5 min" },
  { title: "Appreciate Someone", description: "Think of someone you appreciate and why", icon: Users, duration: "1 min" },
  { title: "Plan Tomorrow", description: "Write one thing to do tomorrow", icon: Clock, duration: "1 min" },
  { title: "Self-Care Check", description: "Ask yourself: What do I need right now?", icon: Gift, duration: "1 min" },
  { title: "Celebrate a Win", description: "Acknowledge something you did well today", icon: Star, duration: "1 min" },
  { title: "Creative Doodle", description: "Draw or doodle something simple", icon: Palette, duration: "2 min" },
  { title: "Silence Moment", description: "Sit in complete silence for a moment", icon: Volume2, duration: "2 min" },
  { title: "Smile Practice", description: "Smile genuinely for 30 seconds", icon: Sparkles, duration: "30 sec" },
];

export default function MicroActions() {
  const [actions, setActions] = useState<MicroAction[]>([]);

  useEffect(() => {
    // Generate 3 random micro-actions for today using date as seed
    const today = new Date().toISOString().split("T")[0];
    
    // Create a deterministic seed from the date
    const dateParts = today.split("-");
    const seed = parseInt(dateParts[0]) * 10000 + parseInt(dateParts[1]) * 100 + parseInt(dateParts[2]);
    
    // Seeded random function
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    // Create array of indices and shuffle deterministically
    const indices = allMicroActions.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(i) * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Get first 3 unique actions
    const selectedActions = indices.slice(0, 3).map(i => allMicroActions[i]);

    // Get stored completions from localStorage
    const stored = localStorage.getItem(`micro-actions-${today}`);
    const completedIds = stored ? JSON.parse(stored) : [];

    setActions(
      selectedActions.map((action, i) => ({
        ...action,
        id: `${today}-${i}`,
        completed: completedIds.includes(`${today}-${i}`),
      }))
    );
  }, []);

  const toggleAction = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    setActions(prev => {
      const updated = prev.map(a => 
        a.id === id ? { ...a, completed: !a.completed } : a
      );
      
      // Save to localStorage
      const completedIds = updated.filter(a => a.completed).map(a => a.id);
      localStorage.setItem(`micro-actions-${today}`, JSON.stringify(completedIds));
      
      return updated;
    });
  };

  const completedCount = actions.filter(a => a.completed).length;

  return (
    <div className="glass rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-xp" />
          <h3 className="font-semibold text-foreground">Quick Wins</h3>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
          {completedCount}/3 done
        </span>
      </div>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left ${
                action.completed
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50 hover:bg-muted border border-transparent"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                action.completed
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${action.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{action.description}</p>
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-background/50 rounded-full flex-shrink-0">
                {action.duration}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
