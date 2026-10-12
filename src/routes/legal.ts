import { Router } from 'express';

export const legalRouter = Router();

const PRIVACY_POLICY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Hab Info</title>
  <meta name="description" content="Privacy Policy for Hab Info mobile application. Learn how we collect, use, and protect your data.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0F6CBD;
      --primary-dark: #0A4B82;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border: #E2E8F0;
      --tag-bg: #EFF6FF;
      --tag-text: #1E40AF;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.65;
      padding: 40px 20px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      background: var(--tag-bg);
      color: var(--tag-text);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .meta {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 36px;
      margin-bottom: 14px;
      border-left: 4px solid var(--primary);
      padding-left: 12px;
    }
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-main);
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p {
      color: var(--text-muted);
      margin-bottom: 16px;
      font-size: 1rem;
    }
    ul, ol {
      margin-left: 24px;
      margin-bottom: 18px;
      color: var(--text-muted);
    }
    li {
      margin-bottom: 8px;
    }
    li strong {
      color: var(--text-main);
    }
    a {
      color: var(--primary);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    a:hover {
      color: var(--primary-dark);
    }
    .contact-card {
      background: #F1F5F9;
      border-radius: 12px;
      padding: 24px;
      margin-top: 24px;
      border: 1px solid var(--border);
    }
    .contact-card p {
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 48px;
      border-top: 1px solid var(--border);
      padding-top: 20px;
      text-align: center;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    @media (max-width: 640px) {
      body {
        padding: 16px 12px;
      }
      .container {
        padding: 24px 18px;
      }
      h1 {
        font-size: 1.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Official Legal Document</span>
      <h1>Privacy Policy for Hab Info</h1>
      <p class="meta"><strong>Effective Date:</strong> October 12, 2026 &nbsp;|&nbsp; <strong>Application:</strong> Hab Info (Android &amp; iOS)</p>
    </div>

    <h2>1. Introduction</h2>
    <p>
      Welcome to <strong>Hab Info</strong> ("we," "our," or "us"), published by Ibrahim Jenberu. We respect your privacy and are committed to protecting any information collected through the Hab Info mobile application.
    </p>
    <p>
      This Privacy Policy applies solely to the Hab Info application and describes how we collect, use, process, and protect your information, as well as the rights and choices available to you regarding your personal data in accordance with Google Play Developer Policies and global privacy standards.
    </p>

    <h2>2. Information We Collect</h2>
    <p>We believe in minimal data collection. We only collect information strictly necessary to provide the features and performance of our app:</p>

    <h3>A. Technical &amp; Device Information</h3>
    <ul>
      <li><strong>Device Identifiers:</strong> Anonymous device identifier (installation UUID) to remember your device settings and manage push notification delivery.</li>
      <li><strong>Device Specifications:</strong> Operating system version, device model, app version, and system language preference to deliver an optimized display and appropriate content language.</li>
    </ul>

    <h3>B. Push Notification Data</h3>
    <ul>
      <li><strong>Push Notification Tokens:</strong> If you grant notification permission, we receive an Expo / Firebase Cloud Messaging (FCM) push token. This token allows our notification service to deliver breaking news headlines, daily digest updates, and relevant topic alerts. You can disable notifications at any time in device settings or in-app settings.</li>
    </ul>

    <h3>C. App Usage &amp; Preferences</h3>
    <ul>
      <li><strong>Local Preferences:</strong> Topic selections, dark/light theme choices, and bookmarked articles are saved on your local device (and synchronized to cloud storage only if you choose to sign in).</li>
      <li><strong>Crash &amp; Performance Logs:</strong> Anonymous stack traces, crash reports, and system diagnostics collected through Sentry and Firebase to quickly detect and resolve crashes.</li>
    </ul>

    <h3>D. Advertising Identifiers (Google AdMob)</h3>
    <ul>
      <li><strong>Advertising ID:</strong> We use Google Mobile Ads (AdMob) to display advertisements. AdMob may process your device's Google Advertising ID (AAID on Android) and general IP-based approximate location to deliver relevant ads and prevent fraud, in full adherence to Google Play advertising policies.</li>
    </ul>

    <h3>E. User Account Information (Optional)</h3>
    <ul>
      <li>Hab Info is fully functional as a guest without creating an account. If you voluntarily register an account, we collect your email address and display name through Firebase Authentication.</li>
    </ul>

    <h2>3. How We Use Your Information</h2>
    <p>We use the collected information for the following legitimate purposes:</p>
    <ul>
      <li>To deliver curated news, articles, and real-time updates.</li>
      <li>To dispatch instant push notifications for breaking stories you have opted to receive.</li>
      <li>To personalize content categories and maintain your saved bookmarks.</li>
      <li>To monitor application stability, detect bugs, and release timely performance improvements.</li>
      <li>To serve advertisements supporting the continued operation of our free news services.</li>
    </ul>

    <h2>4. Third-Party Service Providers</h2>
    <p>
      We partner with trusted third-party service providers who assist us in operating and maintaining the application. These providers only access data necessary to perform their specific tasks on our behalf and are bound by strict confidentiality and data protection obligations:
    </p>
    <ul>
      <li>
        <strong>Google Firebase (Google LLC):</strong> Cloud database (Firestore), authentication, and analytics infrastructure. 
        <br><a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>
      </li>
      <li>
        <strong>Google AdMob (Google LLC):</strong> In-app advertising network.
        <br><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google Ads Privacy Policy</a>
      </li>
      <li>
        <strong>Expo Application Services (650 Industries):</strong> Push notification delivery infrastructure.
        <br><a href="https://expo.dev/privacy" target="_blank" rel="noopener">Expo Privacy Policy</a>
      </li>
      <li>
        <strong>Sentry (Functional Software, Inc.):</strong> Crash diagnostics and error logging.
        <br><a href="https://sentry.io/privacy" target="_blank" rel="noopener">Sentry Privacy Policy</a>
      </li>
    </ul>

    <h2>5. Data Sharing and Sale of Personal Data</h2>
    <p>
      <strong>We do not sell, rent, monetize, or trade your personal data or device information to any third parties.</strong>
    </p>
    <p>
      We will only disclose information if required to do so by applicable law, regulation, legal process, or governmental request, or to protect the rights, property, and safety of our users and the public.
    </p>

    <h2>6. Data Retention and Security</h2>
    <p>
      We implement industry-standard technical, organizational, and physical safeguards to protect your data. All communication between the app and backend servers is encrypted using modern Transport Layer Security (TLS/HTTPS).
    </p>
    <ul>
      <li>Push tokens are retained as long as your app installation remains active and are pruned when an app is uninstalled or tokens become invalid.</li>
      <li>Anonymous crash reports are automatically deleted after 90 days.</li>
      <li>Account data is stored securely in Firebase and retained until you request account deletion.</li>
    </ul>

    <h2>7. User Rights and Data Deletion</h2>
    <p>You have full control over your data within Hab Info:</p>
    <ul>
      <li><strong>Disable Notifications:</strong> You can disable push notifications at any moment via your device's <em>Settings &gt; Apps &gt; Hab Info &gt; Notifications</em> or inside the app's Settings screen.</li>
      <li><strong>Manage Ad Personalization:</strong> You can reset or opt out of personalized ads via your device's <em>Settings &gt; Google &gt; Ads</em> or through the in-app Privacy Options form.</li>
      <li><strong>Clear Local Data:</strong> You can clear your search history and bookmarks directly inside the app, or clear app cache/storage in Android settings.</li>
      <li><strong>Account &amp; Data Deletion Request:</strong> You have the right to request permanent deletion of your account and any associated data stored on our servers. To request deletion, email us at <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a> with the subject line <em>"Data Deletion Request"</em>. We will process and confirm your request within 30 days.</li>
    </ul>

    <h2>8. Children's Privacy</h2>
    <p>
      Hab Info is not directed toward children under the age of 13 (or under 16 in certain jurisdictions). We do not knowingly collect or solicit personal information from children. If we discover that a child under 13 has provided us with personal information, we will delete such information from our servers immediately. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
    </p>

    <h2>9. Changes to This Privacy Policy</h2>
    <p>
      We may update our Privacy Policy periodically to reflect app updates or legal requirements. Any modifications will be posted directly to this URL with a revised "Effective Date" at the top of the page. We encourage you to review this page periodically.
    </p>

    <h2>10. Contact Us</h2>
    <div class="contact-card">
      <p>If you have questions, comments, or concerns about this Privacy Policy or our data practices, please reach out to us:</p>
      <p><strong>App:</strong> Hab Info</p>
      <p><strong>Developer:</strong> Ibrahim Jenberu</p>
      <p><strong>Support Email:</strong> <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a></p>
      <p><strong>Website:</strong> <a href="https://habinfo-notification-server.onrender.com">https://habinfo-notification-server.onrender.com</a></p>
    </div>

    <div class="footer">
      <p>&copy; 2026 Hab Info. All rights reserved. &nbsp;|&nbsp; <a href="/terms">Terms of Service</a></p>
    </div>
  </div>
</body>
</html>
`;

const TERMS_OF_SERVICE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - Hab Info</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0F6CBD;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text-main: #0F172A;
      --text-muted: #475569;
      --border: #E2E8F0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.65;
      padding: 40px 20px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }
    h1 { font-size: 2.2rem; margin-bottom: 8px; }
    h2 { font-size: 1.35rem; margin-top: 32px; margin-bottom: 12px; border-left: 4px solid var(--primary); padding-left: 12px; }
    p { color: var(--text-muted); margin-bottom: 16px; }
    a { color: var(--primary); }
    .footer { margin-top: 48px; border-top: 1px solid var(--border); padding-top: 20px; text-align: center; color: var(--text-muted); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Terms of Service</h1>
    <p><strong>Effective Date:</strong> October 12, 2026</p>
    <h2>1. Acceptance of Terms</h2>
    <p>By downloading, accessing, or using the Hab Info mobile application, you agree to be bound by these Terms of Service.</p>
    <h2>2. Use of Content</h2>
    <p>Hab Info provides curated news, stories, and informational content for personal, non-commercial reading. All content is protected by intellectual property rights.</p>
    <h2>3. Disclaimer of Warranties</h2>
    <p>Hab Info is provided on an "as is" and "as available" basis without warranties of any kind.</p>
    <h2>4. Contact Us</h2>
    <p>For questions regarding these Terms, contact <a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a>.</p>
    <div class="footer">
      <p>&copy; 2026 Hab Info. All rights reserved. &nbsp;|&nbsp; <a href="/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
`;

const LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hab Info - Modern News &amp; Intelligent Stories</title>
  <meta name="description" content="Hab Info delivers fast, curated news, breaking alerts, and distraction-free reading on Android and iOS.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090D16;
      --bg-card: #0F172A;
      --bg-card-hover: #162036;
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(56, 189, 248, 0.3);
      --primary: #38BDF8;
      --primary-gradient: linear-gradient(135deg, #38BDF8 0%, #6366F1 50%, #EC4899 100%);
      --accent-glow: rgba(56, 189, 248, 0.15);
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      line-height: 1.6;
      overflow-x: hidden;
    }
    /* Subtle background grid & glow */
    .bg-glow {
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 1000px;
      height: 500px;
      background: radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    .wrapper {
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
      padding: 24px 0;
      border-bottom: 1px solid var(--border);
    }
    .logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .logo-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284C7, #4F46E5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
      color: #FFF;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: #FFF;
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-link:hover {
      color: #FFF;
    }
    .nav-btn {
      padding: 10px 20px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      color: #FFF;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }
    /* Hero Section */
    .hero {
      text-align: center;
      padding: 80px 0 60px;
    }
    .pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid var(--border-accent);
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .pill-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
    }
    .hero h1 {
      font-size: 3.6rem;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 20px;
    }
    .gradient-text {
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      max-width: 680px;
      margin: 0 auto 36px;
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.7;
    }
    .cta-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 56px;
    }
    .btn-play {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #FFF;
      color: #090D16;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
    }
    .btn-play:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(255, 255, 255, 0.25);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: #FFF;
      border: 1px solid var(--border);
      padding: 14px 26px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
    /* Phone Mockup */
    .mockup-container {
      max-width: 380px;
      margin: 0 auto 80px;
      position: relative;
    }
    .phone-frame {
      background: #111827;
      border: 4px solid #334155;
      border-radius: 40px;
      padding: 14px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(56, 189, 248, 0.2);
    }
    .phone-screen {
      background: #0B1120;
      border-radius: 28px;
      padding: 20px 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: left;
    }
    .phone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .phone-title {
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #FFF;
    }
    .phone-chip-group {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: hidden;
    }
    .chip {
      background: #1E293B;
      color: #94A3B8;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
    }
    .chip.active {
      background: #0284C7;
      color: #FFF;
    }
    .news-card-mock {
      background: #1E293B;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .news-badge {
      display: inline-block;
      background: rgba(239, 68, 68, 0.2);
      color: #F87171;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .news-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFF;
      line-height: 1.35;
      margin-bottom: 8px;
    }
    .news-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #64748B;
    }
    /* Features Grid */
    .features-section {
      padding: 60px 0 80px;
    }
    .section-header {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 50px;
    }
    .section-title {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .section-sub {
      color: var(--text-muted);
      font-size: 1.05rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 32px 24px;
      transition: all 0.25s ease;
    }
    .card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-accent);
      transform: translateY(-4px);
    }
    .icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: var(--primary);
      margin-bottom: 20px;
    }
    .card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: #FFF;
    }
    .card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }
    /* Contact & Store Listing Info */
    .contact-section {
      background: #0B1120;
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 48px;
      margin: 60px 0 80px;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 32px;
      margin-top: 32px;
    }
    .contact-item h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      margin-bottom: 8px;
    }
    .contact-item p, .contact-item a {
      font-size: 1.05rem;
      color: #FFF;
      font-weight: 600;
      text-decoration: none;
    }
    .contact-item a:hover {
      color: var(--primary);
    }
    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 40px 0;
      text-align: center;
      color: var(--text-dim);
      font-size: 0.9rem;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 16px;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer-links a:hover {
      color: #FFF;
    }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.4rem; }
      .nav-links { display: none; }
      .contact-section { padding: 32px 20px; }
    }
  </style>
