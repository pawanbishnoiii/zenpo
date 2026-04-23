import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface PageHeaderProps {
  title: string;
  backTo?: string;
  actions?: ReactNode;
  hideThemeToggle?: boolean;
}

const PageHeader = ({ title, backTo = '/', actions, hideThemeToggle }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(backTo)}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold font-display text-foreground"
        >
          {title}
        </motion.h1>
      </div>
      <div className="flex items-center gap-2">
        {!hideThemeToggle && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggle}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}>
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-foreground" />}
          </motion.button>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
