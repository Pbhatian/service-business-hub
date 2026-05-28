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

  const t = topic || "growing your business";

  const content: Record<string, string> = {
    linkedin: `Here's something most ${niche} professionals don't talk about when it comes to ${t}:

The best results don't come from rushing. They come from *consistency*.

I've seen it happen dozens of times — the provider who shows up every week with genuine value on ${t} wins the relationship long before they send a single proposal.

Here's the framework I share with every client:

→ Be visible (post, comment, share weekly)
→ Be valuable (give before you ask)
→ Be personal (people buy from people they trust)

When applied to ${t}, the compound effect is remarkable. 3 months in, you're not pitching — you're responding to inbound.

What's your experience with ${t}? Drop a comment below.

#${niche.replace(/\s/g, "")} #${t.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")} #BusinessGrowth #ClientAcquisition`,

    instagram: `The truth about ${t} that nobody tells ${niche} professionals 👇

It's not about doing more. It's about doing it with *purpose*.

Every move you make around ${t} should do ONE of these:
✅ Educate your audience
✅ Solve a real problem
✅ Build genuine trust
✅ Drive the next step

Pick one intention. Execute with clarity. Watch everything change.

Save this for the next time you're stuck on ${t}. 💾

What's your biggest challenge with ${t}? Drop a comment 👇

#${t.split(" ").join("")} #${niche.replace(/\s/g, "")} #ContentStrategy #BusinessOwner`,

    blog: `# The ${niche} Guide to ${t.charAt(0).toUpperCase() + t.slice(1)}

Let's be honest — most advice on ${t} is either too vague or too complex.

In this post, I'm breaking down the exact approach that's helped ${niche} professionals see real, measurable results from ${t} — without the guesswork.

## Why ${t} Matters More Than You Think

Most solo providers underestimate the impact of ${t} on their bottom line. The data tells a different story...

## The Three-Step Framework

After working with dozens of ${niche} clients on ${t}, here's what consistently works:

**Step 1: Audit what you're currently doing**
Before optimizing ${t}, you need a clear baseline...

**Step 2: Focus on the highest-leverage activity**
Not all ${t} strategies are equal. The 20% that drives 80% of results...

**Step 3: Build a repeatable system**
The goal with ${t} isn't a one-time win — it's compounding momentum...

## Final Thoughts

${t.charAt(0).toUpperCase() + t.slice(1)} isn't a destination. It's a practice. Start small, stay consistent, and the results will follow.`,

    newsletter: `Subject: What I've learned about ${t} this year 📬

Hi [First Name],

This month I want to get real about something: ${t}.

It's one of the most talked-about topics in the ${niche} world — and also one of the most misunderstood.

Here's what I've actually seen work (and what wastes your time):

**What works:** Starting with a clear goal for ${t}, building a simple repeatable system, and measuring what matters.

**What doesn't:** Chasing every new tactic, copying competitors, and trying to do too much at once.

This month's deep dive covers the three shifts that made the biggest difference in my approach to ${t} — and how you can apply them this week.

[Read the full breakdown →]

Until next month,
[Your Name]

P.S. — What's your current approach to ${t}? Hit reply — I read every response.`,
  };

  return content[platform.toLowerCase()] ?? content["linkedin"];
}
