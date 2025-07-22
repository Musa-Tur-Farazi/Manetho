"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Award,
  Medal,
  Crown,
  Target,
  Flame,
  CheckCircle,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Zap,
  Shield,
  Heart,
  Diamond,
  Gem,
  Sparkles
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconType: string;
  badgeColor: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  xpReward: number;
  pointsReward: number;
  earnedAt?: string;
  progress?: number;
  isLocked?: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  award: Award,
  medal: Medal,
  crown: Crown,
  target: Target,
  flame: Flame,
  checkCircle: CheckCircle,
  trendingUp: TrendingUp,
  bookOpen: BookOpen,
  users: Users,
  calendar: Calendar,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  diamond: Diamond,
  gem: Gem,
  sparkles: Sparkles,
};

const rarityConfig = {
  common: {
    borderColor: 'border-gray-300 dark:border-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300',
    glowColor: 'shadow-gray-200 dark:shadow-gray-700',
  },
  rare: {
    borderColor: 'border-blue-300 dark:border-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    glowColor: 'shadow-blue-200 dark:shadow-blue-700',
  },
  epic: {
    borderColor: 'border-purple-300 dark:border-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    glowColor: 'shadow-purple-200 dark:shadow-purple-700',
  },
  legendary: {
    borderColor: 'border-yellow-300 dark:border-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    glowColor: 'shadow-yellow-200 dark:shadow-yellow-700',
  },
};

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    text: 'text-xs',
    padding: 'p-2',
  },
  md: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    text: 'text-sm',
    padding: 'p-3',
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'w-10 h-10',
    text: 'text-base',
    padding: 'p-4',
  },
};

export default function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = false,
  showDetails = false,
  onClick
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.iconType as keyof typeof iconMap] || Trophy;
  const rarity = rarityConfig[achievement.rarity];
  const sizing = sizeConfig[size];

  const isEarned = !!achievement.earnedAt;
  const isLocked = achievement.isLocked && !isEarned;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Badge Container */}
      <div className={`
        ${sizing.container}
        ${sizing.padding}
        ${rarity.bgColor}
        ${rarity.borderColor}
        ${isEarned ? rarity.glowColor : ''}
        border-2 rounded-full
        flex items-center justify-center
        relative overflow-hidden
        transition-all duration-300
        ${isLocked ? 'opacity-50 grayscale' : ''}
      `}>
        {/* Background Effects */}
        {isEarned && achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-20 animate-pulse" />
        )}
        {isEarned && achievement.rarity === 'epic' && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 opacity-20 animate-pulse" />
        )}

        {/* Icon */}
        <IconComponent
          className={`
            ${sizing.icon}
            ${isEarned ? 'text-current' : 'text-gray-400'}
            ${isLocked ? 'opacity-50' : ''}
          `}
          style={{ color: isEarned ? achievement.badgeColor : undefined }}
        />

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-gray-500" />
          </div>
        )}

        {/* Progress Ring */}
        {showProgress && achievement.progress !== undefined && achievement.progress < 100 && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-300 dark:text-gray-600"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 45} ${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - achievement.progress / 100)}`}
              className={rarity.textColor}
            />
          </svg>
        )}

        {/* Earned Indicator */}
        {isEarned && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Rarity Indicator */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
        {achievement.rarity === 'epic' && (
          <div className="absolute -top-1 -left-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <Gem className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Details Card */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {achievement.name}
              </h4>
              <div className="flex items-center space-x-1">
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${rarity.bgColor} ${rarity.textColor}
                `}>
                  {achievement.rarity}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {achievement.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Category: {achievement.category}</span>
              <div className="flex items-center space-x-2">
                <span>+{achievement.xpReward} XP</span>
                <span>+{achievement.pointsReward} pts</span>
              </div>
            </div>

            {achievement.progress !== undefined && achievement.progress < 100 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
              </div>
            )}

            {isEarned && achievement.earnedAt && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export type { Achievement }; 