import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useCallback } from "react";

const XP_REWARDS = {
  assessment_complete: 100,
  simulation_complete: 75,
  tool_use: 25,
  article_read: 10,
  video_watch: 15,
} as const;

type Activity = keyof typeof XP_REWARDS;

export function useXP() {
  const { user } = useAuth();

  const awardXP = useCallback(
    async (activity: Activity, label?: string) => {
      if (!user) return;
      const xpAmount = XP_REWARDS[activity];

      // Fetch current progress
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!progress) return;

      const newXP = progress.xp + xpAmount;
      const xpPerLevel = 500;
      const newLevel = Math.floor(newXP / xpPerLevel) + 1;
      const leveledUp = newLevel > progress.level;

      // Fetch badges and check which ones are newly earned
      const { data: allBadges } = await supabase
        .from("badges")
        .select("id, name, xp_required")
        .order("xp_required");

      const currentBadgeIds: string[] = progress.badges_earned ?? [];
      const newBadgeIds = (allBadges ?? [])
        .filter((b) => b.xp_required <= newXP && !currentBadgeIds.includes(b.id))
        .map((b) => b.id);

      const updatedBadges = [...currentBadgeIds, ...newBadgeIds];

      // Calculate financial health score based on activity engagement
      // Score components: XP progress (40%), level (30%), badge completion (30%)
      const xpComponent = Math.min(40, Math.round((newXP / 2000) * 40));
      const levelComponent = Math.min(30, newLevel * 5);
      const badgeComponent = allBadges && allBadges.length > 0
        ? Math.min(30, Math.round((updatedBadges.length / allBadges.length) * 30))
        : 0;
      const financialHealthScore = Math.min(100, xpComponent + levelComponent + badgeComponent);

      // Update progress
      await supabase
        .from("user_progress")
        .update({
          xp: newXP,
          level: newLevel,
          badges_earned: updatedBadges,
          financial_health_score: financialHealthScore,
        })
        .eq("user_id", user.id);

      // Create notifications
      const notifications: {
        user_id: string;
        title: string;
        message: string;
        type: string;
      }[] = [];

      notifications.push({
        user_id: user.id,
        title: `+${xpAmount} XP Earned!`,
        message: label
          ? `You earned ${xpAmount} XP for: ${label}`
          : `You earned ${xpAmount} XP!`,
        type: "xp",
      });

      if (leveledUp) {
        notifications.push({
          user_id: user.id,
          title: `Level Up! 🎉`,
          message: `Congratulations! You've reached Level ${newLevel}!`,
          type: "level_up",
        });
      }

      const newBadgeNames = (allBadges ?? []).filter((b) =>
        newBadgeIds.includes(b.id)
      );
      for (const badge of newBadgeNames) {
        notifications.push({
          user_id: user.id,
          title: `Badge Unlocked! 🏅`,
          message: `You earned the "${badge.name}" badge!`,
          type: "badge",
        });
      }

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }

      return { xpAmount, newXP, newLevel, leveledUp, newBadges: newBadgeNames };
    },
    [user]
  );

  return { awardXP, XP_REWARDS };
}
