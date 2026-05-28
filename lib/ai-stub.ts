import type { Client } from "@/types";

// Stub responses — replace with real Anthropic API calls once ANTHROPIC_API_KEY is set.
// Each function mirrors the exact signature the real API routes will use.

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateOutreach(
  client: Client,
  messageType: string,
  userContext?: string
): Promise<string> {
  await delay(1400);

  const templates: Record<string, string> = {
    "re-engagement": `Hi ${client.name}! 👋

Hope you're doing well! It's been a little while since we last connected, and I've been thinking about the great work we did together${client.company ? ` at ${client.company}` : ""}.

I've recently developed some new ideas around ${client.service_type ?? "your goals"} that I think could bring real value your way. I'd love to catch up and hear how things are going on your end.

Would you be open to a quick 20-minute call this week or next? I promise it'll be worth your time.

Looking forward to reconnecting!

Warm regards,
[Your Name]`,

    "check-in": `Hi ${client.name},

Just wanted to send a quick check-in message! How have things been going${client.company ? ` at ${client.company}` : ""}?

I came across a few insights on ${client.service_type ?? "your industry"} recently that immediately made me think of you. Happy to share if you're interested.

No agenda — just wanted to stay in touch and see how I can continue to support you.

Best,
[Your Name]`,

    upsell: `Hi ${client.name},

I hope things are going brilliantly on your end! Working with you has been a real highlight, and I've been thinking about what's next.

I recently launched a new offering specifically designed for ${client.service_type ?? "service providers"} like yourself — and early results have been really exciting.

Would love to walk you through it in a brief 15-minute call. I genuinely think it could unlock some new opportunities for you.

Up for a quick chat this week?

Best,
[Your Name]`,

    referral: `Hi ${client.name},

I hope you're having a fantastic week! Thank you so much for being such an incredible client — working together has been truly rewarding.

I'm expanding my client roster this quarter and am looking for a few more ${client.service_type ?? "service"} clients similar to yourself.

If you know anyone in your network who might benefit from what we've built together, I'd be incredibly grateful for an introduction. Happy to make it easy — just a quick email intro is all it takes!

No pressure at all — just thought I'd ask. 😊

Warm regards,
[Your Name]`,

    "follow-up": `Hi ${client.name},

Following up on my previous message — just wanted to make sure it didn't get lost in the inbox shuffle!

I genuinely believe there's a great opportunity for us to work together on ${client.service_type ?? "your upcoming projects"}, and I'd love to explore it.

If now isn't the right time, no worries at all — just let me know and I'll check back in a few months. And if there's anything else I can help with right now, I'm here!

Best,
[Your Name]`,
  };

  const key = Object.keys(templates).find((k) =>
    messageType.toLowerCase().includes(k)
  );

  return templates[key ?? "check-in"];
}

export async function generateWeeklyContent(
  topic: string,
  platform: string,
  niche: string
): Promise<string> {
  await delay(1800);

  const content: Record<string, string> = {
    linkedin: `Here's something most ${niche} professionals don't talk about:

The best clients don't come from cold outreach. They come from *consistency*.

I've seen it happen dozens of times — the provider who shows up every week with genuine value wins the relationship long before they send a single proposal.

Here's the framework I share with every client:

→ Be visible (post, comment, share weekly)
→ Be valuable (give before you ask)
→ Be personal (people buy from people they trust)

The compound effect of this? Remarkable. 3 months in, you're not pitching — you're responding to inbound.

What's one thing you've done this week to add value to your network?

#${niche.replace(/\s/g, "")} #BusinessGrowth #ClientAcquisition #SoloPreneur`,

    instagram: `The #1 thing I wish I knew earlier as a ${niche} professional 👇

It's not about posting more. It's about posting with *purpose*.

Every caption should do ONE of these:
✅ Educate
✅ Entertain
✅ Inspire
✅ Convert

Pick one. Write with that goal. Watch your engagement change.

Save this for next time you're staring at a blank post. 💾

Which type of content works best for YOUR audience? Drop a comment 👇

#ContentStrategy #${niche.replace(/\s/g, "")} #SocialMediaTips #BusinessOwner #ContentCreator`,

    blog: `# The ${niche} Guide to Getting More Clients Without Cold Calling

Let's be honest — nobody enjoys cold outreach.

The good news? You don't have to rely on it.

In this post, I'm breaking down the exact strategy that's helped ${niche} professionals go from feast-or-famine to consistent, predictable revenue — without sending a single cold message.

## 1. Build Your Visibility Engine

The clients who find you are 5x more likely to convert than the ones you chase. Start by...

## 2. Create Content That Attracts

Your ideal client is searching for answers to the exact problems you solve. If you're not creating content around those problems...

## 3. Activate Your Warm Network

Most solo providers are sitting on a goldmine of warm relationships they've never properly nurtured...`,

    newsletter: `Subject: The one thing I changed that doubled my client referrals 📬

Hi [First Name],

Real talk this month: I almost burned out last year.

Too many tools. Too many tabs. Too much administrative noise eating into my actual work.

Sound familiar?

Here's what changed everything: I started treating my client relationships like I treat my best friendships — with intentionality and consistency.

This month I want to share the three practices that transformed my retention rate and, unexpectedly, tripled my referrals.

[Read the full breakdown →]

Until next month,
[Your Name]

P.S. — If this resonated, reply and tell me your biggest client management challenge. I read every response.`,
  };

  return content[platform.toLowerCase()] ?? content["linkedin"];
}
