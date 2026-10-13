import { Router } from 'express';
import { HAB_INFO_LOGO_BASE64, HAB_INFO_LOGO_BUFFER } from '../assets/logoBase64';

export const legalRouter = Router();

// Dedicated image endpoints
legalRouter.get(['/logo.png', '/logo'], (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(HAB_INFO_LOGO_BUFFER);
});

legalRouter.get(['/favicon.ico', '/favicon.png'], (_req, res) => {
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(HAB_INFO_LOGO_BUFFER);
});

const SHARED_HEAD_ASSETS = `
  <link rel="icon" type="image/png" href="${HAB_INFO_LOGO_BASE64}">
  <link rel="apple-touch-icon" href="/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
`;

const SHARED_THEME_SCRIPT = `
  <script>
    (function() {
      const saved = localStorage.getItem('habinfo_theme') || 'light';
      document.documentElement.setAttribute('data-theme', saved);
    })();
    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('habinfo_theme', next);
      updateThemeButtons();
    }
    function updateThemeButtons() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.innerHTML = current === 'dark'
          ? '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
          : '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path></svg>';
        btn.setAttribute('title', current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      });
    }
    document.addEventListener('DOMContentLoaded', updateThemeButtons);
  </script>
`;

const LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hab Info - Information, Delivered Intelligently</title>
  <meta name="description" content="Hab Info is a premium news and digital publishing platform. Real-time push alerts, offline reading, and refined typography.">
  ${SHARED_HEAD_ASSETS}
  <style>
    :root {
      --primary: #0755E8;
      --primary-hover: #063BB8;
      --primary-tint: #E4EEFD;
      --secondary: #168CF5;
      --highlight: #13A8F5;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --surface-subtle: #F1F5F9;
      --surface-glass: rgba(255, 255, 255, 0.88);
      --border: #E2E8F0;
      --border-accent: rgba(7, 85, 232, 0.25);
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-dim: #94A3B8;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
      --shadow-lg: 0 20px 45px -10px rgba(7, 85, 232, 0.12);
      --phone-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.22), 0 0 35px rgba(7, 85, 232, 0.12);
      --phone-inner: #0B1120;
    }
    [data-theme="dark"] {
      --primary: #38BDF8;
      --primary-hover: #0284C7;
      --primary-tint: rgba(56, 189, 248, 0.12);
      --secondary: #4DA8F7;
      --highlight: #3FBBFF;
      --bg: #090D16;
      --surface: #0F172A;
      --surface-subtle: #1E293B;
      --surface-glass: rgba(15, 23, 42, 0.88);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.3);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.6);
      --phone-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2);
      --phone-inner: #0B1120;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Ambient background wash */
    .ambient-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1000px;
      max-width: 100vw;
      height: 500px;
      background: radial-gradient(circle at 50% 20%, rgba(7, 85, 232, 0.1) 0%, rgba(22, 140, 245, 0.03) 50%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    [data-theme="dark"] .ambient-glow {
      background: radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%);
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Navbar */
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-lockup {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }
    .brand-logo-img {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(7, 85, 232, 0.2);
    }
    .brand-name {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
    }
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .nav-link:hover {
      color: var(--primary);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .theme-toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }
    .theme-toggle-btn:hover {
      background: var(--surface-subtle);
      border-color: var(--border-accent);
      transform: translateY(-1px);
    }
    .btn-nav-download {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 9999px;
      background: var(--primary);
      color: #FFF;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 700;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(7, 85, 232, 0.25);
    }
    .btn-nav-download:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    /* Mobile sub-nav bar */
    .mobile-nav-strip {
      display: none;
      width: 100%;
      overflow-x: auto;
      white-space: nowrap;
      gap: 16px;
      padding-top: 10px;
      border-top: 1px solid var(--border);
    }
    .mobile-nav-strip a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 60px 0 40px;
    }
    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: var(--primary-tint);
      border: 1px solid var(--border-accent);
      color: var(--primary);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: 0.04em;
    }
    .pill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
      animation: pulseDot 2s infinite;
    }
    @keyframes pulseDot {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .hero h1 {
      font-size: clamp(2.2rem, 5.5vw, 3.6rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.035em;
      margin-bottom: 18px;
    }
    .hero-gradient {
      background: linear-gradient(135deg, #0755E8 0%, #168CF5 60%, #13A8F5 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    [data-theme="dark"] .hero-gradient {
      background: linear-gradient(135deg, #38BDF8 0%, #60A5FA 60%, #C084FC 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      max-width: 640px;
      margin: 0 auto 32px;
      font-size: clamp(1rem, 2.5vw, 1.15rem);
      color: var(--text-muted);
      line-height: 1.65;
    }
    .hero-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    .btn-play-store {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--text-main);
      color: var(--bg);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: var(--shadow-md);
    }
    .btn-play-store:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--surface);
      color: var(--text-main);
      border: 1px solid var(--border);
      padding: 12px 22px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: var(--shadow-sm);
    }
    .btn-ghost:hover {
      background: var(--surface-subtle);
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }

    /* Device Switcher */
    .device-switcher {
      display: inline-flex;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 9999px;
      margin-bottom: 28px;
      box-shadow: var(--shadow-sm);
    }
    .device-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 9999px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .device-tab.active {
      background: var(--primary);
      color: #FFF;
      box-shadow: 0 2px 8px rgba(7, 85, 232, 0.3);
    }

    /* ── Float animation ── */
    @keyframes floatPhone {
      0%   { transform: translateY(0px); }
      50%  { transform: translateY(-14px); }
      100% { transform: translateY(0px); }
    }
    @keyframes floatPhaseTwo {
      0%   { transform: translateY(-7px); }
      50%  { transform: translateY(7px); }
      100% { transform: translateY(-7px); }
    }
    @keyframes glowBreath {
      0%, 100% { box-shadow: var(--phone-shadow), 0 0 0 0 rgba(7,85,232,0); }
      50%       { box-shadow: var(--phone-shadow), 0 0 40px 8px rgba(7,85,232,0.18); }
    }

    /* ── Dual-phone layout ── */
    .mockup-scene {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 28px;
      margin-bottom: 70px;
      perspective: 1400px;
    }

    /* Scaled-Down Realistic Mobile Phone Mockup */
    .mockup-wrapper {
      max-width: 265px;
      flex: 0 0 auto;
    }
    .mockup-wrapper.phone-dark  { animation: floatPhone     3.8s ease-in-out infinite; }
    .mockup-wrapper.phone-light { animation: floatPhaseTwo  3.8s ease-in-out infinite; }

    .phone-container {
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.4s ease;
      will-change: transform, filter;
    }
    /* Hover: scale up + glow intensifies */
    .phone-container:hover {
      transform: scale(1.06) translateY(-4px) rotateX(2deg) rotateY(-2deg);
      filter: drop-shadow(0 0 24px rgba(7,85,232,0.45));
    }
    .mockup-wrapper.phone-dark .phone-container:hover  { filter: drop-shadow(0 0 28px rgba(7,85,232,0.55)); }
    .mockup-wrapper.phone-light .phone-container:hover { filter: drop-shadow(0 0 28px rgba(7,85,232,0.40)); }

    /* Pause float on hover for snappy feel */
    .mockup-wrapper:hover { animation-play-state: paused; }

    /* iPhone 16 Pro Shell — dark */
    .iphone-shell {
      background: #020617;
      border: 4px solid #334155;
      border-radius: 40px;
      padding: 10px;
      box-shadow: var(--phone-shadow);
      position: relative;
      animation: glowBreath 4s ease-in-out infinite;
    }
    /* Pixel 9 Pro Shell */
    .pixel-shell {
      background: #020617;
      border: 4px solid #475569;
      border-radius: 34px;
      padding: 10px;
      box-shadow: var(--phone-shadow);
      position: relative;
      animation: glowBreath 4s ease-in-out infinite;
    }
    /* Light-theme iPhone shell */
    .iphone-shell-light {
      background: #EFF6FF;
      border: 4px solid #BFDBFE;
      border-radius: 40px;
      padding: 10px;
      box-shadow: 0 25px 50px -12px rgba(15,23,42,0.12), 0 0 35px rgba(7,85,232,0.08);
      position: relative;
    }
    .screen {
      background: var(--phone-inner);
      border-radius: 30px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #F8FAFC;
      text-align: left;
    }
    /* Light-mode screen override */
    .screen-light {
      background: #FFFFFF;
      border-radius: 30px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
      color: #0F172A;
      text-align: left;
    }
    /* Notch / Punch hole */
    .island-wrap {
      display: flex;
      justify-content: center;
      padding: 6px 0 4px;
    }
    .dynamic-island {
      width: 76px;
      height: 18px;
      background: #000;
      border-radius: 16px;
    }
    .pixel-punch {
      width: 12px;
      height: 12px;
      background: #000;
      border-radius: 50%;
      margin: 6px auto 2px;
    }

    /* In-App UI inside mockup */
    .app-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px 6px;
      font-size: 0.65rem;
      color: #94A3B8;
      font-weight: 600;
    }
    .app-top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 14px 10px;
    }
    .app-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .app-logo-img {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      object-fit: contain;
    }
    .app-brand-title {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .app-brand-sub {
      font-size: 0.62rem;
      color: #94A3B8;
    }
    .app-top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .icon-btn {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #CBD5E1;
      position: relative;
    }
    .unread-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 5px;
      height: 5px;
      background: #38BDF8;
      border-radius: 50%;
    }

    /* Category Rail in mockup */
    .app-rail {
      display: flex;
      gap: 6px;
      padding: 2px 14px 12px;
      overflow-x: hidden;
    }
    .app-chip {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.68rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .app-chip.active {
      background: #0755E8;
      color: #FFF;
      box-shadow: 0 2px 6px rgba(7, 85, 232, 0.4);
    }
    .app-chip.inactive {
      background: rgba(255, 255, 255, 0.06);
      color: #94A3B8;
    }

    /* Lead Story Card in mockup */
    .app-lead-card {
      margin: 0 12px 10px;
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
    }
    .app-card-img-placeholder {
      height: 96px;
      background: linear-gradient(135deg, #0755E8 0%, #168CF5 60%, #0369A1 100%);
      position: relative;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge-breaking {
      align-self: flex-start;
      background: rgba(239, 68, 68, 0.9);
      color: #FFF;
      font-size: 0.58rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.04em;
    }
    .app-bookmark-btn {
      align-self: flex-end;
      width: 26px;
      height: 26px;
      border-radius: 13px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #F59E0B;
    }
    .app-card-body {
      padding: 10px 12px;
    }
    .app-card-title {
      font-size: 0.82rem;
      font-weight: 700;
      line-height: 1.35;
      color: #F8FAFC;
      margin-bottom: 6px;
    }
    .app-card-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.64rem;
      color: #94A3B8;
    }

    /* Secondary Compact Story */
    .app-compact-card {
      margin: 0 12px 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 8px 10px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .compact-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: linear-gradient(135deg, #10B981, #059669);
      flex-shrink: 0;
    }
    .compact-content {
      flex: 1;
    }
    .compact-title {
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 3px;
    }
    .compact-meta {
      font-size: 0.6rem;
      color: #64748B;
    }

    /* Bottom Tab Bar */
    .app-tab-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: rgba(15, 23, 42, 0.96);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 8px 6px 14px;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 0.58rem;
      font-weight: 600;
      color: #64748B;
    }
    .tab-item.active {
      color: #38BDF8;
    }
    .tab-item.active svg {
      stroke: #38BDF8;
    }

    /* Features Section */
    .features-section {
      padding: 60px 0;
    }
    .section-head {
      text-align: center;
      max-width: 650px;
      margin: 0 auto 48px;
    }
    .section-head h2 {
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 12px;
    }
    .section-head p {
      color: var(--text-muted);
      font-size: 1.05rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 30px 24px;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s ease;
    }
    .feature-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .feature-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: var(--primary-tint);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      margin-bottom: 18px;
    }
    .feature-card h3 {
      font-size: 1.2rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .feature-card p {
      color: var(--text-muted);
      font-size: 0.94rem;
      line-height: 1.55;
    }

    /* Contact Card Section */
    .contact-card-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 40px;
      margin: 50px 0 70px;
      box-shadow: var(--shadow-md);
    }
    .contact-head h2 {
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .contact-head p {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 28px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .contact-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      flex-shrink: 0;
    }
    .contact-item-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      margin-bottom: 3px;
    }
    .contact-item-value, .contact-item-value a {
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--text-main);
      text-decoration: none;
    }
    .contact-item-value a:hover {
      color: var(--primary);
    }

    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 0;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .footer-nav {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .footer-nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .footer-nav a:hover {
      color: var(--primary);
    }

    /* Strict Mobile Responsiveness */
    @media (max-width: 768px) {
      nav { padding: 16px 0; flex-wrap: wrap; gap: 12px; }
      .nav-menu { display: none; }
      .mobile-nav-strip { display: flex; }
      .hero { padding: 36px 0 28px; }
      .hero-cta { flex-direction: column; width: 100%; max-width: 320px; margin-left: auto; margin-right: auto; }
      .btn-play-store, .btn-ghost { width: 100%; justify-content: center; }
      .contact-card-wrap { padding: 24px 16px; }
      .mockup-scene { flex-direction: column; align-items: center; gap: 20px; margin-bottom: 40px; }
      .mockup-wrapper { max-width: 240px; }
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <div class="container">
    <!-- Navbar -->
    <nav>
      <a href="/" class="brand-lockup">
        <img src="/logo.png" alt="Hab Info" class="brand-logo-img" onerror="this.src='${HAB_INFO_LOGO_BASE64}'">
        <span class="brand-name">Hab Info</span>
      </a>

      <div class="nav-menu">
        <a href="#features" class="nav-link">Features</a>
        <a href="#preview" class="nav-link">App Experience</a>
        <a href="/privacy" class="nav-link">Privacy Policy</a>
        <a href="/terms" class="nav-link">Terms</a>
        <a href="/health" class="nav-link">Service Status</a>
      </div>

      <div class="nav-actions">
        <button class="theme-toggle-btn" onclick="toggleTheme()"></button>
        <a href="https://play.google.com/store/apps/details?id=com.habinfo.app" class="btn-nav-download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.925V2.74a1.5 1.5 0 0 1 .609-.926zm1.484-.716l11.08 6.398-3.473 3.474-7.607-9.872zm11.08 14.394L5.093 21.89l7.607-9.872 3.473 3.474zm1.09-1.09l3.522-2.034a1.5 1.5 0 0 0 0-2.6l-3.522-2.034-3.082 3.334 3.082 3.334z"/>
          </svg>
          Get on Play Store
        </a>
      </div>

      <!-- Quick mobile strip -->
      <div class="mobile-nav-strip">
        <a href="#features">Features</a>
        <a href="#preview">Preview</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/health">Status</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="pill-badge">
        <span class="pill-dot"></span>
        Production Release • Version 20 (1.0.0)
      </div>

      <h1>Curated News, Breaking Alerts,<br><span class="hero-gradient">Elevated Reading.</span></h1>

      <p class="hero-sub">
        Hab Info is an intelligent news and digital publishing platform built for speed and clarity. Enjoy real-time push alerts, offline reading, and refined typography.
      </p>

      <div class="hero-cta">
        <a href="https://play.google.com/store/apps/details?id=com.habinfo.app" class="btn-play-store">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.925V2.74a1.5 1.5 0 0 1 .609-.926zm1.484-.716l11.08 6.398-3.473 3.474-7.607-9.872zm11.08 14.394L5.093 21.89l7.607-9.872 3.473 3.474zm1.09-1.09l3.522-2.034a1.5 1.5 0 0 0 0-2.6l-3.522-2.034-3.082 3.334 3.082 3.334z"/>
          </svg>
          Download for Android
        </a>
        <a href="/privacy" class="btn-ghost">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Privacy Policy
        </a>
      </div>

      <!-- Device Switcher -->
      <div class="device-switcher" id="preview">
        <button class="device-tab active" id="tabApple" onclick="switchDevice('apple')">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.05.62-2.71 1.39-.58.67-1.09 1.76-.95 2.81 1.03.08 2.08-.5 2.72-1.27z"/></svg>
          Apple iPhone
        </button>
        <button class="device-tab" id="tabAndroid" onclick="switchDevice('android')">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9992.4482.9992.9993.0001.5511-.4482.9997-.9992.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.414 13.8533 8.083 12 8.083c-1.8534 0-3.5902.331-5.1368.8667L4.841 5.4467a.416.416 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.7499h24c-.3432-4.091-2.6889-7.5632-6.1185-9.4285"/></svg>
          Google Pixel
        </button>
      </div>

      <!-- Dual-Phone Mockup Scene -->
      <div class="mockup-scene">

        <!-- ① Dark-theme phone (primary, existing dark app UI) -->
        <div class="mockup-wrapper phone-dark">
          <div class="phone-container" id="phoneContainer">
            <div class="iphone-shell" id="phoneShell">
              <div class="screen">
                <div class="island-wrap" id="deviceNotch">
                  <div class="dynamic-island"></div>
                </div>
                <div class="app-status-bar">
                  <span>9:41</span>
                  <span>5G · 100%</span>
                </div>
                <div class="app-top-nav">
                  <div class="app-brand">
                    <img src="/logo.png" alt="Hab Info" class="app-logo-img" onerror="this.src='${HAB_INFO_LOGO_BASE64}'">
                    <div>
                      <div class="app-brand-title">Hab Info</div>
                      <div class="app-brand-sub">Good morning • Oct 13</div>
                    </div>
                  </div>
                  <div class="app-top-actions">
                    <div class="icon-btn">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                    </div>
                    <div class="icon-btn">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                      <div class="unread-dot"></div>
                    </div>
                  </div>
                </div>
                <div class="app-rail">
                  <span class="app-chip active">All Stories</span>
                  <span class="app-chip inactive">Technology</span>
                  <span class="app-chip inactive">Business</span>
                  <span class="app-chip inactive">Culture</span>
                </div>
                <div class="app-lead-card">
                  <div class="app-card-img-placeholder">
                    <span class="badge-breaking">BREAKING</span>
                    <div class="app-bookmark-btn">
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                  </div>
                  <div class="app-card-body">
                    <div class="app-card-title">Next-Generation Editorial Intelligence Transforms Digital Publishing</div>
                    <div class="app-card-meta"><span>Editorial Desk</span><span>4 min read</span></div>
                  </div>
                </div>
                <div class="app-compact-card">
                  <div class="compact-thumb"></div>
                  <div class="compact-content">
                    <div class="compact-title">Sustainable Infrastructure Breakthroughs in East Africa</div>
                    <div class="compact-meta">Tech • 12m ago</div>
                  </div>
                </div>
                <div class="app-tab-bar">
                  <div class="tab-item active">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span>Feed</span>
                  </div>
                  <div class="tab-item">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                    <span>Search</span>
                  </div>
                  <div class="tab-item">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    <span>Bookmarks</span>
                  </div>
                  <div class="tab-item">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ② Light-theme phone (secondary, offset lower) -->
        <div class="mockup-wrapper phone-light" style="margin-bottom: -30px;">
          <div class="phone-container">
            <div class="iphone-shell-light">
              <div class="screen-light">
                <!-- Notch -->
                <div class="island-wrap">
                  <div style="width:72px;height:17px;background:#1E293B;border-radius:14px;"></div>
                </div>
                <!-- Status bar light -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 6px;font-size:0.65rem;color:#475569;font-weight:600;">
                  <span>9:41</span><span>5G · 100%</span>
                </div>
                <!-- App nav light -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 14px 10px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <img src="/logo.png" alt="Hab Info" style="width:26px;height:26px;border-radius:6px;object-fit:contain;" onerror="this.src='${HAB_INFO_LOGO_BASE64}'">
                    <div>
                      <div style="font-size:0.95rem;font-weight:800;letter-spacing:-0.02em;color:#0F172A;">Hab Info</div>
                      <div style="font-size:0.62rem;color:#64748B;">Good evening • Oct 13</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;">
                    <div style="width:28px;height:28px;border-radius:14px;background:#F1F5F9;display:flex;align-items:center;justify-content:center;color:#475569;">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                    </div>
                    <div style="width:28px;height:28px;border-radius:14px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;color:#0755E8;position:relative;">
                      <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                      <div style="position:absolute;top:5px;right:5px;width:5px;height:5px;background:#0755E8;border-radius:50%;"></div>
                    </div>
                  </div>
                </div>
                <!-- Category rail light -->
                <div style="display:flex;gap:6px;padding:2px 14px 12px;overflow-x:hidden;">
                  <span style="padding:4px 10px;border-radius:9999px;font-size:0.68rem;font-weight:700;background:#0755E8;color:#FFF;box-shadow:0 2px 6px rgba(7,85,232,0.3);">All Stories</span>
                  <span style="padding:4px 10px;border-radius:9999px;font-size:0.68rem;font-weight:700;background:#F1F5F9;color:#64748B;">Technology</span>
                  <span style="padding:4px 10px;border-radius:9999px;font-size:0.68rem;font-weight:700;background:#F1F5F9;color:#64748B;">Business</span>
                </div>
                <!-- Lead story light -->
                <div style="margin:0 12px 10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
                  <div style="height:88px;background:linear-gradient(135deg,#0755E8 0%,#168CF5 60%,#0369A1 100%);position:relative;padding:10px;display:flex;flex-direction:column;justify-content:space-between;">
                    <span style="align-self:flex-start;background:rgba(239,68,68,0.9);color:#FFF;font-size:0.58rem;font-weight:800;padding:2px 6px;border-radius:4px;letter-spacing:0.04em;">BREAKING</span>
                    <div style="align-self:flex-end;width:24px;height:24px;border-radius:12px;background:rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;color:#F59E0B;">
                      <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                  </div>
                  <div style="padding:10px 12px;">
                    <div style="font-size:0.82rem;font-weight:700;line-height:1.35;color:#0F172A;margin-bottom:6px;">AI Revolutionizes Newsroom Workflows Across Major Outlets</div>
                    <div style="display:flex;justify-content:space-between;font-size:0.64rem;color:#64748B;"><span>World Desk</span><span>3 min read</span></div>
                  </div>
                </div>
                <!-- Compact story light -->
                <div style="margin:0 12px 12px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;padding:8px 10px;display:flex;gap:10px;align-items:center;">
                  <div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#F59E0B,#D97706);flex-shrink:0;"></div>
                  <div style="flex:1;">
                    <div style="font-size:0.78rem;font-weight:700;color:#0F172A;line-height:1.3;margin-bottom:4px;">Ethiopian Startups Lead African Innovation Wave</div>
                    <div style="font-size:0.64rem;color:#64748B;">Business • 28m ago</div>
                  </div>
                </div>
                <!-- Tab bar light -->
                <div style="display:flex;justify-content:space-around;align-items:center;padding:10px 0 14px;border-top:1px solid #E2E8F0;background:#FFFFFF;">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;color:#0755E8;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    <span style="font-size:0.6rem;font-weight:700;">Feed</span>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;color:#94A3B8;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                    <span style="font-size:0.6rem;font-weight:700;">Search</span>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;color:#94A3B8;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                    <span style="font-size:0.6rem;font-weight:700;">Saved</span>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;color:#94A3B8;">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path></svg>
                    <span style="font-size:0.6rem;font-weight:700;">Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /mockup-scene -->
    </section>

    <!-- Core Pillars / Features -->
    <section id="features" class="features-section">
      <div class="section-head">
        <h2>Engineering Principles &amp; Features</h2>
        <p>Built with native performance and respectful data design for modern readers who value quality over clutter.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <h3>Real-Time Push Alerts</h3>
          <p>Instant OS-level push notifications dispatch breaking stories directly to your device with minimal battery usage.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3>Offline Bookmarks</h3>
          <p>Save comprehensive investigations and stories locally to read without network interruptions during transit.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <h3>Curated Feed Channels</h3>
          <p>Explore distinct verticals across Global News, Technology, Business, and Culture without algorithm spam.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3>Privacy-First Architecture</h3>
          <p>Zero data selling, minimal telemetry, transparent Firestore security rules, and user-controlled data choices.</p>
        </div>
      </div>
    </section>

    <!-- Developer & Store Contact Section -->
    <section class="contact-card-wrap" id="contact">
      <div class="contact-head">
        <h2>Developer &amp; Store Contact Details</h2>
        <p>Official publisher contacts and transparency details as verified for Google Play Console distribution.</p>
      </div>

      <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="contact-item-label">Developer / Publisher</div>
            <div class="contact-item-value">Ibrahim Jenberu (Hab Info)</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div>
            <div class="contact-item-label">Support Email</div>
            <div class="contact-item-value"><a href="mailto:ebrahimjenberu@gmail.com">ebrahimjenberu@gmail.com</a></div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <div>
            <div class="contact-item-label">Developer Phone</div>
            <div class="contact-item-value"><a href="tel:+251917577381">+251 917 577 381</a> (0917577381)</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div>
            <div class="contact-item-label">Official Website</div>
            <div class="contact-item-value"><a href="https://habinfo-notification-server.onrender.com">habinfo-notification-server.onrender.com</a></div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div>
            <div class="contact-item-label">Headquarters / Location</div>
            <div class="contact-item-value">Addis Ababa, Ethiopia</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <div class="contact-item-label">Privacy Policy Verification</div>
            <div class="contact-item-value"><a href="/privacy">/privacy (Active SSL)</a></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-nav">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/health">Service Status</a>
        <a href="#contact">Contact Support</a>
      </div>
      <p>&copy; 2026 Hab Info. All rights reserved. Developed by Ibrahim Jenberu.</p>
    </footer>
  </div>

  ${SHARED_THEME_SCRIPT}
  <script>
    function switchDevice(type) {
      const shell = document.getElementById('phoneShell');
      const notch = document.getElementById('deviceNotch');
      const tabApple = document.getElementById('tabApple');
      const tabAndroid = document.getElementById('tabAndroid');

      if (type === 'apple') {
        shell.className = 'iphone-shell';
        notch.innerHTML = '<div class="dynamic-island"></div>';
        tabApple.classList.add('active');
        tabAndroid.classList.remove('active');
      } else {
        shell.className = 'pixel-shell';
        notch.innerHTML = '<div class="pixel-punch"></div>';
        tabAndroid.classList.add('active');
        tabApple.classList.remove('active');
      }
    }
  </script>
</body>
</html>
`;

const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Hab Info</title>
  <meta name="description" content="Privacy Policy for Hab Info mobile application. Details on data handling, permissions, and security.">
  ${SHARED_HEAD_ASSETS}
  <style>
    :root {
      --primary: #0755E8;
      --primary-hover: #063BB8;
      --primary-tint: #E4EEFD;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --surface-subtle: #F1F5F9;
      --border: #E2E8F0;
      --border-accent: rgba(7, 85, 232, 0.25);
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-dim: #94A3B8;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
    }
    [data-theme="dark"] {
      --primary: #38BDF8;
      --primary-hover: #0284C7;
      --primary-tint: rgba(56, 189, 248, 0.12);
      --bg: #090D16;
      --surface: #0F172A;
      --surface-subtle: #1E293B;
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.3);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.7;
      padding: 32px 16px;
      transition: background-color 0.3s, color 0.3s;
    }
    .wrapper { max-width: 860px; margin: 0 auto; }
    nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text-main); }
    .brand-logo-img { width: 38px; height: 38px; border-radius: 10px; object-fit: contain; box-shadow: 0 2px 8px rgba(7, 85, 232, 0.2); }
    .brand-title { font-size: 1.25rem; font-weight: 800; }
    .theme-toggle-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .doc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-md); }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-tint); color: var(--primary); font-size: 0.8rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px; }
    .meta-bar { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 20px; }
    h2 { font-size: 1.35rem; font-weight: 700; margin-top: 36px; margin-bottom: 12px; border-left: 4px solid var(--primary); padding-left: 14px; }
    h3 { font-size: 1.05rem; font-weight: 700; margin-top: 20px; margin-bottom: 8px; }
    p { color: var(--text-muted); margin-bottom: 16px; font-size: 1rem; }
    ul { margin-left: 24px; margin-bottom: 18px; color: var(--text-muted); }
    li { margin-bottom: 8px; }
    li strong { color: var(--text-main); }
    a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
    .contact-box { background: var(--surface-subtle); border-radius: 16px; padding: 24px; margin-top: 32px; border: 1px solid var(--border); }
    .contact-box p { margin-bottom: 6px; }
    .footer { margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px; text-align: center; color: var(--text-dim); font-size: 0.9rem; }
    @media (max-width: 640px) { .doc-card { padding: 24px 16px; } h1 { font-size: 1.7rem; } }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav>
      <a href="/" class="brand">
        <img src="/logo.png" alt="Hab Info" class="brand-logo-img" onerror="this.src='${HAB_INFO_LOGO_BASE64}'">
        <div class="brand-title">Hab Info</div>
      </a>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="theme-toggle-btn" onclick="toggleTheme()"></button>
        <a href="/" style="text-decoration: none; font-size: 0.9rem; font-weight: 700; color: var(--primary);">← Back to App</a>
      </div>
    </nav>

    <div class="doc-card">
      <span class="badge">Google Play Developer Policy Compliant</span>
      <h1>Privacy Policy for Hab Info</h1>
      <div class="meta-bar">
        <strong>Effective Date:</strong> October 13, 2026 &nbsp;|&nbsp; <strong>Application:</strong> Hab Info (Android &amp; iOS)
      </div>

      <h2>1. Overview &amp; Scope</h2>
      <p>
        <strong>Hab Info</strong> ("we", "us", or "our"), published by <strong>Ibrahim Jenberu</strong>, is committed to safeguarding user privacy. This policy transparently explains our data practices in full compliance with the Google Play Developer Program Policies.
      </p>

      <h2>2. Data Collection &amp; Purpose</h2>
      <h3>A. Device &amp; Technical Identifiers</h3>
      <ul>
        <li><strong>Installation Identifier:</strong> An anonymous device installation UUID used to maintain your offline bookmarks and preferences.</li>
        <li><strong>Device Specifications:</strong> Device model, OS version, and app version to provide bug fixes, crash stability, and appropriate UI scaling.</li>
      </ul>

      <h3>B. Push Notification Data</h3>
      <ul>
        <li><strong>Expo / Firebase Cloud Messaging (FCM) Tokens:</strong> Generated when you grant notification permissions. Allows our server to dispatch requested breaking news headlines. You can disable notifications at any time in system settings.</li>
      </ul>

      <h3>C. Advertising &amp; Diagnostic Identifiers</h3>
      <ul>
        <li><strong>Google AdMob:</strong> We use Google Mobile Ads to deliver relevant ads that fund free editorial content. AdMob processes Android Advertising IDs (AAID) in accordance with Google Play policies.</li>
        <li><strong>Sentry / Firebase Crashlytics:</strong> Anonymous crash diagnostics to detect and repair bugs.</li>
      </ul>

      <h2>3. Third-Party Service Providers</h2>
      <p>We work exclusively with industry-standard cloud providers:</p>
      <ul>
        <li><strong>Google Firebase &amp; AdMob (Google LLC):</strong> Cloud Firestore database, push infrastructure, and advertising services. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a></li>
        <li><strong>Expo Application Services (650 Industries):</strong> Push notification delivery. <a href="https://expo.dev/privacy" target="_blank" rel="noopener">Expo Privacy Policy</a></li>
        <li><strong>Sentry (Functional Software, Inc.):</strong> Error and crash logging. <a href="https://sentry.io/privacy" target="_blank" rel="noopener">Sentry Privacy Policy</a></li>
      </ul>

      <h2>4. Data Sharing &amp; Sale Declaration</h2>
      <p><strong>We do NOT sell, rent, or trade your personal data to third parties.</strong> All data is strictly processed to provide the application features.</p>

      <h2>5. User Rights &amp; Permanent Data Deletion</h2>
      <p>Users have complete sovereignty over their data:</p>
      <ul>
        <li><strong>Delete Bookmarks &amp; Cache:</strong> Clear your in-app bookmarks or app storage in Android settings at any time.</li>
        <li><strong>Opt-Out of Push Notifications:</strong> Toggle notifications off in device settings or in-app preferences.</li>
        <li><strong>Full Account / Data Deletion Request:</strong> Email us at <a href="mailto:ebrahimjenberu@gmail.com">ebrahimjenberu@gmail.com</a> with the subject line <em>"Data Deletion Request"</em>. Requests are fulfilled within 30 days.</li>
      </ul>

      <h2>6. Children's Privacy</h2>
      <p>Hab Info is not directed to children under 13 years of age. We do not knowingly collect personal data from children under 13.</p>

      <h2>7. Developer &amp; Store Contact Information</h2>
      <div class="contact-box">
        <p><strong>Application:</strong> Hab Info</p>
        <p><strong>Developer:</strong> Ibrahim Jenberu</p>
        <p><strong>Support Email:</strong> <a href="mailto:ebrahimjenberu@gmail.com">ebrahimjenberu@gmail.com</a></p>
        <p><strong>Developer Phone:</strong> <a href="tel:+251917577381">+251 917 577 381</a> (0917577381)</p>
        <p><strong>Headquarters:</strong> Addis Ababa, Ethiopia</p>
        <p><strong>Website:</strong> <a href="https://habinfo-notification-server.onrender.com">https://habinfo-notification-server.onrender.com</a></p>
      </div>

      <div class="footer">
        <p>&copy; 2026 Hab Info. All rights reserved. &nbsp;|&nbsp; <a href="/terms">Terms of Service</a> &nbsp;|&nbsp; <a href="/health">Service Status</a></p>
      </div>
    </div>
  </div>
  ${SHARED_THEME_SCRIPT}
</body>
</html>
`;

const TERMS_OF_SERVICE_HTML = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - Hab Info</title>
  ${SHARED_HEAD_ASSETS}
  <style>
    :root {
      --primary: #0755E8;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --surface-subtle: #F1F5F9;
      --border: #E2E8F0;
      --text-main: #0F172A;
      --text-muted: #475569;
      --shadow-md: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
    }
    [data-theme="dark"] {
      --primary: #38BDF8;
      --bg: #090D16;
      --surface: #0F172A;
      --surface-subtle: #1E293B;
      --border: rgba(255, 255, 255, 0.08);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text-main);
      line-height: 1.7;
      padding: 32px 16px;
      transition: background 0.3s, color 0.3s;
    }
    .wrapper { max-width: 860px; margin: 0 auto; }
    nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text-main); }
    .brand-logo-img { width: 38px; height: 38px; border-radius: 10px; object-fit: contain; box-shadow: 0 2px 8px rgba(7, 85, 232, 0.2); }
    .theme-toggle-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .doc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-md); }
    h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; }
    h2 { font-size: 1.35rem; font-weight: 700; margin-top: 32px; margin-bottom: 12px; border-left: 4px solid var(--primary); padding-left: 12px; }
    p { color: var(--text-muted); margin-bottom: 16px; font-size: 1rem; }
    a { color: var(--primary); }
    .contact-box { background: var(--surface-subtle); border-radius: 16px; padding: 24px; margin-top: 32px; border: 1px solid var(--border); }
    .contact-box p { margin-bottom: 6px; }
    .footer { margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px; text-align: center; color: var(--text-muted); }
    @media (max-width: 640px) { .doc-card { padding: 24px 16px; } h1 { font-size: 1.7rem; } }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav>
      <a href="/" class="brand">
        <img src="/logo.png" alt="Hab Info" class="brand-logo-img" onerror="this.src='${HAB_INFO_LOGO_BASE64}'">
        <div style="font-size: 1.25rem; font-weight: 800;">Hab Info</div>
      </a>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="theme-toggle-btn" onclick="toggleTheme()"></button>
        <a href="/" style="text-decoration: none; font-size: 0.9rem; font-weight: 700; color: var(--primary);">← Back to App</a>
      </div>
    </nav>
    <div class="doc-card">
      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> October 13, 2026 &nbsp;|&nbsp; <strong>Application:</strong> Hab Info</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By downloading, browsing, or using the Hab Info mobile application or its associated web services, you agree to these Terms of Service.</p>
      <h2>2. Permitted Use</h2>
      <p>Hab Info provides curated news and articles for personal, non-commercial reading. Content is protected by applicable copyright and intellectual property laws.</p>
      <h2>3. Disclaimers</h2>
      <p>Hab Info is provided on an "as-is" basis. We strive for high availability and accurate reporting but make no warranties regarding uninterrupted access.</p>
      <h2>4. Developer Contact</h2>
      <div class="contact-box">
        <p><strong>Developer:</strong> Ibrahim Jenberu (Hab Info)</p>
        <p><strong>Support Email:</strong> <a href="mailto:ebrahimjenberu@gmail.com">ebrahimjenberu@gmail.com</a></p>
        <p><strong>Phone:</strong> <a href="tel:+251917577381">+251 917 577 381</a> (0917577381)</p>
        <p><strong>Location:</strong> Addis Ababa, Ethiopia</p>
      </div>
      <div class="footer">
        <p>&copy; 2026 Hab Info. All rights reserved. &nbsp;|&nbsp; <a href="/privacy">Privacy Policy</a> &nbsp;|&nbsp; <a href="/health">Service Status</a></p>
      </div>
    </div>
  </div>
  ${SHARED_THEME_SCRIPT}
</body>
</html>
`;

// GET /privacy and /privacy-policy
legalRouter.get(['/privacy', '/privacy-policy', '/legal/privacy'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(PRIVACY_POLICY_HTML);
});

// GET /terms and /terms-of-service
legalRouter.get(['/terms', '/terms-of-service', '/legal/terms'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(TERMS_OF_SERVICE_HTML);
});

// GET / root landing page
legalRouter.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(LANDING_PAGE_HTML);
});
