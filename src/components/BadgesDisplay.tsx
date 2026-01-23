import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Trophy, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  emoji: string;
  condition_type: string;
  condition_value: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgesDisplayProps {
  compact?: boolean;
}

const BadgesDisplay = ({ compact = false }: BadgesDisplayProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBadges();
    if (user) {
      fetchUserBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("condition_value", { ascending: true });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserBadges(data || []);
    } catch (error) {
      console.error("Error fetching user badges:", error);
    }
  };

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Heart className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (compact) {
    const earnedBadges = badges.filter((b) => earnedBadgeIds.has(b.id));
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun badge débloqué</p>
        ) : (
          earnedBadges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full"
              title={badge.description}
            >
              <span className="text-lg">{badge.emoji}</span>
              <span className="text-xs font-medium text-foreground">
                {badge.name}
              </span>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-display text-foreground">Mes Badges</h2>
        <span className="px-2 py-1 bg-primary/20 text-primary text-sm rounded-full">
          {userBadges.length}/{badges.length}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge, index) => {
          const isEarned = earnedBadgeIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-4 rounded-xl border transition-all ${
                isEarned
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card/30 border-border/30 opacity-60"
              }`}
            >
              {isEarned && (
                <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-green-500" />
              )}
              {!isEarned && (
                <Lock className="absolute top-2 right-2 w-4 h-4 text-muted-foreground" />
              )}

              <div className="flex items-center gap-3 mb-2">
                <span className={`text-3xl ${!isEarned && "grayscale"}`}>
                  {badge.emoji}
                </span>
                <div>
                  <h3
                    className={`font-medium ${
                      isEarned ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {badge.name}
                  </h3>
                </div>
              </div>

              <p
                className={`text-sm ${
                  isEarned ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                {badge.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesDisplay;
