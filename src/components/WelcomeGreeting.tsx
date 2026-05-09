import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Sun, Moon, Sunset, Coffee, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeGreetingProps {
  userName: string;
}

const motivationalMessages = [
  { text: "Target harian menanti, ayo capai!", emoji: "🎯" },
  { text: "Semangat jualan hari ini!", emoji: "💪" },
  { text: "Satu langkah lagi menuju target!", emoji: "🚀" },
  { text: "Pelanggan puas, rezeki berlimpah!", emoji: "⭐" },
  { text: "Konsistensi adalah kunci sukses!", emoji: "🔑" },
  { text: "Hari ini lebih baik dari kemarin!", emoji: "📈" },
  { text: "Fokus, disiplin, dan sukses!", emoji: "💎" },
  { text: "Layanan terbaik untuk pelanggan!", emoji: "🏆" },
];

const getRandomMotivation = () => {
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return { greeting: "Selamat Pagi", emoji: "☀️", icon: Coffee, color: "from-green-600 via-green-500 to-emerald-500" };
  } else if (hour >= 11 && hour < 15) {
    return { greeting: "Selamat Siang", emoji: "🌤️", icon: Sun, color: "from-green-500 via-emerald-500 to-teal-500" };
  } else if (hour >= 15 && hour < 18) {
    return { greeting: "Selamat Sore", emoji: "🌅", icon: Sunset, color: "from-emerald-600 via-green-500 to-teal-600" };
  } else {
    return { greeting: "Selamat Malam", emoji: "🌙", icon: Moon, color: "from-green-700 via-emerald-800 to-teal-900" };
  }
};

const WelcomeGreeting = ({ userName }: WelcomeGreetingProps) => {
  const [motivation] = useState(() => getRandomMotivation());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timeData = getTimeGreeting();
  const TimeIcon = timeData.icon;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mb-2">
      <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${timeData.color} p-[1px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]`}>
        <div className={`relative bg-gradient-to-br ${timeData.color} rounded-[11px] px-2.5 py-1.5 overflow-hidden`}>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-8 -right-8 w-16 h-16 bg-white/15 rounded-full blur-xl" />

          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <motion.div animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="bg-white/15 backdrop-blur-sm rounded-full p-1.5 shrink-0">
                  <TimeIcon className="w-4 h-4 text-white drop-shadow-md" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-white/80 text-[9px] font-medium">{timeData.emoji} {timeData.greeting}</p>
                  <h2 className="text-xs font-bold text-white drop-shadow-md truncate">{userName} 👋</h2>
                </div>
              </div>

              <Button onClick={handleRefresh} size="sm" className="bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full h-7 w-7 p-0 border border-white/20 shadow-sm transition-all duration-150 hover:scale-105 shrink-0">
                <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <RefreshCw className="w-3.5 w-3.5 text-white" />
                </motion.div>
              </Button>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-sm rounded-md px-2 py-0.5 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-green-200 shrink-0" />
              <p className="text-white/85 text-[8px] truncate">{motivation.emoji} {motivation.text}</p>
              <Activity className="w-2.5 h-2.5 text-green-200 shrink-0" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeGreeting;
