'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavBar } from '@/components/layout/nav-bar';
import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { AppPreview } from '@/components/home/app-preview';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <AnimatePresence mode="wait">
        <motion.main
          key="home"
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Hero />
          <Features />
          <AppPreview />
          <Footer />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
