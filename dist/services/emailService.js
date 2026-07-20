"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvitationEmail = sendInvitationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Enterprise email service using Brevo SMTP (nodemailer transport).
 * All outbound mail — invitation, password reset, welcome — routes
 * through this module so templates and credentials are centralized.
 */
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
// ---------------------------------------------------------------------------
// Transporter — created lazily on first use so startup stays fast
// ---------------------------------------------------------------------------
let _transporter = null;
function getTransporter() {
    if (_transporter)
        return _transporter;
    _transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp-relay.brevo.com',
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER ?? '9f7e5c001@smtp-brevo.com',
            pass: process.env.SMTP_PASS ?? '',
        },
    });
    return _transporter;
}
// ---------------------------------------------------------------------------
// Shared email layout
// ---------------------------------------------------------------------------
const FROM_ADDRESS = `"${process.env.EMAIL_FROM_NAME ?? 'SnapInfo'}" <${process.env.EMAIL_FROM ?? 'noreply@snapinfo.app'}>`;
const BRAND_COLOR = '#C6A15B';
const BRAND_NAME = process.env.APP_NAME ?? 'SnapInfo';
const APP_URL = process.env.APP_URL ?? 'https://snapinfo-web.onrender.com';
function baseTemplate(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${BRAND_NAME}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1a}
  .wrapper{max-width:560px;margin:40px auto;padding:0 16px}
  .card{background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  .header{background:linear-gradient(135deg,#0B0B0C 0%,#1C1C1F 100%);padding:32px;text-align:center}
  .logo{font-size:26px;font-weight:700;color:${BRAND_COLOR};letter-spacing:-0.5px}
  .tagline{font-size:12px;color:rgba(255,255,255,0.45);margin-top:4px;letter-spacing:1px}
  .body{padding:40px 32px}
  .title{font-size:22px;font-weight:600;color:#141414;margin-bottom:12px;line-height:1.3}
  .text{font-size:15px;color:#5C5C5C;line-height:1.7;margin-bottom:16px}
  .btn-wrap{text-align:center;margin:32px 0}
  .btn{display:inline-block;background:${BRAND_COLOR};color:#141414!important;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;letter-spacing:0.2px}
  .meta{background:#F9F9F7;border-radius:10px;padding:16px 20px;margin:24px 0;font-size:13px;color:#9A9A9A;line-height:1.8}
  .meta strong{color:#5C5C5C}
  .divider{border:none;border-top:1px solid #EBEBEB;margin:28px 0}
  .footer{text-align:center;padding:24px 32px;font-size:12px;color:#9A9A9A;line-height:1.7}
  .footer a{color:${BRAND_COLOR};text-decoration:none}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <div class="logo">${BRAND_NAME}</div>
      <div class="tagline">News, curated with intelligence.</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>This email was sent by ${BRAND_NAME}.<br>
      If you believe you received this by mistake, please ignore it.<br>
      <a href="${APP_URL}/legal/privacy">Privacy Policy</a> · <a href="${APP_URL}/legal/terms">Terms of Service</a></p>
    </div>
  </div>
</div>
</body>
</html>`;
}
async function sendInvitationEmail(input) {
    const content = `
    <h1 class="title">You've been invited to ${BRAND_NAME}</h1>
    <p class="text">Hello <strong>${input.displayName}</strong>,</p>
    <p class="text"><strong>${input.invitedBy}</strong> has invited you to join <strong>${BRAND_NAME}</strong> as a <strong>${input.role.replace('_', ' ')}</strong>.</p>
    <div class="meta">
      <div><strong>Email:</strong> ${input.to}</div>
      <div><strong>Temporary Password:</strong> <code style="background:#F0F0F0;padding:2px 6px;border-radius:4px;font-family:monospace">${input.temporaryPassword}</code></div>
      <div><strong>Role:</strong> ${input.role.replace('_', ' ')}</div>
    </div>
    <p class="text">Click the button below to sign in for the first time. You will be prompted to change your password after signing in.</p>
    <div class="btn-wrap">
      <a href="${APP_URL}/(auth)/sign-in" class="btn">Sign In to ${BRAND_NAME}</a>
    </div>
    <hr class="divider">
    <p class="text" style="font-size:13px;color:#9A9A9A">This invitation was sent to ${input.to}. If you did not expect this, please ignore this email. The temporary password above is valid for 7 days.</p>
  `;
    await getTransporter().sendMail({
        from: FROM_ADDRESS,
        to: input.to,
        subject: `You've been invited to ${BRAND_NAME}`,
        html: baseTemplate(content),
    });
    logger_1.log.info('emailService: invitation sent', { to: input.to, role: input.role });
}
async function sendPasswordResetEmail(input) {
    const name = input.displayName ?? input.to.split('@')[0] ?? 'there';
    const content = `
    <h1 class="title">Reset your password</h1>
    <p class="text">Hi <strong>${name}</strong>,</p>
    <p class="text">We received a request to reset the password for your ${BRAND_NAME} account. Click the button below to choose a new password.</p>
    <div class="btn-wrap">
      <a href="${input.resetLink}" class="btn">Reset Password</a>
    </div>
    <hr class="divider">
    <p class="text" style="font-size:13px;color:#9A9A9A">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email — your account remains secure.</p>
    <div class="meta">
      <div><strong>Account:</strong> ${input.to}</div>
    </div>
  `;
    await getTransporter().sendMail({
        from: FROM_ADDRESS,
        to: input.to,
        subject: `Reset your ${BRAND_NAME} password`,
        html: baseTemplate(content),
    });
    logger_1.log.info('emailService: password reset sent', { to: input.to });
}
//# sourceMappingURL=emailService.js.map