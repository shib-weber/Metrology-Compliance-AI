import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Box, ArrowRight, Activity, Cpu } from 'lucide-react';

const HERO_VIDEO_URL = '/hero.mp4'; // Replace or fallback smoothly

export default function Hero() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play?.catch) play.catch(() => {});
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setReady(true);
    }
  }, []);

  return (
    <section className="hero" id="overview">
      {/* Background Video Media Scrim */}
      <div className="hero__media" aria-hidden="true">
        <video
          ref={videoRef}
          className={`hero__video ${ready ? 'is-ready' : ''}`}
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
        />
        <div className="hero__scrim" />
      </div>

      {/* Main Center Content */}
      <div className="hero__body shell">

        <h1 className="hero__title">
          Automated Statutory Compliance &{' '}
          <span className="hero__title-accent">3D Digital Twins</span>
        </h1>

        <p className="hero__description">
          Enforce Legal Metrology (Packaged Commodities) Rules, 2011 with real-time AI label scanning, automated PDF evidence issuance, and client-side WebGL twins.
        </p>

        <div className="hero__cta-group">
          <Link to="/login" className="btn btn--primary">
            Launch Platform <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#rules" className="btn btn--glass">
            Explore Compliance Engine
          </a>
        </div>
      </div>

      {/* Glass Feature Cards */}
      <div className="hero__cards shell" id="rules">
        <article className="card--glass space-y-2.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Rules 2011 Audit Engine</h3>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
            Automated verification of MRP, Net Quantity, Unit Sale Price (USP), and Rule 7 mandatory font proportions.
          </p>
        </article>

        <article className="card--glass space-y-2.5" id="twins">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
            <Box className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Client-Side 3D Digital Twin</h3>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
            0% GPU server load. Projects captured physical packaging panels directly into interactive WebGL meshes.
          </p>
        </article>

        <article className="card--glass space-y-2.5" id="health">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-white text-base">Citizen Health Transparency</h3>
          <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed">
            Instant hazard scoring on processing penalties, ultra-refined sugar, sodium thresholds, and harmful additives.
          </p>
        </article>
      </div>
    </section>
  );
}