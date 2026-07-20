"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvitationEmail = sendInvitationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Enterprise email service using Brevo Transactional Email API (HTTP).
 *
 * Uses Brevo's REST API instead of SMTP because Render's free tier blocks
 * outbound SMTP (ports 25, 465, 587). The HTTP API works on port 443
 * which is always open.
 *
 * Brevo API docs: https://developers.brevo.com/reference/sendtransacemail
 */
const logger_1 = require("../utils/logger");
// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
function getApiKey() {
    // The SMTP password from Brevo IS the API key (xsmtpsib-... prefix)
    const key = process.env.BREVO_API_KEY ?? process.env.SMTP_PASS ?? '';
    if (!key) {
        logger_1.log.warn('emailService: BREVO_API_KEY not set — emails will not be sent');
    }
    return key;
}
const SENDER_EMAIL = process.env.EMAIL_FROM ?? 'noreply@snapinfo.app';
const SENDER_NAME = process.env.EMAIL_FROM_NAME ?? 'SnapInfo';
const BRAND_COLOR = '#C6A15B';
const BRAND_NAME = process.env.APP_NAME ?? 'SnapInfo';
const APP_URL = process.env.APP_URL ?? 'https://snapinfo-web.onrender.com';
async function sendEmail(payload) {
    const apiKey = getApiKey();
    if (!apiKey)
        return; // Skip silently if no key — don't crash the server
    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Brevo API error ${res.status}: ${body}`);
    }
}
// ---------------------------------------------------------------------------
// Shared email layout
// ---------------------------------------------------------------------------
function baseTemplate(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${BRAND_NAME}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a}
.wrap{max-width:560px;margin:40px auto;padding:0 16px}
.card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg,#0B0B0C,#1C1C1F);padding:32px;text-align:center}
.logo{font-size:26px;font-weight:700;color:${BRAND_COLOR};letter-spacing:-.5px}
.tag{font-size:12px;color:rgba(255,255,255,.45);margin-top:4px;letter-spacing:1px}
.body{padding:40px 32px}
.title{font-size:22px;font-weight:600;color:#141414;margin-bottom:12px;line-height:1.3}
.text{font-size:15px;color:#5C5C5C;line-height:1.7;margin-bottom:16px}
.btn-wrap{text-align:center;margin:32px 0}
.btn{display:inline-block;background:${BRAND_COLOR};color:#141414!important;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px}
.meta{background:#F9F9F7;border-radius:10px;padding:16px 20px;margin:24px 0;font-size:13px;color:#9A9A9A;line-height:1.8}
.meta strong{color:#5C5C5C}
hr{border:none;border-top:1px solid #EBEBEB;margin:28px 0}
.foot{text-align:center;padding:24px 32px;font-size:12px;color:#9A9A9A;line-height:1.7}
.foot a{color:${BRAND_COLOR};text-decoration:none}
code{background:#F0F0F0;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<div class="hdr"><div class="logo">${BRAND_NAME}</div><div class="tag">News, curated with intelligence.</div></div>
<div class="body">${content}</div>
<div class="foot"><p>Sent by ${BRAND_NAME}. If you received this by mistake, ignore it.<br>
<a href="${APP_URL}/legal/privacy">Privacy</a> · <a href="${APP_URL}/legal/terms">Terms</a></p></div>
</div></div>
</body>
</html>`;
}
async function sendInvitationEmail(input) {
    const roleLabel = input.role.replace('_', ' ');
    const html = baseTemplate(`
    <h1 class="title">You've been invited to ${BRAND_NAME}</h1>
    <p class="text">Hello <strong>${input.displayName}</strong>,</p>
    <p class="text"><strong>${input.invitedBy}</strong> has invited you to join <strong>${BRAND_NAME}</strong> as a <strong>${roleLabel}</strong>.</p>
    <div class="meta">
      <div><strong>Email:</strong> ${input.to}</div>
      <div><strong>Temporary Password:</strong> <code>${input.temporaryPassword}</code></div>
      <div><strong>Role:</strong> ${roleLabel}</div>
    </div>
    <p class="text">Click the button below to sign in. You'll be prompted to change your password.</p>
    <div class="btn-wrap"><a href="${APP_URL}/(auth)/sign-in" class="btn">Sign In to ${BRAND_NAME}</a></div>
    <hr>
    <p class="text" style="font-size:13px;color:#9A9A9A">Temporary password is valid for 7 days. Sent to ${input.to}.</p>
  `);
    await sendEmail({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: input.to, name: input.displayName }],
        subject: `You've been invited to ${BRAND_NAME}`,
        htmlContent: html,
    });
    logger_1.log.info('emailService: invitation sent', { to: input.to, role: input.role });
}
async function sendPasswordResetEmail(input) {
    const name = input.displayName ?? input.to.split('@')[0] ?? 'there';
    const html = baseTemplate(`
    <h1 class="title">Reset your password</h1>
    <p class="text">Hi <strong>${name}</strong>,</p>
    <p class="text">We received a request to reset your ${BRAND_NAME} password. Click below to set a new one.</p>
    <div class="btn-wrap"><a href="${input.resetLink}" class="btn">Reset Password</a></div>
    <hr>
    <p class="text" style="font-size:13px;color:#9A9A9A">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
    <div class="meta"><div><strong>Account:</strong> ${input.to}</div></div>
  `);
    await sendEmail({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: input.to, name: name }],
        subject: `Reset your ${BRAND_NAME} password`,
        htmlContent: html,
    });
    logger_1.log.info('emailService: password reset sent', { to: input.to });
}
//# sourceMappingURL=emailService.js.map