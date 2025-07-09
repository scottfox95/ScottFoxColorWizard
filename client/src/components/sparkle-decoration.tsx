import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SparkleDecorationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SparkleDecoration({ 
  children, 
  className = "", 
  delay = 0 
}: SparkleDecorationProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
