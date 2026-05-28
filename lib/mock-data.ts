import type {
  Client,
  MessageLog,
  ContentCalendarItem,
  FollowUpSchedule,
  ContentLibraryItem,
} from "@/types";

export const mockClients: Client[] = [
  {
    id: "c1",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 98765 43210",
    company: "Sharma Interiors",
    tags: ["vip", "active", "high-value"],
    notes:
      "Long-term client. Interested in brand consulting and quarterly strategy sessions. Referred 3 clients.",
    last_contact_date: "2026-04-28",
    created_at: "2024-06-01",
    service_type: "Brand Consulting",
  },
  {
    id: "c2",
    name: "Arjun Mehta",
    email: "arjun@techstart.in",
    phone: "+91 87654 32109",
    company: "TechStart",
    tags: ["new", "prospect"],
    notes:
      "Met at startup networking event. Looking for social media strategy. Budget: ₹25k/month.",
    last_contact_date: "2026-05-10",
    created_at: "2026-05-08",
    service_type: "Social Media Strategy",
  },
  {
    id: "c3",
    name: "Kavitha Nair",
    email: "kavitha@freelance.com",
    phone: "+91 76543 21098",
    company: null as unknown as string,
    tags: ["inactive", "follow-up"],
    notes:
      "Freelance designer. Worked together on 2 projects. Has not responded since Feb. Consider re-engagement.",
    last_contact_date: "2026-02-14",
    created_at: "2025-01-10",
    service_type: "Design Consulting",
  },
  {
    id: "c4",
    name: "Rohit Verma",
    email: "rohit@vermalaw.com",
    phone: "+91 65432 10987",
    company: "Verma & Associates",
    tags: ["active", "referral"],
    notes:
      "Corporate lawyer. Needs LinkedIn ghostwriting and thought leadership content monthly.",
    last_contact_date: "2026-05-20",
    created_at: "2025-03-15",
    service_type: "Content Writing",
  },
  {
    id: "c5",
    name: "Sneha Kulkarni",
    email: "sneha@wellness.io",
    phone: "+91 54321 09876",
    company: "MindBody Wellness",
    tags: ["vip", "high-value", "active"],
    notes:
      "Wellness coach growing her online presence. Runs Instagram workshops. Wants email sequences + blog drafts.",
    last_contact_date: "2026-05-15",
    created_at: "2025-02-01",
    service_type: "Digital Marketing",
  },
  {
    id: "c6",
    name: "Vikram Patel",
    email: "vikram@buildco.in",
    phone: "+91 43210 98765",
    company: "BuildCo India",
    tags: ["inactive", "churned"],
    notes:
      "Construction firm owner. Paused engagement 3 months ago. Worth reaching out with fresh proposal.",
    last_contact_date: "2026-02-01",
    created_at: "2024-11-20",
    service_type: "Marketing Strategy",
  },
];

export const mockMessageLogs: MessageLog[] = [
  {
    id: "m1",
    client_id: "c1",
    message_type: "check-in",
    draft_content:
      "Hi Priya! Hope your Q2 campaign is going well. I'd love to catch up and explore how we can push momentum into Q3. Would Thursday work for a quick call?",
    sent_status: "sent",
    created_at: "2026-04-28",
    client: mockClients[0],
  },
  {
    id: "m2",
    client_id: "c3",
    message_type: "follow-up",
    draft_content:
      "Hey Kavitha! It's been a while since we connected. I have some exciting new design consulting packages that I think would be a great fit for your freelance work. Would love to reconnect!",
    sent_status: "draft",
    created_at: "2026-05-01",
    client: mockClients[2],
  },
  {
    id: "m3",
    client_id: "c2",
    message_type: "outreach",
    draft_content:
      "Hi Arjun! Following up from our chat at the networking event. I've put together a brief social media audit for TechStart — happy to walk you through it on a 20-min call this week.",
    sent_status: "draft",
    created_at: "2026-05-12",
    client: mockClients[1],
  },
];

