// backend/src/utils/email.util.js

import nodemailer from 'nodemailer';

// ============================================================================
// ✉️ NODEMAILER GMAIL SMTP TRANSPORTER SETUP
// ============================================================================
// process.env-la irukkura Gmail details-ai vachu secure connection ready panrom:
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail SMTP settings (smtp.gmail.com, Port 465 SSL) auto-configure aagum
  auth: {
    user: process.env.EMAIL_USER, // antony777sri@gmail.com
    pass: process.env.EMAIL_PASS, // 16-character Google App Password
  },
});

// Sender details:
const SENDER_EMAIL = `"Employee Management Portal" <${process.env.EMAIL_USER || 'no-reply@company.com'}>`;

// ============================================================================
// 1. 💌 SEND EMPLOYEE INVITATION EMAIL
// Pudhidhaaga serkkappattulla employee-kku account activation link anuppum.
// ============================================================================
export const sendInvitationEmail = async ({ to, name, role, invitationLink }) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: '🎉 Welcome to the Team! Complete Your Account Setup',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #1e40af; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .badge { display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; margin: 8px 0; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 15px; }
          .link-box { background: #f1f5f9; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #64748b; margin-top: 16px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Employee Management System</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p>You have been invited to join the enterprise portal. An account has been created for you with the following role:</p>
            
            <div style="text-align: center; margin: 16px 0;">
              <span class="badge">${role}</span>
            </div>

            <p>To activate your account and set your secure password, please click the button below:</p>

            <div class="btn-container">
              <a href="${invitationLink}" class="btn">Set Up Your Account</a>
            </div>

            <p style="font-size: 14px; color: #64748b;">
              ⚠️ <strong>Security Note:</strong> This invitation link is single-use and will expire in <strong>24 hours</strong>.
            </p>

            <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
              If the button doesn't work, copy and paste this URL into your browser:
            </p>
            <div class="link-box">
              ${invitationLink}
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Enterprise Employee Management Portal. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  [EMAIL SENT] Invitation email successfully sent to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send invitation email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// ============================================================================
// 2. 🔐 SEND PASSWORD RESET 6-DIGIT OTP EMAIL
// Password marandhutta employee-kku 5-minute expiry ulla 6-digit OTP code anuppum.
// ============================================================================
export const sendPasswordResetOtpEmail = async ({ to, otpCode }) => {
  const mailOptions = {
    from: SENDER_EMAIL,
    to,
    subject: `🔐 Your Verification Code: ${otpCode} (Expires in 5 mins)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .otp-card { background-color: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 10px; padding: 20px; text-align: center; margin: 28px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #0f172a; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 12px; }
          .warning-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 4px; margin-top: 24px; font-size: 13px; color: #b45309; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p style="font-size: 15px;">Hello,</p>
            <p>We received a request to reset the password for your account. Please use the 6-digit verification code below to proceed:</p>
            
            <div class="otp-card">
              <span class="otp-code">${otpCode}</span>
            </div>

            <p style="text-align: center; color: #475569; font-size: 14px; margin-top: -10px;">
              Enter this code on the verification screen to reset your password.
            </p>

            <div class="warning-box">
              <strong>⚠️ Important Security Notices:</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li>This code is valid for <strong>5 minutes only</strong>.</li>
                <li>For your security, entering an invalid code <strong>5 times</strong> will invalidate this request.</li>
                <li>Never share this verification code with anyone.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
              If you did not request a password reset, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Enterprise Employee Management Portal. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  [EMAIL SENT] Password Reset OTP successfully sent to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Failed to send OTP email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export default {
  sendInvitationEmail,
  sendPasswordResetOtpEmail,
};