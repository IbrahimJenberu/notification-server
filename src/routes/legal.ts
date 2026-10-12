import { Router } from 'express';

export const legalRouter = Router();

const SHARED_HEAD_ASSETS = `
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230755E8'/%3E%3Cstop offset='100%25' stop-color='%23168CF5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='24' fill='url(%23g)'/%3E%3Cpath d='M28 24h13v52H28zM59 24h13v52H59zM41 45h18v11H41z' fill='%23FFF'/%3E%3C/svg%3E">
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
      --surface-glass: rgba(255, 255, 255, 0.85);
      --border: #E2E8F0;
      --border-accent: rgba(7, 85, 232, 0.25);
      --text-main: #0F172A;
      --text-muted: #475569;
      --text-dim: #94A3B8;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 10px 25px -5px rgba(15, 23, 42, 0.06);
      --shadow-lg: 0 20px 45px -10px rgba(7, 85, 232, 0.12);
      --phone-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 40px rgba(7, 85, 232, 0.15);
      --phone-bezel: #1E293B;
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
      --surface-glass: rgba(15, 23, 42, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.3);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow-md: 0 10px 30px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 25px 50px rgba(0, 0, 0, 0.6);
      --phone-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(56, 189, 248, 0.2);
      --phone-bezel: #1E293B;
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

    /* Ambient decorative lighting */
    .ambient-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1100px;
      height: 550px;
      background: radial-gradient(circle at 50% 20%, rgba(7, 85, 232, 0.12) 0%, rgba(22, 140, 245, 0.04) 50%, transparent 75%);
      pointer-events: none;
      z-index: 0;
    }
    [data-theme="dark"] .ambient-glow {
      background: radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.14) 0%, rgba(99, 102, 241, 0.06) 50%, transparent 75%);
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 1200px;
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
    }
    .brand-lockup {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }
    .brand-mark {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0755E8 0%, #168CF5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(7, 85, 232, 0.3);
      color: #FFF;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.5px;
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
      gap: 32px;
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
      width: 42px;
      height: 42px;
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
      padding: 10px 20px;
      border-radius: 9999px;
      background: var(--primary);
      color: #FFF;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 700;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(7, 85, 232, 0.25);
    }
    .btn-nav-download:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    /* Hero */
    .hero {
      text-align: center;
      padding: 70px 0 50px;
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
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 24px;
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
      font-size: 3.8rem;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.035em;
      margin-bottom: 20px;
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
      max-width: 680px;
      margin: 0 auto 36px;
      font-size: 1.2rem;
      color: var(--text-muted);
      line-height: 1.65;
    }
    .hero-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    .btn-play-store {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: var(--text-main);
      color: var(--bg);
      padding: 14px 28px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 1rem;
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
      padding: 14px 26px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.25s;
      box-shadow: var(--shadow-sm);
    }
    .btn-ghost:hover {
      background: var(--surface-subtle);
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }

    /* Device Switcher & Mockups */
    .device-switcher {
      display: inline-flex;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 9999px;
      margin-bottom: 36px;
      box-shadow: var(--shadow-sm);
    }
    .device-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 9999px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .device-tab.active {
      background: var(--primary);
      color: #FFF;
      box-shadow: 0 2px 10px rgba(7, 85, 232, 0.3);
    }

    .mockup-wrapper {
      max-width: 420px;
      margin: 0 auto 90px;
      perspective: 1200px;
    }
    .phone-container {
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;
    }
    .phone-container:hover {
      transform: translateY(-8px) rotateX(2deg) rotateY(-2deg);
    }

    /* Phone Shell */
    .iphone-shell {
      background: #020617;
      border: 5px solid #334155;
      border-radius: 48px;
      padding: 14px;
      box-shadow: var(--phone-shadow);
      position: relative;
    }
    .pixel-shell {
      background: #020617;
      border: 5px solid #475569;
      border-radius: 40px;
      padding: 14px;
      box-shadow: var(--phone-shadow);
      position: relative;
    }
    .screen {
      background: var(--phone-inner);
      border-radius: 36px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #F8FAFC;
      text-align: left;
    }
    /* Dynamic Island / Punch Hole */
    .island-wrap {
      display: flex;
      justify-content: center;
      padding: 10px 0 6px;
    }
    .dynamic-island {
      width: 90px;
      height: 22px;
      background: #000;
      border-radius: 20px;
    }
    .pixel-punch {
      width: 14px;
      height: 14px;
      background: #000;
      border-radius: 50%;
      margin: 8px auto 4px;
    }

    /* App UI inside phone */
    .app-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 20px 8px;
      font-size: 0.72rem;
      color: #94A3B8;
      font-weight: 600;
    }
    .app-top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 18px 12px;
    }
    .app-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .app-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0755E8, #168CF5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #FFF;
    }
    .app-brand-title {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .app-brand-sub {
      font-size: 0.68rem;
      color: #94A3B8;
    }
    .app-top-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #CBD5E1;
      position: relative;
    }
    .unread-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 6px;
      height: 6px;
      background: #38BDF8;
      border-radius: 50%;
    }

    /* Category Rail inside phone */
    .app-rail {
      display: flex;
      gap: 8px;
      padding: 4px 18px 16px;
      overflow-x: hidden;
    }
    .app-chip {
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }
    .app-chip.active {
      background: #0755E8;
      color: #FFF;
      box-shadow: 0 2px 8px rgba(7, 85, 232, 0.5);
    }
    .app-chip.inactive {
      background: rgba(255, 255, 255, 0.06);
      color: #94A3B8;
    }

    /* Lead Story Card inside phone */
    .app-lead-card {
      margin: 0 16px 14px;
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
    }
    .app-card-img-placeholder {
      height: 120px;
      background: linear-gradient(135deg, #0755E8 0%, #168CF5 50%, #0369A1 100%);
      position: relative;
      padding: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge-breaking {
      align-self: flex-start;
      background: rgba(239, 68, 68, 0.9);
      color: #FFF;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.05em;
    }
    .app-bookmark-btn {
      align-self: flex-end;
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #F59E0B;
    }
    .app-card-body {
      padding: 14px 16px;
    }
    .app-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.35;
      color: #F8FAFC;
      margin-bottom: 8px;
    }
    .app-card-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #94A3B8;
    }

    /* Secondary Compact Story */
    .app-compact-card {
      margin: 0 16px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 12px;
      display: flex;
      gap: 12px;
    }
    .compact-thumb {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10B981, #059669);
      flex-shrink: 0;
    }
    .compact-content {
      flex: 1;
    }
    .compact-title {
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 4px;
    }
    .compact-meta {
      font-size: 0.68rem;
      color: #64748B;
    }

    /* Bottom Tab Bar matching PremiumTabBar */
    .app-tab-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: rgba(15, 23, 42, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 10px 18px;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
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
      padding: 70px 0;
    }
    .section-head {
      text-align: center;
      max-width: 650px;
      margin: 0 auto 56px;
    }
    .section-head h2 {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 14px;
    }
    .section-head p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
      gap: 24px;
    }
    .feature-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 36px 28px;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s ease;
    }
    .feature-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .feature-icon-box {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--primary-tint);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      margin-bottom: 22px;
    }
    .feature-card h3 {
      font-size: 1.3rem;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }
    .feature-card p {
      color: var(--text-muted);
      font-size: 0.98rem;
      line-height: 1.6;
    }

    /* Contact & Store Listing Section */
    .contact-card-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 48px;
      margin: 60px 0 80px;
      box-shadow: var(--shadow-md);
    }
    .contact-head h2 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .contact-head p {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-bottom: 32px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 28px;
    }
    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .contact-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      flex-shrink: 0;
    }
    .contact-item-label {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      margin-bottom: 4px;
    }
    .contact-item-value, .contact-item-value a {
      font-size: 1.02rem;
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
      padding: 48px 0;
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .footer-nav {
      display: flex;
      justify-content: center;
      gap: 28px;
      margin-bottom: 20px;
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

    @media (max-width: 768px) {
      .hero h1 { font-size: 2.6rem; }
      .nav-menu { display: none; }
      .contact-card-wrap { padding: 32px 20px; }
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>

  <div class="container">
    <!-- Navbar -->
    <nav>
      <a href="/" class="brand-lockup">
        <div class="brand-mark">H</div>
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.925V2.74a1.5 1.5 0 0 1 .609-.926zm1.484-.716l11.08 6.398-3.473 3.474-7.607-9.872zm11.08 14.394L5.093 21.89l7.607-9.872 3.473 3.474zm1.09-1.09l3.522-2.034a1.5 1.5 0 0 0 0-2.6l-3.522-2.034-3.082 3.334 3.082 3.334z"/>
          </svg>
          Get on Play Store
        </a>
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.925V2.74a1.5 1.5 0 0 1 .609-.926zm1.484-.716l11.08 6.398-3.473 3.474-7.607-9.872zm11.08 14.394L5.093 21.89l7.607-9.872 3.473 3.474zm1.09-1.09l3.522-2.034a1.5 1.5 0 0 0 0-2.6l-3.522-2.034-3.082 3.334 3.082 3.334z"/>
          </svg>
          Download for Android
        </a>
        <a href="/privacy" class="btn-ghost">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Privacy Policy
        </a>
      </div>

      <!-- Device Mockup Selector -->
      <div class="device-switcher" id="preview">
        <button class="device-tab active" id="tabApple" onclick="switchDevice('apple')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-.93.04-2.05.62-2.71 1.39-.58.67-1.09 1.76-.95 2.81 1.03.08 2.08-.5 2.72-1.27z"/></svg>
          Apple iOS
        </button>
        <button class="device-tab" id="tabAndroid" onclick="switchDevice('android')">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9992.4482.9992.9993.0001.5511-.4482.9997-.9992.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.414 13.8533 8.083 12 8.083c-1.8534 0-3.5902.331-5.1368.8667L4.841 5.4467a.416.416 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.7499h24c-.3432-4.091-2.6889-7.5632-6.1185-9.4285"/></svg>
          Google Android
        </button>
      </div>

      <!-- Interactive Phone Mockup -->
      <div class="mockup-wrapper">
        <div class="phone-container" id="phoneContainer">
          <div class="iphone-shell" id="phoneShell">
            <div class="screen">
              <!-- Notch Area -->
              <div class="island-wrap" id="deviceNotch">
                <div class="dynamic-island"></div>
              </div>

              <!-- Status Bar -->
              <div class="app-status-bar">
                <span>9:41</span>
                <span>5G · 100%</span>
              </div>

              <!-- Top Nav inside app -->
              <div class="app-top-nav">
                <div class="app-brand">
                  <div class="app-logo">H</div>
                  <div>
                    <div class="app-brand-title">Hab Info</div>
                    <div class="app-brand-sub">Good morning • Oct 12</div>
                  </div>
                </div>
                <div class="app-top-actions">
                  <div class="icon-btn">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                  </div>
                  <div class="icon-btn">
                    <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    <div class="unread-dot"></div>
                  </div>
                </div>
              </div>

              <!-- Category Rail inside app -->
              <div class="app-rail">
                <span class="app-chip active">All Stories</span>
                <span class="app-chip inactive">Technology</span>
                <span class="app-chip inactive">Business</span>
                <span class="app-chip inactive">Culture</span>
                <span class="app-chip inactive">Science</span>
              </div>

              <!-- Lead Story Card -->
              <div class="app-lead-card">
                <div class="app-card-img-placeholder">
                  <span class="badge-breaking">BREAKING</span>
                  <div class="app-bookmark-btn">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                </div>
                <div class="app-card-body">
                  <div class="app-card-title">Next-Generation Editorial Intelligence Transforms Digital Publishing</div>
                  <div class="app-card-meta">
                    <span>Editorial Desk</span>
                    <span>4 min read</span>
                  </div>
                </div>
              </div>

              <!-- Secondary Compact Story -->
              <div class="app-compact-card">
                <div class="compact-thumb"></div>
                <div class="compact-content">
                  <div class="compact-title">Sustainable Infrastructure Breakthroughs in East Africa</div>
                  <div class="compact-meta">Technology • 12m ago</div>
                </div>
              </div>

              <!-- Tab Bar matching PremiumTabBar -->
              <div class="app-tab-bar">
                <div class="tab-item active">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>Feed</span>
                </div>
                <div class="tab-item">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
                  <span>Search</span>
                </div>
                <div class="tab-item">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  <span>Bookmarks</span>
                </div>
                <div class="tab-item">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Pillars / Features Section -->
    <section id="features" class="features-section">
      <div class="section-head">
        <h2>Engineering Principles &amp; Features</h2>
        <p>Built with native performance and respectful data design for modern readers who value quality over clutter.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <h3>Real-Time Push Alerts</h3>
          <p>Instant OS-level push notifications dispatch breaking stories directly to your device with minimal battery usage.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3>Offline Bookmarks</h3>
          <p>Save comprehensive investigations and stories locally to read without network interruptions during transit.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <h3>Curated Feed Channels</h3>
          <p>Explore distinct verticals across Global News, Technology, Business, and Culture without algorithm spam.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3>Privacy-First Architecture</h3>
          <p>Zero data selling, minimal telemetry, transparent Firestore security rules, and user-controlled data choices.</p>
        </div>
      </div>
    </section>

    <!-- Official Developer Contact Section -->
    <section class="contact-card-wrap" id="contact">
      <div class="contact-head">
        <h2>Developer &amp; Store Contact Details</h2>
        <p>Official publisher contacts and transparency details as verified for Google Play Console distribution.</p>
      </div>

      <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="contact-item-label">Developer / Publisher</div>
            <div class="contact-item-value">Ibrahim Jenberu (Hab Info)</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div>
            <div class="contact-item-label">Support Email</div>
            <div class="contact-item-value"><a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a></div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <div>
            <div class="contact-item-label">Developer Phone</div>
            <div class="contact-item-value"><a href="tel:+251917577381">+251 917 577 381</a> (0917577381)</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </div>
          <div>
            <div class="contact-item-label">Official Website</div>
            <div class="contact-item-value"><a href="https://habinfo-notification-server.onrender.com">habinfo-notification-server.onrender.com</a></div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div>
            <div class="contact-item-label">Headquarters / Location</div>
            <div class="contact-item-value">Addis Ababa, Ethiopia</div>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
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
    .wrapper {
      max-width: 860px;
      margin: 0 auto;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }
    .brand-mark {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0755E8, #168CF5);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-weight: 800;
      font-size: 20px;
    }
    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
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
    }
    .doc-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      box-shadow: var(--shadow-md);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-tint);
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 8px;
    }
    .meta-bar {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
    }
    h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-top: 36px;
      margin-bottom: 12px;
      border-left: 4px solid var(--primary);
      padding-left: 14px;
    }
    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p {
      color: var(--text-muted);
      margin-bottom: 16px;
      font-size: 1rem;
    }
    ul {
      margin-left: 24px;
      margin-bottom: 18px;
      color: var(--text-muted);
    }
    li { margin-bottom: 8px; }
    li strong { color: var(--text-main); }
    a {
      color: var(--primary);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .contact-box {
      background: var(--surface-subtle);
      border-radius: 16px;
      padding: 24px;
      margin-top: 32px;
      border: 1px solid var(--border);
    }
    .contact-box p { margin-bottom: 6px; }
    .footer {
      margin-top: 48px;
      border-top: 1px solid var(--border);
      padding-top: 24px;
      text-align: center;
      color: var(--text-dim);
      font-size: 0.9rem;
    }
    @media (max-width: 640px) {
      .doc-card { padding: 28px 18px; }
      h1 { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav>
      <a href="/" class="brand">
        <div class="brand-mark">H</div>
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
        <strong>Effective Date:</strong> October 12, 2026 &nbsp;|&nbsp; <strong>Application:</strong> Hab Info (Android &amp; iOS)
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
        <li><strong>Full Account / Data Deletion Request:</strong> Email us at <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a> with the subject line <em>"Data Deletion Request"</em>. Requests are fulfilled within 30 days.</li>
      </ul>

      <h2>6. Children's Privacy</h2>
      <p>Hab Info is not directed to children under 13 years of age. We do not knowingly collect personal data from children under 13.</p>

      <h2>7. Developer &amp; Store Contact Information</h2>
      <div class="contact-box">
        <p><strong>Application:</strong> Hab Info</p>
        <p><strong>Developer:</strong> Ibrahim Jenberu</p>
        <p><strong>Support Email:</strong> <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a></p>
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
    .brand-mark { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #0755E8, #168CF5); display: flex; align-items: center; justify-content: center; color: #FFF; font-weight: 800; font-size: 20px; }
    .theme-toggle-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .doc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 48px; box-shadow: var(--shadow-md); }
    h1 { font-size: 2.3rem; font-weight: 800; margin-bottom: 8px; }
    h2 { font-size: 1.35rem; font-weight: 700; margin-top: 32px; margin-bottom: 12px; border-left: 4px solid var(--primary); padding-left: 12px; }
    p { color: var(--text-muted); margin-bottom: 16px; font-size: 1rem; }
    a { color: var(--primary); }
    .contact-box { background: var(--surface-subtle); border-radius: 16px; padding: 24px; margin-top: 32px; border: 1px solid var(--border); }
    .contact-box p { margin-bottom: 6px; }
    .footer { margin-top: 48px; border-top: 1px solid var(--border); padding-top: 24px; text-align: center; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav>
      <a href="/" class="brand">
        <div class="brand-mark">H</div>
        <div style="font-size: 1.25rem; font-weight: 800;">Hab Info</div>
      </a>
      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="theme-toggle-btn" onclick="toggleTheme()"></button>
        <a href="/" style="text-decoration: none; font-size: 0.9rem; font-weight: 700; color: var(--primary);">← Back to App</a>
      </div>
    </nav>
    <div class="doc-card">
      <h1>Terms of Service</h1>
      <p><strong>Effective Date:</strong> October 12, 2026 &nbsp;|&nbsp; <strong>Application:</strong> Hab Info</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By downloading, browsing, or using the Hab Info mobile application or its associated web services, you agree to these Terms of Service.</p>
      <h2>2. Permitted Use</h2>
      <p>Hab Info provides curated news and articles for personal, non-commercial reading. Content is protected by applicable copyright and intellectual property laws.</p>
      <h2>3. Disclaimers</h2>
      <p>Hab Info is provided on an "as-is" basis. We strive for high availability and accurate reporting but make no warranties regarding uninterrupted access.</p>
      <h2>4. Developer Contact</h2>
      <div class="contact-box">
        <p><strong>Developer:</strong> Ibrahim Jenberu (Hab Info)</p>
        <p><strong>Support Email:</strong> <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a></p>
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