</head>
<body>
  <div class="bg-glow"></div>

  <div class="wrapper">
    <!-- Navbar -->
    <nav>
      <a href="/" class="logo-wrap">
        <div class="logo-badge">H</div>
        <span class="logo-text">Hab Info</span>
      </a>
      <div class="nav-links">
        <a href="#features" class="nav-link">Features</a>
        <a href="/privacy" class="nav-link">Privacy Policy</a>
        <a href="/terms" class="nav-link">Terms</a>
        <a href="#contact" class="nav-link">Contact</a>
      </div>
      <a href="https://play.google.com/store/apps/details?id=com.habinfo.app" class="nav-btn">Get App</a>
    </nav>

    <!-- Hero -->
    <header class="hero">
      <div class="pill-tag">
        <span class="pill-dot"></span>
        Google Play Ready • Release v1.0.0
      </div>
      <h1>Curated News &amp; Breaking Alerts,<br><span class="gradient-text">Elevated Reading.</span></h1>
      <p>
        Experience intelligent, distraction-free news. Stay connected with real-time push alerts, offline bookmarking, and tailored editorial feeds designed for speed.
      </p>
      <div class="cta-group">
        <a href="https://play.google.com/store/apps/details?id=com.habinfo.app" class="btn-play">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-.61-.925V2.74a1.5 1.5 0 0 1 .609-.926zm1.484-.716l11.08 6.398-3.473 3.474-7.607-9.872zm11.08 14.394L5.093 21.89l7.607-9.872 3.473 3.474zm1.09-1.09l3.522-2.034a1.5 1.5 0 0 0 0-2.6l-3.522-2.034-3.082 3.334 3.082 3.334z"/>
          </svg>
          Get on Google Play
        </a>
        <a href="/privacy" class="btn-secondary">
          Privacy Policy
        </a>
      </div>

      <!-- App Preview Mockup -->
      <div class="mockup-container">
        <div class="phone-frame">
          <div class="phone-screen">
            <div class="phone-header">
              <span class="phone-title">HAB INFO</span>
              <span style="font-size: 0.75rem; color: #38BDF8; font-weight: 700;">LIVE FEED</span>
            </div>
            <div class="phone-chip-group">
              <span class="chip active">Top Stories</span>
              <span class="chip">Technology</span>
              <span class="chip">Business</span>
              <span class="chip">Culture</span>
            </div>
            <div class="news-card-mock">
              <span class="news-badge">BREAKING</span>
              <h4 class="news-card-title">Next-Generation Mobile Intelligence Transforms Digital News</h4>
              <div class="news-meta">
                <span>By Editorial Desk</span>
                <span>Just now</span>
              </div>
            </div>
            <div class="news-card-mock" style="margin-bottom: 0;">
              <span class="news-badge" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8;">TRENDING</span>
              <h4 class="news-card-title">Deep Dive: Sustainable Infrastructure &amp; Innovation</h4>
              <div class="news-meta">
                <span>5 min read</span>
                <span>Saved Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="section-header">
        <h2 class="section-title">Designed For Seamless Reading</h2>
        <p class="section-sub">Every feature in Hab Info is crafted for rapid loading, minimal battery consumption, and effortless discovery.</p>
      </div>
      <div class="grid">
        <div class="card">
          <div class="icon-box">⚡</div>
          <h3>Real-Time Push Alerts</h3>
          <p>Instant OS-level push notifications keep you ahead of breaking developments without draining battery.</p>
        </div>
        <div class="card">
          <div class="icon-box">📖</div>
          <h3>Offline Bookmarks</h3>
          <p>Save compelling articles locally to read seamlessly on flights, underground transit, or low-connectivity zones.</p>
        </div>
        <div class="card">
          <div class="icon-box">🎨</div>
          <h3>Refined Typography</h3>
          <p>Carefully balanced type hierarchies and edge-to-edge dark &amp; light modes engineered for prolonged reading comfort.</p>
        </div>
        <div class="card">
          <div class="icon-box">🛡️</div>
          <h3>Privacy-First Architecture</h3>
          <p>Full transparency with zero personal data sales, minimal telemetry, and straightforward data control.</p>
        </div>
      </div>
    </section>

    <!-- Official Store Listing Contact Section -->
    <section id="contact" class="contact-section">
      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px;">Developer &amp; Store Contact Details</h2>
      <p style="color: var(--text-muted);">Official developer information displayed on Google Play Console and customer support channels.</p>

      <div class="contact-grid">
        <div class="contact-item">
          <h4>Application Name</h4>
          <p>Hab Info</p>
        </div>
        <div class="contact-item">
          <h4>Developer / Publisher</h4>
          <p>Ibrahim Jenberu</p>
        </div>
        <div class="contact-item">
          <h4>Support Email</h4>
          <p><a href="mailto:jenberuebrahim@gmail.com">jenberuebrahim@gmail.com</a></p>
        </div>
        <div class="contact-item">
          <h4>Official Website</h4>
          <p><a href="https://habinfo-notification-server.onrender.com">habinfo-notification-server.onrender.com</a></p>
        </div>
        <div class="contact-item">
          <h4>Location</h4>
          <p>Addis Ababa, Ethiopia</p>
        </div>
        <div class="contact-item">
          <h4>Privacy Policy URL</h4>
          <p><a href="/privacy">/privacy (Active SSL)</a></p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/health">Service Status</a>
        <a href="#contact">Support</a>
      </div>
      <p>&copy; 2026 Hab Info. All rights reserved. Developed by Ibrahim Jenberu.</p>
    </footer>
  </div>
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
