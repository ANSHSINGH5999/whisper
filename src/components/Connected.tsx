import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import type { Midnight } from '../hooks/useMidnight';

const VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4';

const fade = (y: number, duration: number, delay: number) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay },
});

/** Shown right after a wallet connects, before an organisation is opened. */
export function ConnectedHero({ m }: { m: Midnight }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="nx-hero">
      <motion.div className="nx-hero-copy" style={{ y: textY, opacity: textOpacity }}>
        <motion.div className="liquid-glass nx-pill" {...fade(10, 0.5, 0)}>
          <span className="nx-new">Connected</span>
          <span>{m.walletName ?? 'Wallet'} · Preprod</span>
        </motion.div>
        <motion.h1 {...fade(20, 0.6, 0.1)}>
          Your Voice.
          <br />
          One Safe <em>Channel.</em>
        </motion.h1>
        <motion.p className="nx-sub" {...fade(20, 0.6, 0.2)}>
          Prove you belong to an organisation in zero knowledge,
          <br />
          then report without revealing who you are.
        </motion.p>
        <motion.a className="nx-cta" href="#start" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} {...fade(20, 0.6, 0.3)}>
          Open or deploy an organisation
        </motion.a>
      </motion.div>

      <motion.div className="nx-stage" {...fade(40, 0.8, 0.4)}>
        <video className="nx-video" src={VIDEO} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
        <div className="nx-fade" />
      </motion.div>
    </section>
  );
}

const STATEMENT =
  'Whisper lets verified members of an organisation report wrongdoing with a zero-knowledge proof that they belong. Not to the public. Not to the admin who invited them.';

function Word({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const range: [number, number] = [i / total, (i + 1) / total];
  const opacity = useTransform(progress, range, [0.2, 1]);
  const color = useTransform(progress, range, ['hsl(0 0% 35%)', 'hsl(0 0% 100%)']);
  return (
    <motion.span className="nx-word" style={{ opacity, color }}>
      {word}
    </motion.span>
  );
}

/** Scroll-driven word reveal. */
export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end center'] });
  const words = STATEMENT.split(' ');

  return (
    <section className="nx-statement">
      <div ref={ref} className="nx-statement-inner">
        <svg className="nx-quote" viewBox="0 0 56 40" aria-hidden="true">
          <path fill="currentColor" d="M0 40V22C0 9 7 1 21 0v8c-7 1-10 5-10 10h10v22H0Zm32 0V22C32 9 39 1 53 0v8c-7 1-10 5-10 10h10v22H32Z" />
        </svg>
        <p className="nx-statement-text">
          {words.map((w, i) => (
            <Word key={i} word={w} i={i} total={words.length} progress={scrollYProgress} />
          ))}
        </p>
        <div className="nx-author">
          <span className="nx-author-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            </svg>
          </span>
          <div>
            <p className="nx-author-name">Whisper</p>
            <p className="nx-author-role">Zero-knowledge by design</p>
          </div>
        </div>
      </div>
    </section>
  );
}
