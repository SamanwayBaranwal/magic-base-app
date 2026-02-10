'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { useMiniApp } from './providers/MiniAppProvider';
import { farcasterConfig } from '../farcaster.config';

// --- State machine ---
type Phase = 'PHASE_0' | 'PHASE_1_IDENTITY' | 'PHASE_2_LEVEL' | 'PHASE_3_TASK';

const ROLES = [
  { id: 'builder', title: '🏗️ Builder', desc: "Tons of ideas, zero deployments? Let's fix that." },
  { id: 'founder', title: '👑 Founder', desc: 'Vision is there, but where is the execution?' },
  { id: 'marketer', title: '📢 Marketer', desc: "You know the alpha, but you're too scared to post." },
  { id: 'trader', title: '📈 Trader', desc: "Charts aren't a career. Start sharing analysis." },
  { id: 'explorer', title: '🧭 Explorer', desc: 'Stop being a spectator. Start contributing.' },
] as const;

const LEVELS = [
  { id: 'beginner', title: '🌱 Beginner', desc: "You've been lurking. Time to show your face." },
  { id: 'lazy_pro', title: '😴 Lazy Pro', desc: "You know what to do. You just don't do it. That ends today." },
  { id: 'expert', title: '🔥 Expert', desc: "You ship. Now hold others to the same standard." },
] as const;

const SLIDE_UP_FADE = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};
const STAGGER = 0.06;

