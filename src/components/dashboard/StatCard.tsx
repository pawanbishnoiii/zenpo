import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp, gradient }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl p-4 ${
        gradient
          ? 'gradient-primary text-primary-foreground glow-primary'
          : 'glass-card shadow-soft'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className="text-2xl font-bold font-display">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${
              gradient
                ? 'text-primary-foreground/80'
                : trendUp
                ? 'text-success'
                : 'text-destructive'
            }`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          gradient ? 'bg-primary-foreground/20' : 'bg-primary/10'
        }`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
