import sgMail from '@sendgrid/mail'

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) throw new Error('SENDGRID_API_KEY not set')
  sgMail.setApiKey(apiKey)
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  name?: string
): Promise<void> {
  console.log(`[Email] Sending OTP via SendGrid to ${email}...`)
  initSendGrid()

  await sgMail.send({
    to: email,
    from: {
      email: 'shlokgohel2117@gmail.com',
      name: 'JARVIS_CTO'
    },
    subject: 'JARVIS_CTO — Your Verification Code',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#030712;font-family:Inter,sans-serif}
  .wrap{max-width:480px;margin:40px auto;background:#0B1120;border:1px solid rgba(0,212,255,0.15);border-radius:16px;overflow:hidden}
  .top{height:2px;background:linear-gradient(90deg,transparent,#00D4FF,transparent)}
  .head{padding:28px 32px;border-bottom:1px solid rgba(0,212,255,0.08)}
  .logo{font-size:16px;font-weight:900;color:#00D4FF;letter-spacing:0.2em}
  .logo-sub{font-size:9px;color:rgba(248,250,252,0.2);letter-spacing:0.3em;font-family:monospace;margin-top:2px}
  .body{padding:32px}
  .label{font-size:9px;font-family:monospace;color:rgba(0,212,255,0.5);letter-spacing:0.3em;margin-bottom:8px;text-transform:uppercase}
  .title{font-size:20px;font-weight:800;color:#F8FAFC;margin-bottom:16px}
  .desc{font-size:13px;color:rgba(248,250,252,0.4);line-height:1.7;margin-bottom:24px}
  .otp-box{background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.2);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px}
  .otp-label{font-size:9px;font-family:monospace;color:rgba(0,212,255,0.4);letter-spacing:0.4em;margin-bottom:12px;text-transform:uppercase}
  .otp-code{font-size:48px;font-weight:900;color:#00D4FF;letter-spacing:0.4em;font-family:monospace}
  .otp-exp{font-size:11px;font-family:monospace;color:rgba(248,250,252,0.2);margin-top:10px}
  .warn{background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.15);border-radius:8px;padding:14px 16px}
  .warn-text{font-size:11px;font-family:monospace;color:rgba(245,158,11,0.6);line-height:1.9}
  .foot{padding:20px 32px;border-top:1px solid rgba(0,212,255,0.06);text-align:center}
  .foot-text{font-size:10px;font-family:monospace;color:rgba(248,250,252,0.1)}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"></div>
  <div class="head">
    <div class="logo">JARVIS_CTO</div>
    <div class="logo-sub">ARCHITECTURE SYSTEM</div>
  </div>
  <div class="body">
    <div class="label">Identity Verification</div>
    <div class="title">Your Access Code${name ? `, ${name}` : ''}</div>
    <div class="desc">Enter this 6-digit code to verify your email and complete your JARVIS_CTO account setup.</div>
    <div class="otp-box">
      <div class="otp-label">Verification Code</div>
      <div class="otp-code">${otp}</div>
      <div class="otp-exp">⏱ Expires in 10 minutes</div>
    </div>
    <div class="warn">
      <div class="warn-text">
        ▸ Never share this code with anyone<br/>
        ▸ JARVIS_CTO will never ask for this code<br/>
        ▸ If you did not request this — ignore
      </div>
    </div>
  </div>
  <div class="foot">
    <div class="foot-text">JARVIS_CTO · SECURE TRANSMISSION · ${new Date().getFullYear()}</div>
  </div>
</div>
</body>
</html>`
  })

  console.log(`[Email] OTP sent successfully via SendGrid to ${email}`)
}

export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<void> {
  try {
    console.log(`[Email] Sending welcome email via SendGrid to ${email}...`)
    initSendGrid()

    await sgMail.send({
      to: email,
      from: {
        email: 'shlokgohel2117@gmail.com',
        name: 'JARVIS_CTO'
      },
      subject: 'Welcome to JARVIS_CTO — Access Granted',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#030712;font-family:Inter,sans-serif}
  .wrap{max-width:480px;margin:40px auto;background:#0B1120;border:1px solid rgba(0,212,255,0.15);border-radius:16px;overflow:hidden}
  .top{height:2px;background:linear-gradient(90deg,transparent,#00D4FF,transparent)}
  .head{padding:28px 32px;border-bottom:1px solid rgba(0,212,255,0.08)}
  .logo{font-size:16px;font-weight:900;color:#00D4FF;letter-spacing:0.2em}
  .body{padding:32px}
  .label{font-size:9px;font-family:monospace;color:rgba(0,212,255,0.5);letter-spacing:0.3em;text-transform:uppercase;margin-bottom:8px}
  .title{font-size:22px;font-weight:800;color:#F8FAFC;margin-bottom:16px}
  .desc{font-size:13px;color:rgba(248,250,252,0.4);line-height:1.7;margin-bottom:28px}
  .cta{display:inline-block;padding:13px 28px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.3);border-radius:8px;color:#00D4FF;font-weight:700;text-decoration:none;font-size:11px;letter-spacing:0.2em;font-family:monospace}
  .foot{padding:20px 32px;border-top:1px solid rgba(0,212,255,0.06);text-align:center}
  .foot-text{font-size:10px;font-family:monospace;color:rgba(248,250,252,0.1)}
</style>
</head>
<body>
<div class="wrap">
  <div class="top"></div>
  <div class="head"><div class="logo">JARVIS_CTO</div></div>
  <div class="body">
    <div class="label">Access Granted</div>
    <div class="title">Welcome${name ? `, ${name}` : ' aboard'}</div>
    <div class="desc">Your JARVIS_CTO account is now active. All 12 AI agents are ready. Generate your first technical blueprint in under 60 seconds.</div>
    <a href="${process.env.FRONTEND_URL || 'https://ai-cto-two.vercel.app'}/dashboard" class="cta">OPEN DASHBOARD →</a>
  </div>
  <div class="foot">
    <div class="foot-text">JARVIS_CTO · ${new Date().getFullYear()}</div>
  </div>
</div>
</body>
</html>`
    })
    console.log(`[Email] Welcome email sent via SendGrid to ${email}`)
  } catch (e: any) {
    console.error('[Email] Welcome email failed:', e.message)
  }
}
