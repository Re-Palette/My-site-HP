"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import MomijiLayer from "./MomijiLayer";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_FILE = "Firefly ゆっくりと花が開花する動画 316695.mp4";

export default function BloomScrollHero() {
  const [isLoading, setIsLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    const loadingEl = loadingRef.current;
    if (!sectionEl || !videoEl) return;

    // デバイス検出
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceType('mobile');
      } else if (width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // 初期検出
    detectDevice();

    // リサイズ時の検出
    const handleResize = () => {
      detectDevice();
    };
    window.addEventListener('resize', handleResize);

    // デバイス検出のクリーンアップ
    const removeDeviceDetection = () => {
      window.removeEventListener('resize', handleResize);
    };

    // ロード画面のアニメーション
    const hideLoading = () => {
      if (loadingEl) {
        gsap.to(loadingEl, {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
          onComplete: () => {
            setIsLoading(false);
          }
        });
      }
    };

    // 2秒後にロード画面を非表示
    const loadingTimer = setTimeout(hideLoading, 2000);

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
        videoEl.playbackRate = 1.0;

        // Canvas描画用の変数
        const canvasEl = canvasRef.current;
        const ctx = canvasEl?.getContext('2d') as CanvasRenderingContext2D | null;
        let isVideoReady = false;

        // 動画の準備が完了したらCanvas描画を開始
        const setupCanvas = () => {
          if (!canvasEl || !ctx || !videoEl) return;
          
          canvasEl.width = videoEl.videoWidth || 1920;
          canvasEl.height = videoEl.videoHeight || 1080;
          isVideoReady = true;
        };

        // Canvasに動画を描画する関数
        const drawVideoToCanvas = () => {
          if (!isVideoReady || !ctx || !videoEl || !canvasEl) return;
          
          try {
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
          } catch (e) {
            // 動画がまだ準備できていない場合
            console.log('Canvas draw error:', e);
          }
        };

        // GSAP ScrollTriggerによる動画同期
        setupCanvas();
        
        const videoScrollTrigger = ScrollTrigger.create({
          trigger: sectionEl,
          start: "top top",
          end: "bottom top",
          scrub: 0.8, // 慣性を持たせた滑らかなスクラビング
          onUpdate: (self) => {
            const progress = self.progress;
            const targetTime = progress * duration;
            
            // スムージングなしの直接更新（GSAPが処理）
            videoEl.currentTime = targetTime;
            
            // Canvas描画
            drawVideoToCanvas();
          },
          onRefresh: () => {
            // ScrollTriggerの更新時にCanvasを再設定
            setupCanvas();
          }
        });

        // ScrollTriggerのクリーンアップ
        removeVideoTicker = () => {
          videoScrollTrigger.kill();
        };

        // リサイズ対応
        const onResize = () => {
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", onResize, { passive: true });
        removeResizeListener = () => {
          window.removeEventListener("resize", onResize);
        };
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
      clearTimeout(loadingTimer);
      removeVideoTicker?.();
      removeLenisRaf?.();
      lenis.destroy();
      removeResizeListener?.();
      removeDeviceDetection?.();
      restoreLagSmoothing?.();
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* ロード画面 */}
      {isLoading && (
        <div ref={loadingRef} className="loading-screen">
          <div className="loading-content">
            <div className="loading-flower-container">
              <div className="loading-petals">
                <div className="petal petal-1"></div>
                <div className="petal petal-2"></div>
                <div className="petal petal-3"></div>
                <div className="petal petal-4"></div>
                <div className="petal petal-5"></div>
                <div className="petal petal-6"></div>
              </div>
              <div className="loading-center">❀</div>
            </div>
            <p className="loading-text">Re-Palette</p>
            <p className="loading-sub">Beauty & Social Integration</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      
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
              style={{ display: 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="bloom-canvas"
              style={{ width: '100%', height: '100%' }}
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

        <div className="hero-copy">
          <p className="vertical-lead">内なる輝きが、今ひらく。</p>
          <div className="english-stack">
            <p className="english-line">EMPOWERMENT THROUGH BEAUTY</p>
            <p className="english-line muted">Your Inner Radiance,</p>
            <p className="english-line small">SOCIAL REINTEGRATION THROUGH SUPPORT.</p>
          </div>
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
          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">MINDFUL BEAUTY</p>
            <p className="paper-body">
              Calm, intentional care that lets your presence settle and brighten-without rushing the bloom.
            </p>
            <button type="button" className="btn-like">
              Like
            </button>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon steps" aria-hidden="true" />
            <p className="paper-title">SOCIAL STEPPING STONES</p>
            <p className="paper-body">
              Gentle steps back into connection-paced for you, supported at every landing.
            </p>
            <a href="#" className="link-more">
              Link more
            </a>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">ABOUT</p>
            <p className="paper-body">
              Re-Paletteは美しさを通じて社会再統合を支援するプラットフォームです。一人ひとりのペースを尊重し、内なる輝きを引き出すサポートを提供します。
            </p>
            <button type="button" className="btn-like">
              詳しく見る
            </button>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon steps" aria-hidden="true" />
            <p className="paper-title">SUPPORT</p>
            <p className="paper-body">
              専門スタッフによる個別サポート、グループセッション、ピアサポートなど、多様な支援プログラムをご用意しています。
            </p>
            <a href="#" className="link-more">
              サポート詳細
            </a>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">PROGRAMS</p>
            <p className="paper-body">
              マインドフルネス・ビューティー、アートセラピー、コミュニティ活動など、段階的に参加できるプログラムを展開しています。
            </p>
            <button type="button" className="btn-like">
              プログラム一覧
            </button>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon steps" aria-hidden="true" />
            <p className="paper-title">CONTACT</p>
            <p className="paper-body">
              ご相談・見学・お問い合わせはお気軽にご連絡ください。専門スタッフが丁寧に対応いたします。
            </p>
            <a href="#" className="link-more">
              お問い合わせ
            </a>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">PHILOSOPHY</p>
            <p className="paper-body">
              「美しさは、戻るための地図になる。」
            </p>
            <button type="button" className="btn-like">
              Re-Palette Philosophy
            </button>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon steps" aria-hidden="true" />
            <p className="paper-title">MINDFUL SESSION</p>
            <p className="paper-body">
              呼吸とペースを整え、自分のリズムを取り戻す時間。
            </p>
            <a href="#" className="link-more">
              詳しく見る
            </a>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">COMMUNITY BRIDGE</p>
            <p className="paper-body">
              小さな対話から、社会とのつながりをそっと広げます。
            </p>
            <button type="button" className="btn-like">
              参加する
            </button>
          </aside>

          <div className="band-labels">
            <span className="pill">Presence</span>
            <span className="pill">Gentle Pace</span>
            <span className="pill">Dignity</span>
            <span className="pill">Support</span>
          </div>

          <aside className="paper-card">
            <div className="paper-icon steps" aria-hidden="true" />
            <p className="paper-title">PROGRAM</p>
            <p className="paper-body">
              少人数・安心の環境で、段階的に参加の幅を広げるプログラムをご用意しています。
            </p>
            <a href="#" className="link-more">
              詳しく見る
            </a>
          </aside>

          <aside className="paper-card">
            <div className="paper-icon mindful" aria-hidden="true" />
            <p className="paper-title">CONTACT</p>
            <p className="paper-body">
              ご相談・見学のご希望は、お気軽にお問い合わせください。専門スタッフが丁寧にお答えします。
            </p>
            <button type="button" className="btn-like">
              お問い合わせ
            </button>
          </aside>

          </div>
      </div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="footer-brand">Re-Palette</p>
          <p className="footer-copy">Beauty &amp; Social Integration / Since 2026</p>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Programs</a>
            <a href="#">Support</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* ロード画面 */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background:
            radial-gradient(ellipse 130% 85% at 72% 18%, rgba(255, 253, 248, 0.97) 0%, transparent 52%),
            linear-gradient(168deg, #faf7ef 0%, #f4ebe2 40%, #efe6da 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          color: #1c1916;
          overflow: hidden;
        }

        .loading-screen::before {
          content: '';
          position: absolute;
          top: -10%;
          left: 10%;
          width: 50vmin;
          height: 46vmin;
          background: radial-gradient(
            circle at 38% 38%,
            rgba(165, 82, 68, 0.26) 0%,
            rgba(130, 62, 48, 0.12) 42%,
            transparent 70%
          );
          filter: blur(26px);
          pointer-events: none;
          animation: floatGentle 8s ease-in-out infinite;
        }

        .loading-screen::after {
          content: '';
          position: absolute;
          bottom: -16%;
          right: 10%;
          width: 62vmin;
          height: 48vmin;
          background:
            radial-gradient(ellipse at 28% 52%, rgba(252, 252, 250, 0.9) 0%, transparent 48%),
            radial-gradient(ellipse at 42% 68%, rgba(88, 112, 74, 0.13) 0%, transparent 58%);
          filter: blur(28px);
          pointer-events: none;
          animation: floatGentle 10s ease-in-out infinite reverse;
        }

        .loading-content {
          text-align: center;
          animation: contentFadeIn 2s ease-out;
          position: relative;
          z-index: 1;
        }

        .loading-flower-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-petals {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: rotateSlow 20s linear infinite;
        }

        .petal {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #e8c96a 0%, #c9a24a 100%);
          border-radius: 0 50% 50% 50%;
          transform-origin: bottom right;
          opacity: 0;
          animation: bloomPetal 2s ease-out forwards;
          box-shadow: 0 4px 12px rgba(200, 150, 70, 0.3);
        }

        .petal-1 {
          top: 10px;
          left: 50%;
          transform: translateX(-50%) rotate(0deg);
          animation-delay: 0.1s;
        }

        .petal-2 {
          top: 30px;
          right: 15px;
          transform: rotate(60deg);
          animation-delay: 0.2s;
        }

        .petal-3 {
          bottom: 30px;
          right: 15px;
          transform: rotate(120deg);
          animation-delay: 0.3s;
        }

        .petal-4 {
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%) rotate(180deg);
          animation-delay: 0.4s;
        }

        .petal-5 {
          bottom: 30px;
          left: 15px;
          transform: rotate(240deg);
          animation-delay: 0.5s;
        }

        .petal-6 {
          top: 30px;
          left: 15px;
          transform: rotate(300deg);
          animation-delay: 0.6s;
        }

        .loading-center {
          font-size: 2.5rem;
          opacity: 0;
          animation: centerBloom 1.5s ease-out 0.8s forwards;
          filter: drop-shadow(0 2px 8px rgba(26, 23, 20, 0.2));
        }

        .loading-text {
          margin: 0;
          font-size: 2.5rem;
          letter-spacing: 0.15em;
          font-weight: 300;
          opacity: 0;
          animation: textFadeIn 1.2s ease-out 1.2s forwards;
          font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", serif;
          background: linear-gradient(135deg, #a67c52 0%, #2a2622 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-sub {
          margin: 0.5rem 0 1.5rem;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          opacity: 0;
          font-family: ui-sans-serif, system-ui, sans-serif;
          animation: textFadeIn 1.2s ease-out 1.4s forwards;
          color: #666;
          font-weight: 400;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          animation: textFadeIn 1.2s ease-out 1.6s forwards;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #e8c96a 0%, #c9a24a 100%);
          border-radius: 50%;
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bloomPetal {
          0% {
            opacity: 0;
            transform: scale(0) rotate(var(--rotation, 0deg));
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1) rotate(calc(var(--rotation, 0deg) + 10deg));
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(var(--rotation, 0deg));
          }
        }

        @keyframes centerBloom {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-180deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes textFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        @keyframes rotateSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes floatGentle {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        .bloom-scroll-section {
          position: relative;
          min-height: 430vh;
          overflow: clip;
          font-family: "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif JP", "Times New Roman", serif;
          color: #1c1916;
          --rail-w: clamp(42px, 4.2vw, 58px);
          opacity: 0;
          animation: siteFadeIn 1.5s ease-out 2s forwards;
        }

        @keyframes siteFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .sticky-visuals {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          z-index: 40;
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
          display: none;
        }

        .bloom-canvas {
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

        .sticky-visuals .paper-card {
          position: absolute;
          z-index: 9;
          width: min(292px, 28vw);
          min-width: 240px;
        }

        .sticky-visuals .card-left {
          left: calc(var(--rail-w) + clamp(0.5rem, 2vw, 2rem));
          top: 25vh;
          transform: rotate(-1.3deg);
        }

        .sticky-visuals .card-right {
          right: clamp(2.25rem, 4vw, 4rem);
          top: 57vh;
          transform: rotate(1deg);
        }

        .sticky-visuals .hero-copy {
          position: absolute;
          right: clamp(3.8rem, 6vw, 7rem);
          top: 23vh;
          z-index: 8;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: clamp(0.7rem, 1.8vw, 1.2rem);
          max-width: 310px;
          pointer-events: none;
        }

        /* スクロール文書層 */
        .scroll-doc {
          position: relative;
          margin-top: -100vh;
          min-height: 430vh;
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
          position: fixed;
          left: 0;
          top: 0;
          width: var(--rail-w);
          height: 100vh;
          background: linear-gradient(180deg, #2e2925 0%, #171513 100%);
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
          overflow: hidden;
        }

        .left-rail-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          color: rgba(248, 244, 236, 0.9);
          font-size: 0.58rem;
          letter-spacing: 0.42em;
          text-transform: uppercase;
          font-weight: 300;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .scroll-inner {
          position: relative;
          z-index: 6;
          margin-left: var(--rail-w);
          margin-right: auto;
          padding: calc(10vh + 1.5rem) clamp(1rem, 4vw, 3rem) 4rem;
          max-width: 1280px;
        }

        .scroll-inner .paper-card {
          width: min(292px, 88vw);
          padding: 1.05rem 1.2rem 0.95rem;
          margin-bottom: 2rem;
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
          padding: 0.42rem 1.2rem;
          border: none;
          border-radius: 3px;
          background: linear-gradient(180deg, #e8c96a 0%, #c9a24a 100%);
          color: #2a2218;
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(90, 70, 30, 0.2);
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
        }

        .btn-like:hover {
          background: linear-gradient(180deg, #f0d074 0%, #d6b355 100%);
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(90, 70, 30, 0.3);
        }

        .btn-like:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(90, 70, 30, 0.15);
        }

        .link-more {
          margin-top: 0.65rem;
          display: inline-block;
          font-size: 0.8rem;
          color: #b03030;
          letter-spacing: 0.06em;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .link-more:hover {
          color: #8a2525;
          text-decoration-color: #8a2525;
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
          display: flex;
          flex-direction: column;
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
          display: flex;
          flex-direction: column;
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

        .closing-section {
          position: relative;
          z-index: 15;
          padding: 4rem 0 2rem;
          margin-left: var(--rail-w);
          margin-right: auto;
          max-width: 1280px;
        }

        .closing-line {
          margin: 0;
          padding: 1.5rem 0;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          line-height: 1.8;
          opacity: 0.78;
          text-align: center;
          border-top: 1px solid rgba(198, 188, 172, 0.45);
          background: rgba(250, 247, 239, 0.8);
          backdrop-filter: blur(8px);
        }

        .site-footer {
          position: relative;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 55;
          margin-top: 0;
          padding: 0;
          background: linear-gradient(180deg, #2a2622 0%, #181614 100%);
          color: rgba(247, 242, 234, 0.9);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .site-footer-inner {
          margin-left: var(--rail-w);
          min-height: 84px;
          padding: 1rem 1rem 1.2rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.85rem;
        }

        .footer-brand {
          margin: 0;
          font-size: 0.98rem;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.92);
        }

        .footer-copy {
          margin: 0;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          opacity: 0.78;
          font-family: ui-sans-serif, system-ui, sans-serif;
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: flex-end;
          gap: 0.95rem;
          flex-wrap: wrap;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.86);
          text-decoration: none;
        }

        /* PC用最適化 (1025px以上) */
        @media (min-width: 1025px) {
          .flower-slot {
            width: 58vw;
            height: 58vw;
            max-width: 900px;
            max-height: 900px;
          }

          .hero-copy {
            right: 2rem;
            top: 18vh;
            max-width: 420px;
          }

          .paper-card {
            max-width: 380px;
            margin: 1.5rem 0;
          }
        }

        /* タブレット用最適化 (769px-1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .flower-slot {
            width: 70vw;
            height: 70vw;
            max-width: 600px;
            max-height: 600px;
          }

          .hero-copy {
            right: 50%;
            top: 12vh;
            transform: translateX(50%);
            max-width: 80vw;
            text-align: center;
            align-items: center;
          }

          .vertical-lead {
            writing-mode: horizontal-tb;
            letter-spacing: 0.12em;
            font-size: clamp(1.1rem, 2.8vw, 1.4rem);
          }

          .english-stack {
            max-width: 100%;
            text-align: center;
          }

          .top-nav {
            font-size: 0.75rem;
            gap: 0.8rem;
          }

          .paper-card {
            max-width: 340px;
            margin: 1.2rem auto;
          }

          .scroll-inner {
            padding-left: 2rem;
            padding-right: 2rem;
          }
        }

        /* スマホ用最適化 (768px以下) */
        @media (max-width: 768px) {
          .flower-slot {
            width: 85vw;
            height: 85vw;
            max-width: 400px;
            max-height: 400px;
          }

          .sticky-visuals .card-left,
          .sticky-visuals .card-right {
            display: none;
          }

          .sticky-visuals .hero-copy {
            right: 50%;
            top: 8vh;
            transform: translateX(50%);
            max-width: 90vw;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .vertical-lead {
            writing-mode: horizontal-tb;
            letter-spacing: 0.1em;
            font-size: clamp(0.9rem, 3.5vw, 1.2rem);
            line-height: 1.6;
          }

          .english-stack {
            max-width: 100%;
            text-align: center;
          }

          .english-line {
            font-size: clamp(0.6rem, 2.8vw, 0.9rem);
          }

          .top-nav {
            display: none;
          }

          .social-rail {
            display: none;
          }

          .brand-title {
            font-size: clamp(1.2rem, 4vw, 1.6rem);
          }

          .brand-sub {
            font-size: clamp(0.6rem, 2.5vw, 0.8rem);
          }

          .paper-card {
            max-width: 100%;
            margin: 1rem 0;
            padding: 1.2rem;
          }

          .paper-title {
            font-size: clamp(0.9rem, 3.5vw, 1.1rem);
          }

          .paper-body {
            font-size: clamp(0.75rem, 3vw, 0.9rem);
            line-height: 1.7;
          }

          .scroll-inner {
            padding: 1rem;
          }

          .band-labels {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
          }

          .pill {
            font-size: 0.65rem;
            padding: 0.3rem 0.7rem;
          }

          .site-footer-inner {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 1rem;
          }

          .footer-copy {
            text-align: center;
            font-size: 0.75rem;
          }

          .footer-links {
            justify-content: center;
            gap: 1rem;
            margin-top: 1rem;
          }

          .footer-links a {
            font-size: 0.8rem;
          }
        }

        /* 小型スマホ用最適化 (480px以下) */
        @media (max-width: 480px) {
          .flower-slot {
            width: 90vw;
            height: 90vw;
            max-width: 320px;
            max-height: 320px;
          }

          .hero-copy {
            top: 6vh;
            max-width: 95vw;
          }

          .vertical-lead {
            font-size: clamp(0.8rem, 4vw, 1rem);
          }

          .brand-title {
            font-size: clamp(1rem, 5vw, 1.4rem);
          }

          .brand-sub {
            font-size: clamp(0.55rem, 3vw, 0.75rem);
          }

          .paper-card {
            margin: 0.8rem 0;
            padding: 1rem;
          }

          .paper-title {
            font-size: clamp(0.8rem, 4vw, 1rem);
          }

          .paper-body {
            font-size: clamp(0.7rem, 3.5vw, 0.85rem);
          }

          .scroll-inner {
            padding: 0.8rem;
          }

          .btn-like,
          .link-more {
            font-size: 0.75rem;
            padding: 0.6rem 1.2rem;
          }
        }
      `}</style>
      </section>
    </>
  );
}
