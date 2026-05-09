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

    const ctx = gsap.context(() => {
      let onLoadedMetadata: (() => void) | null = null;

      const setScrollSync = () => {
        if (!videoEl.duration || Number.isNaN(videoEl.duration)) return;

        const scrubState = { t: 0 };

        gsap.to(scrubState, {
          t: videoEl.duration,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
          onUpdate: () => {
            videoEl.currentTime = scrubState.t;
          },
        });

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
              scrub: 1.5,
            },
          }
        );
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
          <p className="paper-kicker">◇</p>
          <p className="paper-title">MINDFUL BEAUTY</p>
          <p className="paper-body">
            Calm, intentional care that lets your presence settle and brighten—without rushing the bloom.
          </p>
          <button type="button" className="btn-like">
            Like
          </button>
        </aside>

        <aside className="paper-card card-right">
          <p className="paper-kicker">▭</p>
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
        }

        .cream-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(165deg, #f7f4ec 0%, #efe8dc 45%, #ebe3d4 100%);
          z-index: 0;
        }

        .accent-maple {
          position: absolute;
          top: -6%;
          left: -4%;
          width: 42vmin;
          height: 42vmin;
          background: radial-gradient(circle, rgba(120, 52, 40, 0.14) 0%, transparent 70%);
          filter: blur(18px);
          z-index: 0;
        }

        .accent-garden {
          position: absolute;
          bottom: -12%;
          left: -8%;
          width: 55vmin;
          height: 40vmin;
          background: radial-gradient(ellipse at 30% 60%, rgba(88, 110, 72, 0.12) 0%, transparent 65%);
          filter: blur(22px);
          z-index: 0;
        }

        .left-rail {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: clamp(36px, 3.6vw, 52px);
          background: linear-gradient(180deg, #2a2622 0%, #1a1816 100%);
          z-index: 4;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .left-rail-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          color: rgba(245, 241, 232, 0.82);
          font-size: 0.62rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
        }

        .hero-main {
          position: absolute;
          inset: 0;
          left: clamp(36px, 3.6vw, 52px);
          z-index: 2;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          padding: 0 clamp(1rem, 4vw, 4rem) 0 clamp(0.5rem, 2vw, 2rem);
          max-width: 1280px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .flower-slot {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 72vh;
        }

        .flower-mask {
          position: relative;
          width: min(72vmin, 520px);
          aspect-ratio: 3 / 4;
          border-radius: 50%;
          overflow: hidden;
          mask-image: radial-gradient(
            ellipse 52% 56% at 50% 48%,
            #000 0%,
            #000 52%,
            rgba(0, 0, 0, 0.45) 72%,
            rgba(0, 0, 0, 0) 100%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 52% 56% at 50% 48%,
            #000 0%,
            #000 52%,
            rgba(0, 0, 0, 0.45) 72%,
            rgba(0, 0, 0, 0) 100%
          );
        }

        .bloom-video {
          position: absolute;
          inset: -8%;
          width: 116%;
          height: 116%;
          object-fit: cover;
          object-position: 52% 42%;
          filter: saturate(1.02) contrast(1.02);
        }

        .flower-soft-edge {
          pointer-events: none;
          position: absolute;
          inset: -12%;
          background: radial-gradient(ellipse 48% 50% at 50% 48%, transparent 45%, rgba(247, 244, 236, 0.55) 78%, rgba(247, 244, 236, 1) 100%);
          mix-blend-mode: multiply;
          opacity: 0.35;
        }

        .hero-copy {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          gap: clamp(1rem, 2.5vw, 2.25rem);
          padding-top: 6vh;
          opacity: 0.92;
        }

        .vertical-lead {
          margin: 0;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: clamp(1.35rem, 2.4vw, 2.35rem);
          font-weight: 400;
          letter-spacing: 0.22em;
          line-height: 1.75;
        }

        .english-stack {
          margin: 0;
          padding-top: 0.25rem;
          max-width: 16rem;
          font-family: ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        }

        .english-line {
          margin: 0 0 0.55rem;
          font-size: clamp(0.62rem, 1vw, 0.78rem);
          letter-spacing: 0.14em;
          line-height: 1.45;
          text-transform: uppercase;
          font-weight: 500;
        }

        .english-line.muted {
          opacity: 0.72;
          text-transform: none;
          letter-spacing: 0.06em;
        }

        .english-line.small {
          font-size: clamp(0.55rem, 0.9vw, 0.68rem);
          letter-spacing: 0.12em;
        }

        .top-bar {
          position: absolute;
          top: clamp(0.85rem, 2vw, 1.6rem);
          left: 50%;
          transform: translateX(-50%);
          width: min(1180px, calc(100vw - 2.5rem));
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 5;
          pointer-events: none;
        }

        .brand-center {
          display: flex;
          gap: 0.55rem;
          align-items: flex-start;
          text-align: left;
          pointer-events: auto;
        }

        .brand-icon {
          font-size: 1rem;
          line-height: 1.2;
          opacity: 0.75;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(1rem, 2vw, 1.55rem);
          letter-spacing: 0.06em;
        }

        .brand-sub {
          margin: 0.15rem 0 0;
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          opacity: 0.78;
        }

        .top-nav {
          position: absolute;
          right: 0;
          top: 0.15rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: ui-sans-serif, system-ui, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          pointer-events: auto;
        }

        .top-nav a {
          color: #1c1916;
          text-decoration: none;
        }

        .nav-sep {
          opacity: 0.35;
          user-select: none;
        }

        .paper-card {
          position: absolute;
          z-index: 5;
          width: min(300px, calc(100vw - 5rem));
          padding: 1.1rem 1.15rem 1rem;
          background: rgba(255, 255, 255, 0.92);
          color: #1c1916;
          border: 1px solid rgba(210, 200, 184, 0.65);
          box-shadow: 0 18px 42px rgba(40, 34, 28, 0.12);
        }

        .card-left {
          left: calc(clamp(36px, 3.6vw, 52px) + clamp(0.75rem, 3vw, 2.5rem));
          top: 26vh;
          transform: rotate(-1.2deg);
        }

        .card-right {
          right: clamp(1rem, 3vw, 2.5rem);
          bottom: 14vh;
          transform: rotate(0.8deg);
        }

        .paper-kicker {
          margin: 0 0 0.2rem;
          font-size: 0.75rem;
          opacity: 0.55;
        }

        .paper-title {
          margin: 0;
          font-size: 1rem;
          letter-spacing: 0.04em;
        }

        .paper-body {
          margin: 0.65rem 0 0;
          line-height: 1.55;
          font-size: 0.82rem;
          opacity: 0.88;
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
          right: clamp(0.5rem, 1.2vw, 1rem);
          bottom: 18vh;
          z-index: 5;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.72rem;
          color: rgba(28, 25, 22, 0.55);
        }

        @media (max-width: 900px) {
          .hero-main {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            padding-top: 4.5rem;
            align-content: center;
          }

          .flower-slot {
            min-height: 48vh;
          }

          .flower-mask {
            width: min(78vmin, 420px);
          }

          .hero-copy {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding-top: 0;
          }

          .vertical-lead {
            writing-mode: horizontal-tb;
            letter-spacing: 0.12em;
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
