import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  }
})

export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
  await transporter.sendMail({
    from: `"AI CTO System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'AI CTO — Your Verification Code',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background: #030712; font-family: 'Inter', sans-serif; }
    .container { max-width: 480px; margin: 40px auto; background: #0B1120; border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; overflow: hidden; }
    .header { padding: 32px; text-align: center; border-bottom: 1px solid rgba(0,212,255,0.08); }
    .logo { font-size: 18px; font-weight: 900; color: #00D4FF; letter-spacing: 0.2em; }
    .logo-sub { font-size: 10px; color: rgba(248,250,252,0.2); letter-spacing: 0.3em; margin-top: 4px; font-family: monospace; }
    .body { padding: 32px; }
    .greeting { font-size: 14px; color: rgba(248,250,252,0.5); margin-bottom: 8px; }
    .title { font-size: 22px; font-weight: 800; color: #F8FAFC; margin-bottom: 24px; }
    .otp-container { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 10px; font-family: monospace; color: rgba(0,212,255,0.5); letter-spacing: 0.3em; margin-bottom: 12px; }
    .otp-code { font-size: 42px; font-weight: 900; color: #00D4FF; letter-spacing: 0.3em; font-family: monospace; text-shadow: 0 0 20px rgba(0,212,255,0.4); }
    .expiry { font-size: 12px; color: rgba(248,250,252,0.3); margin-top: 12px; font-family: monospace; }
    .warning { background: rgba(245,158,11,0.05); border: 1px solid rgba(245,158,11,0.15); border-radius: 8px; padding: 12px 16px; margin-top: 20px; }
    .warning-text { font-size: 12px; color: rgba(245,158,11,0.7); font-family: monospace; }
    .footer { padding: 20px 32px; border-top: 1px solid rgba(0,212,255,0.06); text-align: center; }
    .footer-text { font-size: 11px; color: rgba(248,250,252,0.15); font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">AI CTO</div>
      <div class="logo-sub">JARVIS ARCHITECTURE SYSTEM</div>
    </div>
    <div class="body">
      <div class="greeting">Hello${name ? `, ${name}` : ''}</div>
      <div class="title">Your verification code</div>
      <p style="font-size: 13px; color: rgba(248,250,252,0.4); line-height: 1.6;">
        Enter this code to verify your email address and complete your AI CTO account setup.
      </p>
      <div class="otp-container">
        <div class="otp-label">VERIFICATION CODE</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry">⏱ Expires in 10 minutes</div>
      </div>
      <div class="warning">
        <div class="warning-text">▸ Never share this code with anyone<br/>▸ AI CTO will never ask for this code<br/>▸ If you did not request this, ignore this email</div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">AI CTO SYSTEM · BUILT BY SHLOK GOHEL · ${new Date().getFullYear()}</div>
    </div>
  </div>
</body>
</html>
    `
  })
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  await transporter.sendMail({
    from: `"AI CTO System" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Welcome to AI CTO — System Initialized',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; background: #030712; font-family: 'Inter', sans-serif; }
    .container { max-width: 480px; margin: 40px auto; background: #0B1120; border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; overflow: hidden; }
    .header { padding: 32px; text-align: center; background: linear-gradient(135deg, rgba(0,212,255,0.05) 0%, transparent 100%); border-bottom: 1px solid rgba(0,212,255,0.08); }
    .logo { font-size: 18px; font-weight: 900; color: #00D4FF; letter-spacing: 0.2em; }
    .body { padding: 32px; }
    .title { font-size: 22px; font-weight: 800; color: #F8FAFC; margin-bottom: 16px; }
    .text { font-size: 13px; color: rgba(248,250,252,0.4); line-height: 1.7; margin-bottom: 24px; }
    .cta { display: inline-block; padding: 12px 28px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); border-radius: 8px; color: #00D4FF; font-weight: 700; text-decoration: none; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; }
    .footer { padding: 20px; border-top: 1px solid rgba(0,212,255,0.06); text-align: center; }
    .footer-text { font-size: 11px; color: rgba(248,250,252,0.15); font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><div class="logo">AI CTO</div></div>
    <div class="body">
      <div class="title">Welcome${name ? `, ${name}` : ''} 👋</div>
      <div class="text">
        Your AI CTO account is now active. You have full access to all 6 AI agents —
        Architecture, Database, API Design, Cost Estimation, Security Audit, and Diagram generation.
        <br/><br/>
        Start by describing any startup idea and watch your complete technical blueprint generate in under 60 seconds.
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="cta">OPEN DASHBOARD →</a>
    </div>
    <div class="footer">
      <div class="footer-text">AI CTO SYSTEM · ${new Date().getFullYear()}</div>
    </div>
  </div>
</body>
</html>
    `
  })
}
