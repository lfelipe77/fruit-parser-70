import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityAlert {
  alert_id: string
  type: string
  description: string
  severity: string
  ip_address?: string
  user_id?: string
  context?: any
  created_at: string
}

async function sendTelegramNotification(alert: SecurityAlert) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID')

  if (!botToken || !chatId) {
    console.log('Telegram credentials not configured')
    return
  }

  const severityEmoji = {
    low: '🔵',
    medium: '🟡', 
    high: '🟠',
    critical: '🔴'
  }

  const message = `🚨 Alerta de Segurança Detectado:

${severityEmoji[alert.severity as keyof typeof severityEmoji] || '⚪'} **Severidade:** ${alert.severity.toUpperCase()}
**Tipo:** ${alert.type}
**Descrição:** ${alert.description}
${alert.ip_address ? `**IP:** ${alert.ip_address}` : ''}
${alert.user_id ? `**Usuário:** ${alert.user_id.slice(0, 8)}...` : ''}
**Horário:** ${new Date(alert.created_at).toLocaleString('pt-BR')}

ID do Alerta: \`${alert.alert_id}\``

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }

    console.log('Telegram notification sent successfully')
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
  }
}

async function sendEmailNotification(alert: SecurityAlert) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    console.log('Resend API key not configured')
    return
  }

  const severityEmoji = {
    low: '🔵',
    medium: '🟡',
    high: '🟠', 
    critical: '🔴'
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alerta de Segurança - Ganhavel</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert-info { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .severity { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
        .detail { margin: 10px 0; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Alerta de Segurança Ganhavel</h1>
        </div>
        <div class="content">
          <div class="alert-info">
            <div class="severity">
              ${severityEmoji[alert.severity as keyof typeof severityEmoji] || '⚪'} Severidade: ${alert.severity.toUpperCase()}
            </div>
            <div class="detail"><strong>Tipo:</strong> ${alert.type}</div>
            <div class="detail"><strong>Descrição:</strong> ${alert.description}</div>
            ${alert.ip_address ? `<div class="detail"><strong>IP:</strong> ${alert.ip_address}</div>` : ''}
            ${alert.user_id ? `<div class="detail"><strong>Usuário:</strong> ${alert.user_id}</div>` : ''}
            <div class="detail"><strong>Horário:</strong> ${new Date(alert.created_at).toLocaleString('pt-BR')}</div>
            <div class="detail"><strong>ID do Alerta:</strong> ${alert.alert_id}</div>
          </div>
          
          <p>Este alerta foi gerado automaticamente pelo sistema de segurança do Ganhavel.</p>
          <p>Por favor, verifique o painel administrativo para mais detalhes e tome as ações necessárias.</p>
        </div>
        <div class="footer">
          Sistema de Segurança Ganhavel - ${new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ganhavel Security <security@ganhavel.com>',
        to: ['admin@ganhavel.com'],
        subject: `🚨 Alerta de Segurança - ${alert.type} (${alert.severity.toUpperCase()})`,
        html: emailHtml
      })
    })

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`)
    }

    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const alert: SecurityAlert = await req.json()
    
    console.log('Processing security alert notification:', alert.alert_id)

    // Enviar notificações em paralelo
    await Promise.allSettled([
      sendEmailNotification(alert),
      sendTelegramNotification(alert)
    ])

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Security notification error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send notifications' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})