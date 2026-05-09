"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import MomijiLayer from "./MomijiLayer";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_FILE = "Firefly ゆっくりと花が開花する動画 316695.mp4";

export default function BloomScrollHero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (!sectionEl || !videoEl) return;

    let removeVideoTicker: (() => void) | undefined;
    let removeLenisRaf: (() => void) | undefined;
    let restoreLagSmoothing: (() => void) | undefined;
    let removeResizeListener: (() => void) | undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.65,
      wheelMultiplier: 1,
    });

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisRaf);
    removeLenisRaf = () => gsap.ticker.remove(lenisRaf);
    lenis.on("scroll", ScrollTrigger.update);

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

        let smoothTime = 0;

        const syncVideoToScroll = () => {
          const target = scrollProgressForSection() * duration;
          const blend = 1 - Math.pow(0.72, gsap.ticker.deltaRatio());
          smoothTime += (target - smoothTime) * Math.min(1, blend * 1.35);
          const seek = gsap.utils.clamp(0, duration, smoothTime);
          if (Math.abs(videoEl.currentTime - seek) > 1 / 200) {
            videoEl.currentTime = seek;
          }
        };

        gsap.ticker.add(syncVideoToScroll);
        removeVideoTicker = () => gsap.ticker.remove(syncVideoToScroll);

        gsap.ticker.lagSmoothing(0);
        restoreLagSmoothing = () => gsap.ticker.lagSmoothing(500, 33);

        ScrollTrigger.refresh();
        smoothTime = scrollProgressForSection() * duration;
        videoEl.currentTime = smoothTime;
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
      removeLenisRaf?.();
      lenis.destroy();
      removeResizeListener?.();
      restoreLagSmoothing?.();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="bloom-scroll-section">
      {/* 動画・ヘッダー・SNS のみ固定（背景は透過で下のスクロール層が見える） */}
      <div className="sticky-visuals">
        <div className="flower-slot" aria-hidden="true">
          <div className="flower-mask">
            <video
              ref={videoRef}
              className="bloom-video"
              src={encodeURI(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${VIDEO_FILE}`)}
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className="flower-soft-edge" aria-hidden="true" />
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

        <div className="social-rail" aria-hidden="true">
          <span>f</span>
          <span>𝕏</span>
          <span>◎</span>
        </div>
      </div>

      {/* スクロールで流れる通常コンテンツ */}
      <div className="scroll-doc">
        <div className="scroll-cream" aria-hidden="true" />
        <div className="accent-maple" aria-hidden="true" />
        <div className="accent-garden" aria-hidden="true" />

        <div className="left-rail" aria-hidden="true">
          <span className="left-rail-text">Re-Palette</span>
        </div>

        <MomijiLayer />

        <div className="scroll-inner">
          <div className="hero-band">
            <aside className="paper-card card-left">
              <div className="paper-icon mindful" aria-hidden="true" />
              <p className="paper-title">MINDFUL BEAUTY</p>
              <p className="paper-body">
                Calm, intentional care that lets your presence settle and brighten-without rushing the bloom.
              </p>
              <button type="button" className="btn-like">
                Like
              </button>
            </aside>
            <div className="hero-band-spacer" aria-hidden="true" />
            <div className="right-stack">
              <div className="hero-copy">
                <p className="vertical-lead">内なる輝きが、今ひらく。</p>
                <div className="english-stack">
                  <p className="english-line">EMPOWERMENT THROUGH BEAUTY</p>
                  <p className="english-line muted">Your Inner Radiance,</p>
                  <p className="english-line small">SOCIAL REINTEGRATION THROUGH SUPPORT.</p>
                </div>
              </div>
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
            </div>
          </div>

          <div className="quote-row">
            <blockquote className="quote-card">
              <p className="quote-text">「美しさは、戻るための地図になる。」</p>
              <cite className="quote-from">Re-Palette Philosophy</cite>
            </blockquote>
            <div className="stat-card">
              <p className="stat-num">01</p>
              <p className="stat-label">Mindful Session</p>
              <p className="stat-desc">呼吸とペースを整え、自分のリズムを取り戻す時間。</p>
            </div>
            <div className="stat-card dim">
              <p className="stat-num">02</p>
              <p className="stat-label">Community Bridge</p>
              <p className="stat-desc">小さな対話から、社会とのつながりをそっと広げます。</p>
            </div>
          </div>

          <div className="band-labels">
            <span className="pill">Presence</span>
            <span className="pill">Gentle Pace</span>
            <span className="pill">Dignity</span>
            <span className="pill">Support</span>
          </div>

          <div className="split-cards">
            <div className="mini-card">
              <h3 className="mini-title">Program</h3>
              <p className="mini-body">少人数・安心の環境で、段階的に参加の幅を広げるプログラムをご用意しています。</p>
              <a className="mini-link" href="#">
                詳しく見る
              </a>
            </div>
            <div className="mini-card outline">
              <h3 className="mini-title">Contact</h3>
              <p className="mini-body">ご相談・見学のご希望は、お気軽にお問い合わせください。専門スタッフが丁寧にお答えします。</p>
              <a className="mini-link" href="#">
                お問い合わせ
              </a>
            </div>
          </div>

          <p className="closing-line">
            Beauty &amp; Social Integration — 内なる輝きを、社会とともにひらいていく。
          </p>

          <footer className="site-footer">
            <p className="footer-brand">Re-Palette</p>
            <p className="footer-copy">Beauty &amp; Social Integration / Since 2026</p>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#">Programs</a>
              <a href="#">Support</a>
              <a href="#">Contact</a>
            </div>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .bloom-scroll-section {
          position: relative;
          min-height: 500vh;
          overflow: clip;
          font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "Times New Roman", serif;
          color: #1c1916;
          --rail-w: clamp(42px, 4.2vw, 58px);
        }

        .sticky-visuals {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          z-index: 30;
          pointer-events: none;
          isolation: isolate;
        }

        .sticky-visuals .top-bar,
        .sticky-visuals .top-bar a,
        .sticky-visuals .social-rail span {
          pointer-events: auto;
        }

        .flower-slot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
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
        }

        .brand-center {
          grid-column: 2;
          justify-self: center;
          display: flex;
          flex-direction: row;
          gap: 0.55rem;
          align-items: flex-start;
          text-align: left;
          margin-top: 0.1rem;
        }

        .brand-center .brand-icon {
          font-size: 1.15rem;
          line-height: 1;
          opacity: 0.72;
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

        .social-rail {
          position: absolute;
          right: clamp(0.35rem, 0.95vw, 0.7rem);
          top: 50%;
          transform: translateY(-38%);
          z-index: 9;
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
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(4px);
        }

        /* スクロール文書層 */
        .scroll-doc {
          position: relative;
          margin-top: -100vh;
          min-height: 500vh;
          z-index: 10;
          --rail-w: clamp(42px, 4.2vw, 58px);
        }

        .scroll-cream {
          position: absolute;
          inset: 0;
          min-height: 100%;
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
          pointer-events: none;
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
          pointer-events: none;
        }

        .left-rail {
          position: absolute;
          left: 0;
          top: 0;
          width: var(--rail-w);
          min-height: 500vh;
          height: 100%;
          background: linear-gradient(180deg, #2e2925 0%, #171513 100%);
          z-index: 5;
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

        .scroll-inner {
          position: relative;
          z-index: 6;
          margin-left: var(--rail-w);
          margin-right: auto;
          padding: clamp(5.5rem, 14vh, 8.5rem) clamp(1rem, 4vw, 3rem) 4rem;
          max-width: 1280px;
        }

        .paper-card {
          width: min(292px, 88vw);
          padding: 1.05rem 1.2rem 0.95rem;
          background: rgba(255, 254, 252, 0.94);
          color: #161412;
          border: 1px solid rgba(198, 188, 172, 0.55);
          box-shadow: 0 22px 48px rgba(48, 40, 32, 0.1), 0 2px 0 rgba(255, 255, 255, 0.65) inset;
        }

        .card-left {
          transform: rotate(-1.4deg);
          margin: 0;
          justify-self: start;
          align-self: start;
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

        .hero-band {
          display: grid;
          grid-template-columns: minmax(230px, 292px) minmax(320px, 1fr) minmax(230px, 292px);
          align-items: start;
          gap: clamp(1.25rem, 2.4vw, 2.4rem);
          margin-bottom: 3rem;
          min-height: 52vh;
        }

        .hero-band-spacer {
          min-height: min(60vh, 560px);
        }

        .right-stack {
          display: flex;
          flex-direction: column;
          gap: clamp(1.25rem, 3vh, 2rem);
          align-items: stretch;
          justify-self: end;
        }

        .card-right {
          transform: rotate(0.65deg);
        }

        .hero-copy {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: clamp(0.7rem, 1.8vw, 1.2rem);
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
          max-width: 13.25rem;
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

        .quote-row {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          align-items: stretch;
        }

        .quote-card {
          margin: 0;
          padding: 1.35rem 1.5rem;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(198, 188, 172, 0.45);
          border-radius: 2px;
          box-shadow: 0 12px 32px rgba(48, 40, 32, 0.06);
        }

        .quote-text {
          margin: 0;
          font-size: clamp(0.95rem, 1.6vw, 1.15rem);
          line-height: 1.75;
          letter-spacing: 0.06em;
        }

        .quote-from {
          display: block;
          margin-top: 1rem;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          font-style: normal;
          opacity: 0.65;
        }

        .stat-card {
          padding: 1.2rem 1.15rem;
          background: rgba(255, 254, 252, 0.88);
          border: 1px solid rgba(198, 188, 172, 0.5);
          box-shadow: 0 10px 28px rgba(48, 40, 32, 0.07);
        }

        .stat-card.dim {
          opacity: 0.92;
        }

        .stat-num {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #a67c52;
        }

        .stat-label {
          margin: 0.35rem 0 0;
          font-size: 0.78rem;
          letter-spacing: 0.1em;
        }

        .stat-desc {
          margin: 0.5rem 0 0;
          font-size: 0.76rem;
          line-height: 1.55;
          opacity: 0.82;
        }

        .band-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          margin-bottom: 2.25rem;
        }

        .pill {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(198, 188, 172, 0.55);
          color: #2a2622;
        }

        .split-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 3rem;
        }

        .mini-card {
          padding: 1.35rem 1.4rem;
          background: rgba(255, 254, 252, 0.9);
          border: 1px solid rgba(198, 188, 172, 0.5);
          box-shadow: 0 14px 36px rgba(48, 40, 32, 0.08);
        }

        .mini-card.outline {
          background: rgba(255, 255, 255, 0.35);
        }

        .mini-title {
          margin: 0;
          font-size: 0.92rem;
          letter-spacing: 0.08em;
        }

        .mini-body {
          margin: 0.65rem 0 0;
          font-size: 0.8rem;
          line-height: 1.65;
          opacity: 0.85;
        }

        .mini-link {
          display: inline-block;
          margin-top: 0.85rem;
          font-size: 0.76rem;
          letter-spacing: 0.08em;
          color: #8b5a3c;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .closing-line {
          margin: 0;
          padding: 1.5rem 0 2rem;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          line-height: 1.8;
          opacity: 0.78;
          text-align: center;
          border-top: 1px solid rgba(198, 188, 172, 0.45);
        }

        .site-footer {
          margin-top: 1.5rem;
          padding: 1.4rem 0 2.2rem;
          border-top: 1px solid rgba(198, 188, 172, 0.45);
          text-align: center;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.22));
        }

        .footer-brand {
          margin: 0;
          font-size: 1.02rem;
          letter-spacing: 0.08em;
        }

        .footer-copy {
          margin: 0.35rem 0 0;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          opacity: 0.72;
          font-family: ui-sans-serif, system-ui, sans-serif;
        }

        .footer-links {
          margin-top: 0.85rem;
          display: flex;
          justify-content: center;
          gap: 0.95rem;
          flex-wrap: wrap;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
        }

        .footer-links a {
          color: #473e34;
          text-decoration: none;
        }

        @media (max-width: 1000px) {
          .quote-row {
            grid-template-columns: 1fr;
          }

          .split-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .hero-band {
            grid-template-columns: 1fr;
            justify-items: center;
          }

          .hero-band-spacer {
            min-height: 26vh;
          }

          .right-stack {
            width: 100%;
            max-width: 24rem;
          }

          .hero-copy {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .vertical-lead {
            writing-mode: horizontal-tb;
            letter-spacing: 0.14em;
          }

          .english-stack {
            max-width: 100%;
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
