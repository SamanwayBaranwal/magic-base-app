'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function Success() {
  return (
    <main className="screen-center">
      <motion.div
        className="magic-container text-center"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="magic-card w-24 h-24 mx-auto rounded-2xl flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        >
          <CheckCircle2 className="w-12 h-12 text-[#0052ff]" strokeWidth={2} />
        </motion.div>
        <h1 className="font-black text-4xl text-[#0052ff] uppercase tracking-tighter">
          Day 1 Complete
        </h1>
        <p className="text-zinc-600 text-lg">
          See you tomorrow.
        </p>
        <Link
          href="/"
          className="magic-button-primary block w-full"
        >
          Back to home
        </Link>
      </motion.div>
    </main>
  );
}
