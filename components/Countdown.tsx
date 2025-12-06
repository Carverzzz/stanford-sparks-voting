import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
  isActive: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({ seconds, onComplete, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
        if (isActive && timeLeft === 0) onComplete();
        return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
            clearInterval(interval);
            return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={timeLeft}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`text-6xl font-bold font-mono tracking-tighter ${
            timeLeft <= 10 ? 'text-red-600' : 'text-stanford'
          }`}
        >
          {timeLeft}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};