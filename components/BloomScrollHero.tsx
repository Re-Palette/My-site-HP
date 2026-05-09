"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_FILE = "Firefly ゆっくりと花が開花する動画 316695.mp4";

export default function BloomScrollHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroTextRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    const heroTextEl = heroTextRef.current;
    if (!sectionEl || !videoEl || !heroTextEl) return;

    let removeVideoTicker: (() => void) | undefined;
    let restoreLagSmoothing: (() => void) | undefined;
    let removeResizeListener: (() => void) | undefined;

    const ctx = gsap.context(() => {
      let onLoadedMetadata: (() => void) | null = null;
      let videoSyncReady = false;

      const setScrollSync = () => {
        const duration = videoEl.duration;
        if (!duration || Number.isNaN(duration) || videoSyncReady) return;
        videoSyncReady = true;

        videoEl.pause();

        const scrollProgressForSection = () => {
          const sectionH = sectionEl.offsetHeight;
          const vh = window.innerHeight;
          const denom = Math.max(1e-6, sectionH - vh);
          const top = sectionEl.getBoundingClientRect().top;
          return gsap.utils.clamp(0, 1, -top / denom);
        };

        const syncVideoToScroll = () => {
          const p = scrollProgressForSection();
          const next = p * duration;
          if (Math.abs(videoEl.currentTime - next) > 1e-4) {
            videoEl.currentTime = next;
          }
        };

        gsap.ticker.add(syncVideoToScroll);
        removeVideoTicker = () => gsap.ticker.remove(syncVideoToScroll);

        gsap.ticker.lagSmoothing(0);
        restoreLagSmoothing = () => gsap.ticker.lagSmoothing(500, 33);

        gsap.fromTo(
          heroTextEl,
          { opacity: 0.35, y: 28 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top 58%",
              end: "top 18%",
              scrub: true,
            },
          }
        );

        ScrollTrigger.refresh();
        syncVideoToScroll();

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);
        removeResizeListener = () => window.removeEventListener("resize", onResize);
      };

      if (videoEl.readyState >= 1) {
        setScrollSync();
      } else {
        onLoadedMetadata = () => setScrollSync();
        videoEl.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
      }

      return () => {
        if (onLoadedMetadata) {
          videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
        }
      };
    }, sectionRef);

    return () => {
      removeVideoTicker?.();
      removeResizeListener?.();
      restoreLagSmoothing?.();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="bloom-scroll-section">
      <div className="bloom-sticky-stage">
        <div className="cream-bg" aria-hidden="true" />
        <div className="accent-maple" aria-hidden="true" />
        <div className="accent-garden" aria-hidden="true" />

        <div className="left-rail" aria-hidden="true">
          <span className="left-rail-text">Re-Palette</span>
        </div>

        <div className="hero-main">
          <div className="flower-slot" aria-hidden="true">
            <div className="flower-mask">
              <video
                ref={videoRef}
                className="bloom-video"
                src={encodeURI(
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${VIDEO_FILE}`
                )}
                muted
                playsInline
                preload="auto"
              />
            </div>
            <div className="flower-soft-edge" aria-hidden="true" />
          </div>

          <div ref={heroTextRef} className="hero-copy">
            <p className="vertical-lead">内なる輝きが、今ひらく。</p>
            <div className="english-stack">
              <p className="english-line">EMPOWERMENT THROUGH BEAUTY</p>
              <p className="english-line muted">Your Inner Radiance,</p>
              <p className="english-line small">SOCIAL REINTEGRATION THROUGH SUPPORT.</p>
            </div>
          </div>
        </div>

        <header className="top-bar">
          <div className="brand-center">
            <span className="brand-icon" aria-hidden="true">
              ❀
            </span>
            <div>
              <p className="brand-title">Re-Palette</p>
              <p className="brand-sub">Beauty &amp; Social Integration</p>
            </div>
          </div>
          <nav className="top-nav" aria-label="Primary">
            <a href="#">ABOUT</a>
            <span className="nav-sep">|</span>
            <a href="#">SUPPORT</a>
            <span className="nav-sep">|</span>
            <a href="#">PROGRAMS</a>
            <span className="nav-sep">|</span>
            <a href="#">CONTACT</a>
          </nav>
        </header>

        <aside className="paper-card card-left">
          <div className="paper-icon mindful" aria-hidden="true" />
          <p className="paper-title">MINDFUL BEAUTY</p>
          <p className="paper-body">
            Calm, intentional care that lets your presence settle and brighten—without rushing the bloom.
          </p>
          <button type="button" className="btn-like">
            Like
          </button>
        </aside>

        <aside className="paper-card card-right">
          <div className="paper-icon steps" aria-hidden="true" />
          <p className="paper-title">SOCIAL STEPPING STONES</p>
          <p className="paper-body">
            Gentle steps back into connection—paced for you, supported at every landing.
          </p>
          <a href="#" className="link-more">
            Link more
          </a>
        </aside>

        <div className="social-rail" aria-hidden="true">
          <span>f</span>
          <span>𝕏</span>
          <span>◎</span>
        </div>
      </div>

      <style jsx>{`
        .bloom-scroll-section {
          position: relative;
          height: 500vh;
          overflow: clip;
          font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "Times New Roman", serif;
          color: #1c1916;
        }

        .bloom-sticky-stage {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          isolation: isolate;
          overflow: hidden;
          --rail-w: clamp(42px, 4.2vw, 58px);
        }

        .cream-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 130% 85% at 72% 18%, rgba(255, 253, 248, 0.97) 0%, transparent 52%),
            linear-gradient(168deg, #faf7ef 0%, #f4ebe2 40%, #efe6da 100%);
          z-index: 0;
        }

        .accent-maple {
          position: absolute;
          top: -10%;
          left: calc(var(--rail-w) - 12px);
          width: 50vmin;
          height: 46vmin;
          background: radial-gradient(
            circle at 38% 38%,
            rgba(165, 82, 68, 0.26) 0%,
            rgba(130, 62, 48, 0.12) 42%,
            transparent 70%
          );
          filter: blur(26px);
          z-index: 0;
        }

        .accent-garden {
          position: absolute;
          bottom: -16%;
          left: calc(var(--rail-w) - 6%);
          width: 62vmin;
          height: 48vmin;
          background:
            radial-gradient(ellipse at 28% 52%, rgba(252, 252, 250, 0.9) 0%, transparent 48%),
            radial-gradient(ellipse at 42% 68%, rgba(88, 112, 74, 0.13) 0%, transparent 58%);
          filter: blur(28px);
          z-index: 0;
        }

        .left-rail {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--rail-w);
          background: linear-gradient(180deg, #2e2925 0%, #171513 100%);
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
        }

        .left-rail-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          color: rgba(248, 244, 236, 0.78);
          font-size: 0.58rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          font-weight: 300;
        }

        .hero-main {
          position: absolute;
          inset: 0;
          left: var(--rail-w);
          z-index: 2;
          pointer-events: none;
        }

        .flower-slot,
        .hero-copy {
          pointer-events: auto;
        }

        .flower-slot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .flower-mask {
          position: relative;
          width: min(74vmin, 536px);
          aspect-ratio: 24 / 31;
          border-radius: 50%;
          overflow: hidden;
          mask-image: radial-gradient(
            ellipse 50% 58% at 50% 46%,
            #000 0%,
            #000 54%,
            rgba(0, 0, 0, 0.42) 74%,
            rgba(0, 0, 0, 0) 100%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 50% 58% at 50% 46%,
            #000 0%,
            #000 54%,
            rgba(0, 0, 0, 0.42) 74%,
            rgba(0, 0, 0, 0) 100%
          );
          box-shadow: 0 28px 60px rgba(62, 52, 42, 0.08);
        }

        .bloom-video {
          position: absolute;
          inset: -7%;
          width: 114%;
          height: 114%;
          object-fit: cover;
          object-position: 50% 46%;
          filter: saturate(1.03) contrast(1.03) brightness(1.01);
        }

        .flower-soft-edge {
          pointer-events: none;
          position: absolute;
          inset: -14%;
          background: radial-gradient(
            ellipse 46% 52% at 50% 46%,
            transparent 42%,
            rgba(250, 246, 237, 0.45) 76%,
            rgba(250, 246, 237, 0.92) 100%
          );
          mix-blend-mode: multiply;
          opacity: 0.38;
        }

        .hero-copy {
          position: absolute;
          left: calc(50% + min(37vmin, 268px) + clamp(1.25rem, 4vw, 3.5rem));
          top: 50%;
          transform: translateY(-52%);
          z-index: 4;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          gap: clamp(1rem, 2.2vw, 2rem);
          padding-top: 0;
          opacity: 0.94;
        }

        .vertical-lead {
          margin: 0;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: clamp(1.28rem, 2.35vw, 2.28rem);
          font-weight: 300;
          letter-spacing: 0.26em;
          line-height: 1.85;
          color: #161412;
        }

        .english-stack {
          margin: 0;
          padding-top: 0.35rem;
          max-width: 15.5rem;
          font-family: ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        }

        .english-line {
          margin: 0 0 0.48rem;
          font-size: clamp(0.6rem, 0.95vw, 0.76rem);
          letter-spacing: 0.16em;
          line-height: 1.48;
          text-transform: uppercase;
          font-weight: 500;
          color: #221e1a;
        }

        .english-line.muted {
          opacity: 0.68;
          text-transform: none;
          letter-spacing: 0.07em;
          font-weight: 400;
        }

        .english-line.small {
          font-size: clamp(0.52rem, 0.88vw, 0.66rem);
          letter-spacing: 0.13em;
          line-height: 1.55;
        }

        .top-bar {
          position: absolute;
          top: clamp(0.9rem, 2.2vw, 1.75rem);
          left: var(--rail-w);
          right: 0;
          padding: 0 clamp(1rem, 3vw, 2.25rem);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: flex-start;
          z-index: 7;
          pointer-events: none;
        }

        .brand-center {
          grid-column: 2;
          justify-self: center;
          display: flex;
          flex-direction: row;
          gap: 0.55rem;
          align-items: flex-start;
          text-align: left;
          pointer-events: auto;
          margin-top: 0.1rem;
        }

        .brand-center .brand-icon {
          font-size: 1.15rem;
          line-height: 1;
          opacity: 0.72;
          letter-spacing: 0;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(1.05rem, 2.1vw, 1.62rem);
          letter-spacing: 0.08em;
          font-weight: 400;
        }

        .brand-sub {
          margin: 0.12rem 0 0;
          font-size: 0.66rem;
          letter-spacing: 0.06em;
          opacity: 0.74;
          font-weight: 300;
        }

        .top-nav {
          grid-column: 3;
          justify-self: end;
          align-self: start;
          padding-top: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.42rem;
          font-family: ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 0.66rem;
          letter-spacing: 0.13em;
          pointer-events: auto;
        }

        .top-nav a {
          color: #1a1714;
          text-decoration: none;
          font-weight: 500;
        }

        .top-nav a:hover {
          opacity: 0.65;
        }

        .nav-sep {
          opacity: 0.28;
          user-select: none;
          font-weight: 300;
        }

        .paper-card {
          position: absolute;
          z-index: 7;
          width: min(292px, calc(100vw - var(--rail-w) - 2.5rem));
          padding: 1.05rem 1.2rem 0.95rem;
          background: rgba(255, 254, 252, 0.94);
          color: #161412;
          border: 1px solid rgba(198, 188, 172, 0.55);
          box-shadow: 0 22px 48px rgba(48, 40, 32, 0.1), 0 2px 0 rgba(255, 255, 255, 0.65) inset;
        }

        .card-left {
          left: calc(var(--rail-w) + clamp(0.65rem, 2.4vw, 1.85rem));
          top: 21vh;
          transform: rotate(-1.4deg);
        }

        .card-right {
          right: clamp(0.85rem, 2.8vw, 2.25rem);
          bottom: 13vh;
          transform: rotate(1deg);
        }

        .paper-icon {
          width: 34px;
          height: 34px;
          margin-bottom: 0.5rem;
          border-radius: 50%;
          border: 1px solid rgba(22, 20, 18, 0.08);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
        }

        .paper-icon.mindful {
          background:
            radial-gradient(circle at 45% 42%, rgba(230, 198, 118, 0.45) 0%, transparent 58%),
            linear-gradient(165deg, #fdfcfa 0%, #f3ebe3 100%);
        }

        .paper-icon.steps {
          background: linear-gradient(
              180deg,
              transparent 0%,
              transparent 38%,
              rgba(22, 20, 18, 0.07) 38%,
              rgba(22, 20, 18, 0.07) 62%,
              transparent 62%
            ),
            linear-gradient(165deg, #fdfcfa 0%, #f3ebe3 100%);
        }

        .paper-title {
          margin: 0;
          font-size: 0.98rem;
          letter-spacing: 0.045em;
          font-weight: 500;
        }

        .paper-body {
          margin: 0.6rem 0 0;
          line-height: 1.58;
          font-size: 0.8rem;
          opacity: 0.84;
          font-weight: 400;
        }

        .btn-like {
          margin-top: 0.75rem;
          padding: 0.32rem 1.1rem;
          border: none;
          border-radius: 2px;
          background: linear-gradient(180deg, #e8c96a 0%, #c9a24a 100%);
          color: #2a2218;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 0 rgba(90, 70, 30, 0.25);
        }

        .link-more {
          margin-top: 0.65rem;
          display: inline-block;
          font-size: 0.8rem;
          color: #b03030;
          letter-spacing: 0.06em;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .social-rail {
          position: absolute;
          right: clamp(0.45rem, 1.1vw, 0.95rem);
          bottom: 17vh;
          z-index: 7;
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          color: rgba(26, 23, 20, 0.48);
        }

        .social-rail span {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(26, 23, 20, 0.14);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
        }

        @media (max-width: 1100px) {
          .flower-mask {
            width: min(68vmin, 460px);
          }

          .hero-copy {
            left: calc(50% + min(34vmin, 230px) + clamp(0.85rem, 3vw, 2rem));
          }
        }

        @media (max-width: 900px) {
          .hero-main {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 5.25rem 1rem 2rem;
          }

          .flower-slot {
            position: relative;
            left: auto;
            top: auto;
            transform: none;
          }

          .flower-mask {
            width: min(76vmin, 400px);
          }

          .hero-copy {
            position: relative;
            left: auto;
            top: auto;
            transform: none;
            margin-top: 1.5rem;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .vertical-lead {
            writing-mode: horizontal-tb;
            letter-spacing: 0.14em;
          }

          .english-stack {
            max-width: 22rem;
          }

          .paper-card {
            display: none;
          }

          .top-nav {
            display: none;
          }

          .social-rail {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
