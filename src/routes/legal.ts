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
  <title>Hab Info - Services &amp; Legal</title>
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
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 48px;
      max-width: 560px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .logo {
      width: 64px;
      height: 64px;
      background: #0F6CBD;
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    h1 { font-size: 1.8rem; margin-bottom: 8px; }
    p { color: var(--text-muted); margin-bottom: 28px; }
    .btn-group { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: #0A4B82; }
    .btn-outline { background: white; color: var(--text-main); border: 1px solid var(--border); }
    .btn-outline:hover { background: #F1F5F9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">H</div>
    <h1>Hab Info Services</h1>
    <p>Official backend services, push dispatchers, and legal disclosures for the Hab Info mobile application.</p>
    <div class="btn-group">
      <a href="/privacy" class="btn btn-primary">Privacy Policy</a>
      <a href="/terms" class="btn btn-outline">Terms of Service</a>
      <a href="/health" class="btn btn-outline">Service Status</a>
    </div>
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
