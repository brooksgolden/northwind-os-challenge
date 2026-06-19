/**
 * Pure, dependency-free draft-reply logic, shared by the browser client and the
 * server-side provider. No DOM or Node APIs in here.
 */

export interface InquiryContext {
  cafe_name: string
  contact_name: string
  email?: string
  region: string
  channel: string
  requested_volume_lbs_month: number
  message: string
}

function firstName(full: string): string {
  return (full || '').trim().split(/\s+/)[0] || 'there'
}

/** Deterministic, context-aware fallback used whenever no model is reachable. */
export function buildTemplateReply(ctx: InquiryContext): string {
  const name = firstName(ctx.contact_name)
  const vol = ctx.requested_volume_lbs_month

  let volumeLine: string
  if (vol >= 250) {
    volumeLine = `At ${vol} lbs a month you'd be one of our larger ${ctx.region} partners, so I can put together volume pricing and a dedicated roast schedule for ${ctx.cafe_name}.`
  } else if (vol >= 100) {
    volumeLine = `${vol} lbs a month is a great fit for our wholesale program, and there's plenty of room for your pricing to improve as you grow.`
  } else {
    volumeLine = `Starting around ${vol} lbs a month is completely fine. Some of our best ${ctx.region} accounts began small and grew with us.`
  }

  return [
    `Hi ${name},`,
    ``,
    `Thanks for reaching out to Northwind Coffee about wholesale for ${ctx.cafe_name}. ${volumeLine}`,
    ``,
    `A good next step is a sample box of our current lineup plus a wholesale price sheet, so you can taste before you commit. If you're open to it, I'd also love a quick 15 minute call to hear what you're pouring now and where you want to take it.`,
    ``,
    `What does your week look like for a short call?`,
    ``,
    `Warm regards,`,
    `The Northwind Coffee Wholesale Team`,
  ].join('\n')
}

/** Prompt handed to Claude (CLI or API) when a real model is available. */
export function buildPrompt(ctx: InquiryContext): string {
  return [
    `You are a friendly, sharp wholesale account manager at Northwind Coffee, a specialty coffee roaster that sells to cafes.`,
    `Draft a short reply to an inbound wholesale inquiry. Rules:`,
    `- Warm and human, not corporate. 90 to 130 words.`,
    `- No em dashes. Use periods or commas instead.`,
    `- Reference their specifics naturally (cafe name, region, requested volume).`,
    `- Propose a concrete next step: samples plus a price sheet, and a short call.`,
    `- Return ONLY the email body, starting with "Hi <first name>,". No subject line, no preamble, no sign-off other than from the Northwind Coffee Wholesale Team.`,
    ``,
    `Inquiry:`,
    `- Cafe: ${ctx.cafe_name}`,
    `- Contact: ${ctx.contact_name}`,
    `- Region: ${ctx.region}`,
    `- Came in via: ${ctx.channel}`,
    `- Requested volume: ${ctx.requested_volume_lbs_month} lbs/month`,
    `- Their message: "${ctx.message}"`,
  ].join('\n')
}