export const mockContentCalendar: ContentCalendarItem[] = [
  {
    id: "cc1",
    post_type: "linkedin",
    draft_content:
      "Most solo consultants lose clients not from bad work — but from silence. Here's a 3-step system I use to stay top-of-mind without sending spammy follow-ups:\n\n1. Monthly value-add check-in\n2. Celebrate their wins publicly\n3. Share resources relevant to their industry\n\nRelationships compound. Nurture them.",
    topic: "Client Retention",
    scheduled_date: "2026-06-02",
    status: "scheduled",
    created_at: "2026-05-25",
  },
  {
    id: "cc2",
    post_type: "instagram",
    draft_content:
      "Your brand voice is showing — even when you're silent. 👀\n\nEvery missed post, every delayed reply, every inconsistent caption tells a story.\n\nWant to audit yours? Drop a 🙋 below.\n\n#PersonalBranding #SoloPreneur #ContentStrategy #BusinessTips",
    topic: "Personal Branding",
    scheduled_date: "2026-06-03",
    status: "draft",
    created_at: "2026-05-25",
  },
  {
    id: "cc3",
    post_type: "blog",
    draft_content:
      "# How Solo Consultants Can Build a 6-Figure Referral Machine\n\nReferrals don't happen by accident. They happen because you've been deliberately valuable, consistently visible, and easy to recommend.\n\nIn this post, I break down the exact framework I use with clients to turn their existing network into a predictable referral engine...",
    topic: "Referral Growth",
    scheduled_date: "2026-06-05",
    status: "draft",
    created_at: "2026-05-25",
  },
  {
    id: "cc4",
    post_type: "linkedin",
    draft_content:
      "Unpopular opinion: You don't need more clients. You need better systems for your existing ones.\n\nOne happy client who hears from you regularly is worth 10 cold leads.\n\nFocus on retention before acquisition.",
    topic: "Business Growth",
    scheduled_date: "2026-06-09",
    status: "draft",
    created_at: "2026-05-25",
  },
  {
    id: "cc5",
    post_type: "instagram",
    draft_content:
      "This week I helped a client turn 2 dormant leads into ₹80k in new business — just by sending the right message at the right time.\n\nThe secret? A simple follow-up system.\n\nWant the template? Comment 'SYSTEM' 👇\n\n#ClientSuccess #FreelanceTips #BusinessGrowth",
    topic: "Success Story",
    scheduled_date: "2026-06-10",
    status: "draft",
    created_at: "2026-05-25",
  },
  {
    id: "cc6",
    post_type: "newsletter",
    draft_content:
      "Subject: Your June Growth Playbook 📈\n\nHi [First Name],\n\nThis month I'm sharing the 3 strategies that helped my clients generate 40% more recurring revenue in Q1. No fluff — just the moves that work for solo service providers...",
    topic: "Monthly Newsletter",
    scheduled_date: "2026-06-01",
    status: "scheduled",
    created_at: "2026-05-24",
  },
];

export const mockFollowUps: FollowUpSchedule[] = [
  {
    id: "f1",
    client_id: "c3",
    reminder_date: "2026-05-28",
    follow_up_status: "pending",
    notes: "Client inactive for 100+ days. Send re-engagement message.",
    created_at: "2026-05-01",
    client: mockClients[2],
  },
  {
    id: "f2",
    client_id: "c6",
    reminder_date: "2026-05-29",
    follow_up_status: "pending",
    notes: "Churned client. New proposal ready. Worth one more attempt.",
    created_at: "2026-05-05",
    client: mockClients[5],
  },
  {
    id: "f3",
    client_id: "c2",
    reminder_date: "2026-06-02",
    follow_up_status: "pending",
    notes: "New prospect from networking event. Check proposal status.",
    created_at: "2026-05-12",
    client: mockClients[1],
  },
  {
    id: "f4",
    client_id: "c4",
    reminder_date: "2026-06-10",
    follow_up_status: "pending",
    notes: "Monthly content review with Rohit. Prepare June content plan.",
    created_at: "2026-05-20",
    client: mockClients[3],
  },
  {
    id: "f5",
    client_id: "c1",
    reminder_date: "2026-06-15",
    follow_up_status: "snoozed",
    notes: "Q3 strategy session planning.",
    created_at: "2026-04-28",
    client: mockClients[0],
  },
];

