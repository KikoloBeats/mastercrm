// Netlify Function: send-email via Resend API
// Requires env var: RESEND_API_KEY
// Set it in Netlify: Site Settings > Environment variables

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const { RESEND_API_KEY } = process.env
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set')
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Email service not configured. Add RESEND_API_KEY in Netlify environment variables.' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { to, subject, text, name } = body
  if (!to || !subject || !text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields: to, subject, text' }) }
  }

  const greeting = name ? `<p>Ola ${name.split(' ')[0]}!</p>` : ''
  const htmlBody = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0E1C36;">
      <div style="background: linear-gradient(135deg, #0E1C36 0%, #1F3460 100%); padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <p style="color: white; font-family: Montserrat, sans-serif; font-size: 16px; font-weight: 700; margin: 0;">MasterPlan de Carreira</p>
        <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0;">Carla Morais</p>
      </div>
      <div style="padding: 32px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        ${greeting}
        ${text.split('\n').map(line => line.trim() ? `<p style="margin: 0 0 12px;">${line}</p>` : '<br/>').join('')}
      </div>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Carla Morais <noreply@kalakala.co>',
        to: [to],
        subject,
        html: htmlBody,
        text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      throw new Error(data.message || data.name || 'Resend API error')
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, id: data.id }),
    }
  } catch (err) {
    console.error('send-email error:', err)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
