import { buildPrettyShareUrl, type RaffleLike } from "./shareUrl";

export type EmailParts = { subject: string; html: string; text: string };

const BRAND = {
  name: 'Ganhavel',
  supportEmail: 'suporte@ganhavel.com',
};

function baseHtml(inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Inter,Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
      <tr>
        <td style="padding:24px 16px 8px;text-align:center;">
          <div style="font-weight:700;font-size:20px;">${BRAND.name}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Justo, honesto e comprovado</div>
        </td>
      </tr>
      <tr>
        <td style="background:#fff;border:1px solid #eaecef;border-radius:12px;padding:20px;">
          ${inner}
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding:12px 16px;color:#6b7280;font-size:12px;line-height:18px;">
          Este e-mail foi enviado automaticamente. Dúvidas? Responda ou escreva para <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a>.
          <br/>Transparência: o ganhador é definido com base no resultado da Loteria Federal (Caixa) e só agendamos o sorteio quando a meta é atingida (100%).
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function list(items: string[]) {
  return `<ul style="padding-left:18px;margin:8px 0 0;">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

function cleanText(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n');
}

// Build a WhatsApp share button (works in email clients that open links)
function whatsappShare(raffleTitle: string, raffleUrl: string, description?: string) {
  // Build CTA-first share text
  const cta = `✨ Participe você também deste Ganhavel e concorra a ${raffleTitle}!`;
  const body = description?.trim() ?? "";
  const shareText = [cta, body].filter(Boolean).join("\n\n");
  const text = encodeURIComponent(`${shareText}\n\n${raffleUrl}`);
  const href = `https://wa.me/?text=${text}`;
  return `<a href="${href}" style="display:inline-block;padding:10px 14px;border-radius:8px;border:1px solid #16a34a;text-decoration:none;color:#065f46;">
    Compartilhar no WhatsApp
  </a>`;
}

// Fixed CTA line used across emails
function shareCtaLine(raffleTitle?: string, raffleUrl?: string, description?: string) {
  const wa = raffleTitle && raffleUrl ? whatsappShare(raffleTitle, raffleUrl, description) : '';
  return `
    <div style="margin-top:14px;padding:12px;border:1px dashed #e5e7eb;border-radius:10px;">
      <div style="font-weight:600;margin-bottom:6px;">Compartilha para que o sorteio aconteça 🔁</div>
      ${wa || '<div style="font-size:12px;color:#6b7280;">Copie o link do seu Ganhavel e compartilhe.</div>'}
    </div>
  `;
}

// Reusable fairness/explanation block
function fairnessBlock(resultsUrl: string) {
  return `
    <div style="margin-top:16px;padding:12px;background:#f9fafb;border:1px solid #eef0f3;border-radius:10px;">
      <div style="font-weight:600;margin-bottom:8px;">Como funciona (justo e transparente)</div>
      <ul style="padding-left:18px;margin:0;">
        <li>Baseado na Loteria Federal (Caixa) — nada de truques.</li>
        <li>O sorteio só é agendado quando o Ganhavel atinge 100% da meta.</li>
        <li>Cada bilhete tem 5 pares; o cruzamento com o resultado oficial define o ganhador.</li>
        <li>Tudo fica registrado na página <a href="${resultsUrl}">Resultados</a>.</li>
      </ul>
    </div>
  `;
}

// Reusable growth/affiliate block
function growthBlock() {
  return `
    <div style="margin-top:16px;padding:12px;background:#fff7ed;border:1px solid #fde7d3;border-radius:10px;">
      <div style="font-weight:600;margin-bottom:8px;">Desfrute das oportunidades de fazer dinheiro também</div>
      <ul style="padding-left:18px;margin:0;">
        <li>Lance um Ganhavel com seu <strong>link de afiliado</strong> e receba a comissão do produto.</li>
        <li>Já vende algo? Imóveis, automóveis, eletrônicos… <strong>transforme em Ganhavel</strong> e alcance mais gente.</li>
        <li>Estamos estudando a <strong>legalidade</strong> de incluir <strong>custos de marketing/impulsionamento</strong> de forma transparente.</li>
        <li>Faça <strong>renda extra</strong> conectando afiliados a <strong>fontes de tráfego</strong>.</li>
      </ul>
    </div>
  `;
}

/* ========= WELCOME ========= */
export const welcomeSubject = 'Bem-vindo ao Ganhavel 🚀';

export function welcomeEmail(params: {
  name?: string;
  myTicketsUrl: string;
  resultsUrl?: string;
}): EmailParts {
  const name = params.name || 'Ganhavel';
  const resultsUrl = params.resultsUrl || `${location.origin}/#/resultados`;
  const htmlInner = `
    <h2 style="margin:0 0 12px;font-size:20px;">Bem-vindo ao Ganhavel 🚀</h2>
    <p style="margin:0 0 12px;">Olá <strong>${name}</strong>, sua conta foi criada com sucesso.</p>
    <p style="margin:0 0 12px;">Participe, crie seus ganhaveis e acompanhe tudo em <a href="${params.myTicketsUrl}">Meus Bilhetes</a>.</p>
    ${fairnessBlock(resultsUrl)}
    ${growthBlock()}
  `;
  const html = baseHtml(htmlInner);
  const text = cleanText(`Bem-vindo ao Ganhavel
Olá ${name}, sua conta foi criada com sucesso.
Meus Bilhetes: ${params.myTicketsUrl}
Como funciona: baseado na Loteria Federal; sorteio só com 100%; tudo na página Resultados.
Ganhe dinheiro também: lance com link de afiliado; transforme seu produto em Ganhavel.
`);
  return { subject: welcomeSubject, html, text };
}

/* ========= PURCHASE RECEIPT ========= */
export const receiptSubject = 'Confirmação da sua compra 🎟️';

export function receiptEmail(params: {
  raffleTitle: string;
  raffleUrl?: string;
  tickets: string[];
  myTicketsUrl: string;
  resultsUrl?: string;
  valueBRL?: string;
  txId?: string;
}): EmailParts {
  const details: string[] = [];
  if (params.valueBRL) details.push(`<strong>Valor:</strong> ${params.valueBRL}`);
  if (params.txId) details.push(`<strong>Transação:</strong> ${params.txId}`);
  const resultsUrl = params.resultsUrl || `${location.origin}/#/resultados`;

  const htmlInner = `
    <h2 style="margin:0 0 12px;font-size:20px;">Compra confirmada 🎟️</h2>
    <p style="margin:0 0 8px;">Obrigado pela compra no <strong>Ganhavel</strong>!</p>
    <p style="margin:0 0 8px;"><strong>Ganhavel:</strong> ${params.raffleTitle}</p>
    ${details.length ? `<p style="margin:0 0 8px;">${details.join(' • ')}</p>` : ''}
    <p style="margin:0 0 6px;"><strong>Bilhetes:</strong></p>
    ${list(params.tickets)}
    <p style="margin:12px 0 0;">Acompanhe em: <a href="${params.myTicketsUrl}">Meus Bilhetes</a></p>
    ${params.raffleTitle && params.raffleUrl ? shareCtaLine(params.raffleTitle, params.raffleUrl) : shareCtaLine()}
    ${fairnessBlock(resultsUrl)}
  `;
  const html = baseHtml(htmlInner);
  const text = cleanText(`Compra confirmada
Ganhavel: ${params.raffleTitle}
${params.valueBRL ? `Valor: ${params.valueBRL}\n` : ''}${params.txId ? `Transação: ${params.txId}\n` : ''}Bilhetes:
${params.tickets.map(t => `- ${t}`).join('\n')}
Meus Bilhetes: ${params.myTicketsUrl}
Compartilha para que o sorteio aconteça.
Como funciona: Loteria Federal; sorteio só com 100%; tudo na página Resultados.
`);
  return { subject: receiptSubject, html, text };
}

/* ========= ORGANIZER LAUNCH ========= */
export const launchSubject = 'Seu ganhavel está no ar 🎉';

export function launchEmail(params: {
  raffleTitle: string;
  raffleUrl: string;
  resultsUrl?: string;
  tipsUrl?: string;
}): EmailParts {
  const resultsUrl = params.resultsUrl || `${location.origin}/#/resultados`;
  const tips = params.tipsUrl
    ? `<p style="margin:0 0 8px;">Dica: veja <a href="${params.tipsUrl}">como divulgar seu ganhavel</a> e aumente as vendas.</p>`
    : `<p style="margin:0 0 8px;">Dica: adicione boas imagens e um texto cativante para aumentar as vendas.</p>`;

  const htmlInner = `
    <h2 style="margin:0 0 12px;font-size:20px;">Seu ganhavel está no ar 🎉</h2>
    <p style="margin:0 0 8px;">"<strong>${params.raffleTitle}</strong>" foi publicado com sucesso.</p>
    <p style="margin:0 0 8px;">Link: <a href="${params.raffleUrl}">${params.raffleUrl}</a></p>
    ${shareCtaLine(params.raffleTitle, params.raffleUrl)}
    ${tips}
    ${growthBlock()}
    ${fairnessBlock(resultsUrl)}
  `;
  const html = baseHtml(htmlInner);
  const text = cleanText(`Seu ganhavel está no ar
"${params.raffleTitle}" publicado com sucesso.
Link: ${params.raffleUrl}
Compartilha para que o sorteio aconteça.
Ganhe dinheiro também: lance com link de afiliado; transforme seu produto em Ganhavel.
Como funciona: Loteria Federal; sorteio só com 100%; resultados públicos.
`);
  return { subject: launchSubject, html, text };
}

/* ========= OPTIONAL: Aguardando sorteio (buyers) ========= */
export const waitingDrawSubject = 'Aguardando sorteio da Loteria Federal ⏳';

export function waitingDrawEmail(params: {
  raffleTitle: string;
  drawDateLabel?: string;
  resultsUrl: string;
  raffleUrl?: string;
}): EmailParts {
  const share = params.raffleTitle && params.raffleUrl ? shareCtaLine(params.raffleTitle, params.raffleUrl) : shareCtaLine();
  const htmlInner = `
    <h2 style="margin:0 0 12px;font-size:20px;">Aguardando sorteio ⏳</h2>
    <p style="margin:0 0 8px;">O ganhavel <strong>${params.raffleTitle}</strong> atingiu 100% e agora aguarda o resultado da Loteria Federal.</p>
    ${params.drawDateLabel ? `<p style="margin:0 0 8px;">Próximo sorteio: <strong>${params.drawDateLabel}</strong>.</p>` : ''}
    <p style="margin:0;">Acompanhe os resultados em: <a href="${params.resultsUrl}">${params.resultsUrl}</a></p>
    ${share}
  `;
  const html = baseHtml(htmlInner);
  const text = cleanText(`Aguardando sorteio
${params.raffleTitle} atingiu 100% e aguarda o resultado da Loteria Federal.
${params.drawDateLabel ? `Próximo sorteio: ${params.drawDateLabel}\n` : ''}Resultados: ${params.resultsUrl}
Compartilha para que o sorteio aconteça.`);
  return { subject: waitingDrawSubject, html, text };
}

/* ========= OPTIONAL: Ganhador ========= */
export const winnerSubject = 'Temos um ganhador! 🏆';

export function winnerEmail(params: {
  raffleTitle: string;
  winningTicket: string;
  federalPairs?: string;
  resultsUrl: string;
  raffleUrl?: string;
}): EmailParts {
  const share = params.raffleTitle && params.raffleUrl ? shareCtaLine(params.raffleTitle, params.raffleUrl) : '';
  const htmlInner = `
    <h2 style="margin:0 0 12px;font-size:20px;">Temos um ganhador! 🏆</h2>
    <p style="margin:0 0 8px;">No ganhavel <strong>${params.raffleTitle}</strong>, o bilhete vencedor foi: <strong>${params.winningTicket}</strong>.</p>
    ${params.federalPairs ? `<p style="margin:0 0 8px;">Pares sorteados (Loteria Federal): <strong>${params.federalPairs}</strong></p>` : ''}
    <p style="margin:0;">Veja os detalhes e comprovação em: <a href="${params.resultsUrl}">${params.resultsUrl}</a></p>
    ${share}
  `;
  const html = baseHtml(htmlInner);
  const text = cleanText(`Temos um ganhador!
${params.raffleTitle}
Bilhete vencedor: ${params.winningTicket}
${params.federalPairs ? `Pares sorteados: ${params.federalPairs}\n` : ''}Detalhes: ${params.resultsUrl}`);
  return { subject: winnerSubject, html, text };
}