export const mockContentLibrary: ContentLibraryItem[] = [
  {
    id: "l1",
    title: "Cold Re-engagement Message",
    content:
      "Hi [Name], it's been a while since we last connected! I've been thinking about [specific thing from notes] and wanted to check in. I have a few ideas that might be valuable for [their business/goal]. Would you be open to a quick 15-min call this week?",
    category: "outreach",
    tags: ["re-engagement", "cold", "check-in"],
    performance_notes: "High reply rate (65%). Best sent Tuesday–Thursday.",
    use_count: 24,
    created_at: "2025-06-01",
  },
  {
    id: "l2",
    title: "New Service Upsell",
    content:
      "Hi [Name], hope things are going well! I recently launched a new [service] that I think would complement what we've already built together. Early clients are seeing [result]. Would you be interested in a brief overview?",
    category: "outreach",
    tags: ["upsell", "new-service", "existing-client"],
    performance_notes: "Works best for clients with 3+ months engagement.",
    use_count: 18,
    created_at: "2025-08-15",
  },
  {
    id: "l3",
    title: "LinkedIn Thought Leadership Post",
    content:
      "I used to think [common misconception in your niche]. Then [turning point experience].\n\nHere's what I learned:\n\n1. [Insight 1]\n2. [Insight 2]\n3. [Insight 3]\n\nThe truth? [Contrarian take that adds value].\n\nWhat's your experience with this?",
    category: "social",
    tags: ["linkedin", "thought-leadership", "engagement"],
    performance_notes: "Average 3.2% engagement rate. Best on Tuesdays 8–9am.",
    use_count: 31,
    created_at: "2025-07-20",
  },
  {
    id: "l4",
    title: "Referral Request Email",
    content:
      "Subject: Quick favour — do you know anyone who could use [service]?\n\nHi [Name],\n\nThank you so much for being such an amazing client. Working with you on [project] has been genuinely rewarding.\n\nI'm looking to work with a few more [client type] this quarter. If you know anyone in your network who could benefit from [specific outcome], I'd be grateful for an introduction.\n\nNo pressure at all — just thought I'd ask!\n\nWarm regards,\n[Your Name]",
    category: "email",
    tags: ["referral", "email", "relationship"],
    performance_notes: "Best sent after a major win or project completion.",
    use_count: 12,
    created_at: "2025-09-10",
  },
  {
    id: "l5",
    title: "Instagram Carousel Hook Template",
    content:
      "Slide 1: [Bold statement or number] — e.g. '5 things killing your client retention'\nSlide 2: The problem most [target audience] face\nSlide 3: Mistake #1 + quick fix\nSlide 4: Mistake #2 + quick fix\nSlide 5: Mistake #3 + quick fix\nSlide 6: Your CTA — 'Save this for later' or 'Comment X for the full guide'\n\nCaption: [Hook sentence]. Most [target] make these mistakes without realising it. Drop a 💡 if this helped!\n#[niche] #[audience] #[value]",
    category: "template",
    tags: ["instagram", "carousel", "template"],
    performance_notes: "Carousel posts get 3x reach. Hook must be 5 words max.",
    use_count: 45,
    created_at: "2025-10-01",
  },
  {
    id: "l6",
    title: "Monthly Check-in Message",
    content:
      "Hi [Name]! Just doing my monthly check-in — hope [recent goal/project] is going well. I came across [article/resource] that reminded me of something you mentioned about [their challenge]. Thought you'd find it useful: [link]. Let me know if you'd like to discuss!",
    category: "outreach",
    tags: ["check-in", "value-add", "monthly"],
    performance_notes: "Great for maintaining warm relationships. Low-pressure.",
    use_count: 38,
    created_at: "2025-05-15",
  },
];
