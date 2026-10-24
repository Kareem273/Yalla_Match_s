import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PageMotionProps {
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps page content with the same fade-and-slide-up entry animation used on
 * the dashboard. Shows an emerald spinner while `loading` is true.
 */
export function PageMotion({ loading = false, children }: PageMotionProps) {
  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