function SuccessCelebration({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const hasFiredConfetti = useRef(false);

  useEffect(() => {
    if (hasFiredConfetti.current) return;
    hasFiredConfetti.current = true;
    import('canvas-confetti').then(({ default: confetti }) => {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;
      const colors = ['#0052ff', '#ffffff', '#a1a1a1'];
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.4, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 0.6, y: 0.6 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const duration = 2200;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
      else onComplete();
    };
    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="max-w-[400px] w-full flex flex-col items-center justify-center space-y-8 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
      >
        <motion.div
          className="w-24 h-24 rounded-2xl border-4 border-zinc-900 bg-zinc-950 flex items-center justify-center shadow-[8px_8px_0px_0px_#0052ff]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
        >
          <CheckCircle2 className="w-12 h-12 text-[#0052ff]" strokeWidth={2} />
        </motion.div>
        <h2 className="font-black text-4xl text-white uppercase tracking-tighter">
          Day 1 Complete
        </h2>
        <p className="text-zinc-400 text-lg">Taking you there...</p>
      </motion.div>

      <div className="absolute bottom-8 left-6 right-6 max-w-[400px] w-full mx-auto">
        <div className="h-2 rounded-full bg-zinc-900 border-2 border-zinc-800 overflow-hidden">
          <motion.div
            className="h-full bg-[#0052ff] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <p className="text-zinc-500 text-sm text-center mt-2">Loading...</p>
      </div>
    </motion.div>
  );
}

function ProfileSummaryCard({ fid }: { fid: number }) {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [pfp_url, setPfp_url] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/profile?fid=${encodeURIComponent(fid)}`);
        const data = await res.json();
        if (!cancelled) {
          setDisplayName(typeof data.displayName === 'string' ? data.displayName : null);
          setPfp_url(typeof data.pfp_url === 'string' ? data.pfp_url : null);
          setBio(typeof data.bio === 'string' ? data.bio : null);
        }
      } catch {
        if (!cancelled) {
          setDisplayName(null);
          setPfp_url(null);
          setBio(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fid]);

  return (
    <div className="profile-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {pfp_url ? (
            <img
              src={pfp_url}
              alt={displayName || 'Avatar'}
              className="w-10 h-10 rounded-full border border-zinc-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-500 text-xs">?</span>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {loading ? 'Loading...' : displayName || 'Anonymous'}
            </p>
            {bio && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{bio}</p>}
          </div>
        </div>
        <span className="badge-verified">Verified</span>
      </div>
      <p className="text-xs text-zinc-500">
        Daily Streak: <span className="font-semibold text-white">0 days</span>
      </p>
    </div>
  );
}

export default function MagicHome() {
  const router = useRouter();
  const { context, isReady } = useMiniApp();
  const [phase, setPhase] = useState<Phase>('PHASE_0');
  const [role, setRole] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const inMiniApp = isReady && context;
  const fidForProfile = context?.user?.fid ?? 711506;

  useEffect(() => {
    if (inMiniApp && phase === 'PHASE_0') setPhase('PHASE_1_IDENTITY');
  }, [inMiniApp, phase]);

  const goToIdentity = useCallback(() => setPhase('PHASE_1_IDENTITY'), []);
  const goToLevel = useCallback(() => setPhase('PHASE_2_LEVEL'), []);
  const goToTask = useCallback(() => setPhase('PHASE_3_TASK'), []);
  const goBackToIdentity = useCallback(() => setPhase('PHASE_1_IDENTITY'), []);
  const goBackToLevel = useCallback(() => setPhase('PHASE_2_LEVEL'), []);

  const handlePostAndVerify = useCallback(async () => {
    const fid = context?.user?.fid ?? 711506;
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/verify?fid=${encodeURIComponent(fid)}`);
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? 'Verification failed.');
        return;
      }
      if (data.verified) {
        setShowSuccessAnimation(true);
        return;
      }
      setVerifyError("We didn't find #MagicInPublic in your recent casts. Post it, then try again.");
    } catch {
      setVerifyError('Verification failed. Try again.');
    } finally {
      setIsVerifying(false);
    }
  }, [context?.user?.fid, router]);

  if (!inMiniApp) {
    return (
      <main className="screen-center">
        <motion.div
          className="magic-container"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-[#0052ff]" strokeWidth={1.5} />
              <h1 className="font-black text-4xl text-white uppercase tracking-tighter">
                {farcasterConfig.miniapp.name}
              </h1>
            </div>
            <p className="text-zinc-400 text-lg">
              The first high-stakes Accountability Protocol on Base.
            </p>
          </div>
          <div className="magic-card rounded-2xl">
            <p className="text-zinc-400 mb-6 text-center">
              Open this Mini App in Warpcast to enter.
            </p>
            <a
              href="https://warpcast.com/~/add-cast-action"
              target="_blank"
              rel="noopener noreferrer"
              className="magic-button-primary block w-full hover:bg-[#0046e0]"
            >
              Open in Warpcast
            </a>
          </div>
        </motion.div>
      </main>
    );
  }

  if (showSuccessAnimation) {
    return (
      <SuccessCelebration
        onComplete={() => {
          setShowSuccessAnimation(false);
          router.push('/success');
        }}
      />
    );
  }

  return (
    <main className="screen-center">
      <div className="magic-container">
        <ProfileSummaryCard fid={fidForProfile} />
        <AnimatePresence mode="wait">
          {phase === 'PHASE_1_IDENTITY' && (
            <motion.section
              key="identity"
              {...SLIDE_UP_FADE}
              className="flex flex-col items-center"
            >
              <div className="w-full text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-8 h-8 text-[#0052ff]" strokeWidth={1.5} />
                  <h1 className="font-black text-4xl text-white uppercase tracking-tighter">
                    {farcasterConfig.miniapp.name}
                  </h1>
                </div>
                <p className="text-zinc-400 text-lg">Who are you trying to become?</p>
              </div>
              <div className="w-full space-y-4">
                {ROLES.map((r, i) => (
                  <motion.button
                    key={r.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * STAGGER, type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => { setRole(r.id); goToLevel(); }}
                    className="magic-card w-full text-left rounded-2xl hover:border-[#0052ff] transition-all"
                  >
                    <div className="font-bold text-xl text-white">{r.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{r.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {phase === 'PHASE_2_LEVEL' && (
            <motion.section
              key="level"
              {...SLIDE_UP_FADE}
              className="flex flex-col items-center"
            >
              <button
                type="button"
                onClick={goBackToIdentity}
                className="text-zinc-400 text-sm mb-4 self-start hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div className="w-full text-center mb-4">
                <h1 className="font-black text-3xl text-white uppercase tracking-tighter mb-2">
                  Level Check
                </h1>
                <p className="text-zinc-400 text-lg">Where do you really stand?</p>
              </div>
              <div className="w-full space-y-4">
                {LEVELS.map((l, i) => (
                  <motion.button
                    key={l.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * STAGGER, type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => { setLevel(l.id); goToTask(); }}
                    className="magic-card w-full text-left rounded-2xl hover:border-[#0052ff] transition-all"
                  >
                    <div className="font-bold text-xl text-white">{l.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{l.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {phase === 'PHASE_3_TASK' && (
            <motion.section
              key="task"
              {...SLIDE_UP_FADE}
              className="flex flex-col items-center w-full"
            >
              <button
                type="button"
                onClick={goBackToLevel}
                className="text-zinc-400 text-sm mb-4 self-start hover:text-white transition-colors"
              >
                ← Back
              </button>
              <div className="w-full text-center mb-4">
                <h1 className="font-black text-3xl text-white uppercase tracking-tighter mb-2">
                  Day 1: The Contract
                </h1>
                <p className="text-zinc-400 text-lg">Post this. Then we verify. No excuses.</p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 30 }}
                className="magic-card w-full rounded-2xl mb-6"
              >
                <p className="text-zinc-400 text-sm whitespace-pre-wrap">
                  {`I'm in. Day 1 of building in public.\n\n#MagicInPublic #Base`}
                </p>
              </motion.div>
              {verifyError && (
                <p className="text-sm text-red-400 mb-2 text-center w-full">{verifyError}</p>
              )}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isVerifying ? 1 : [1, 1.02, 1],
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  y: { type: 'spring', stiffness: 300, damping: 30 },
                  scale: isVerifying ? {} : { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                }}
                onClick={handlePostAndVerify}
                disabled={isVerifying}
                className="magic-button-primary w-full disabled:opacity-70 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Lock className="w-6 h-6 shrink-0" strokeWidth={2} />
                    <span>Scanning Farcaster...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6 shrink-0" strokeWidth={2} />
                    Post & Verify
                  </>
                )}
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
