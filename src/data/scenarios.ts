import { ShieldAlert, Wallet, TrendingUp, Home, Gift, ArrowUpRight, Briefcase, HeartPulse, Landmark, TrendingDown } from "lucide-react";

export interface Choice {
  text: string;
  score: number;
  feedback: string;
  impact?: number; // financial impact in PKR
  risk?: "low" | "medium" | "high";
}

export interface Step {
  title: string;
  narrative: string;
  choices: Choice[];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lifeStage: string;
  startingBalance: number;
  monthlyIncome: number;
  skills: string[];
  estimatedTime: string;
  steps: Step[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "emergency-fund",
    title: "Emergency Fund Crisis",
    description: "Your car breaks down and you need Rs 600,000 for repairs. Navigate this unexpected expense.",
    icon: ShieldAlert,
    difficulty: "Beginner",
    lifeStage: "First Job",
    startingBalance: 800000,
    monthlyIncome: 1050000,
    skills: ["Emergency Fund", "Debt Management", "Savings"],
    estimatedTime: "~5 min",
    steps: [
      {
        title: "The Breakdown",
        narrative: "It's a Monday morning. You turn the key and nothing happens. The mechanic takes a long look and says repairs will cost Rs 600,000. You need this car for your daily commute. Your bank account shows Rs 800,000. Rent is due in two weeks.",
        choices: [
          { text: "Use my emergency fund to cover it immediately", score: 10, feedback: "Excellent! This is exactly what emergency funds are for. You avoid debt and stress.", impact: -600000, risk: "low" },
          { text: "Put it on a credit card and pay it off over time", score: 4, feedback: "This works short-term but you'll pay interest. Credit card rates average 20%+.", impact: -600000, risk: "high" },
          { text: "Take out a payday loan to cover it quickly", score: 1, feedback: "Payday loans have extremely high interest rates (400%+ APR). This is very costly.", impact: -600000, risk: "high" },
          { text: "Ask family or friends to lend you the money", score: 6, feedback: "This avoids interest but can strain relationships. It's better than high-interest debt.", impact: -600000, risk: "medium" },
        ],
      },
      {
        title: "Rebuilding Savings",
        narrative: "The car is fixed and running. But your savings took a hit. Your monthly take-home is Rs 1,050,000 and you're looking at your depleted account. How do you rebuild?",
        choices: [
          { text: "Set up an automatic transfer of Rs 90,000/month to savings", score: 10, feedback: "Automating savings is the most effective strategy. You'll rebuild in about 7 months.", impact: 90000, risk: "low" },
          { text: "Cut all non-essential spending until fully rebuilt", score: 6, feedback: "While effective short-term, extreme restriction often leads to burnout and overspending.", impact: 150000, risk: "medium" },
          { text: "Save whatever is left at the end of each month", score: 3, feedback: "Without a plan, leftover savings rarely materialize. Pay yourself first!", impact: 20000, risk: "medium" },
          { text: "Wait until you get a raise to start saving again", score: 1, feedback: "Delaying means you're unprotected longer. Start small now rather than waiting.", impact: 0, risk: "high" },
        ],
      },
      {
        title: "Prevention Planning",
        narrative: "You're back on track. Now you're thinking about the future. What's your long-term strategy to make sure a car repair never rattles you again?",
        choices: [
          { text: "Build a 3-6 month emergency fund and maintain it", score: 10, feedback: "The gold standard! 3-6 months of expenses gives you a solid safety net.", impact: 0, risk: "low" },
          { text: "Get better insurance coverage for your car", score: 6, feedback: "Good thinking, but insurance doesn't cover all repairs. You still need liquid savings.", impact: -5000, risk: "low" },
          { text: "Keep Rs 15,000 in a jar at home for emergencies", score: 3, feedback: "Rs 15,000 is a start but won't cover major expenses. Aim higher and keep it in a savings account.", impact: 0, risk: "medium" },
          { text: "Hope nothing bad happens again", score: 0, feedback: "Unfortunately, emergencies are inevitable. Planning is essential for financial stability.", impact: 0, risk: "high" },
        ],
      },
    ],
  },
  {
    id: "first-budget",
    title: "Your First Budget",
    description: "You just landed your first full-time job earning Rs 1,200,000/month. Create a budget from scratch.",
    icon: Wallet,
    difficulty: "Beginner",
    lifeStage: "Fresh Graduate",
    startingBalance: 50000,
    monthlyIncome: 1200000,
    skills: ["Budgeting", "Lifestyle Management", "Savings"],
    estimatedTime: "~8 min",
    steps: [
      {
        title: "Setting Up",
        narrative: "Congratulations! Your first paycheck just hit — Rs 1,200,000 sitting in your account. It's more money than you've ever seen at once. Your phone buzzes with dinner invitations from friends. What's your first move?",
        choices: [
          { text: "List all expenses and create a 50/30/20 budget", score: 10, feedback: "The 50/30/20 rule is a proven framework: 50% needs, 30% wants, 20% savings.", impact: 0, risk: "low" },
          { text: "Spend freely for a month to see where money goes", score: 3, feedback: "Tracking is good, but spending without limits means you'll likely overspend first.", impact: -200000, risk: "high" },
          { text: "Save everything and live as cheaply as possible", score: 5, feedback: "Admirable but unsustainable. Balance is key to a budget you can maintain.", impact: 0, risk: "medium" },
          { text: "Focus on paying bills and figure out the rest later", score: 2, feedback: "Bills are important, but without a full plan, discretionary spending will eat your income.", impact: -100000, risk: "medium" },
        ],
      },
      {
        title: "Housing Decision",
        narrative: "You're apartment hunting. Options range from Rs 240,000 to Rs 480,000/month. The nicer ones are closer to work but burn through your income faster. Your friends are pushing for the luxury option. What do you choose?",
        choices: [
          { text: "Rs 300,000/month — comfortable but leaves room for savings", score: 10, feedback: "25% of income on housing is ideal. You have plenty left for other goals.", impact: -300000, risk: "low" },
          { text: "Rs 240,000/month — cheapest option, further from work", score: 7, feedback: "Great for savings, but factor in commute costs and time. Still a solid choice.", impact: -240000, risk: "low" },
          { text: "Rs 420,000/month — nice place, close to everything", score: 4, feedback: "35% of income on housing is high. It limits your ability to save and handle surprises.", impact: -420000, risk: "medium" },
          { text: "Rs 480,000/month — luxury apartment with amenities", score: 1, feedback: "40% on housing is risky. One unexpected expense could put you in debt.", impact: -480000, risk: "high" },
        ],
      },
      {
        title: "Lifestyle Choices",
        narrative: "After covering rent and necessities, you have Rs 660,000 left. Every weekend your friends are going out — dinners, shisha cafés, shopping. The FOMO is real. How do you balance fun and finances?",
        choices: [
          { text: "Set a Rs 120,000 fun budget and save Rs 240,000+ each month", score: 10, feedback: "Setting a fun budget lets you enjoy life while building wealth. Smart balance!", impact: 240000, risk: "low" },
          { text: "Go out every weekend — you only live once", score: 2, feedback: "YOLO spending feels good now but leaves you vulnerable and delays financial goals.", impact: -300000, risk: "high" },
          { text: "Never go out — save every penny", score: 4, feedback: "While financially aggressive, social isolation isn't sustainable. Budget for fun.", impact: 500000, risk: "medium" },
          { text: "Alternate — go out every other weekend", score: 7, feedback: "Good compromise! You're still spending less while maintaining a social life.", impact: 180000, risk: "low" },
        ],
      },
      {
        title: "Unexpected Windfall",
        narrative: "You receive a Rs 600,000 tax refund! The money is just sitting in your account. A friend suggests crypto. Your parents say save it all. What do you do?",
        choices: [
          { text: "Split it: 50% emergency fund, 30% debt, 20% treat", score: 10, feedback: "Balanced approach! You strengthen finances while rewarding yourself.", impact: 480000, risk: "low" },
          { text: "Put it all in savings", score: 7, feedback: "Financially sound but allowing yourself a small reward helps maintain motivation.", impact: 600000, risk: "low" },
          { text: "Spend it on a vacation — you've earned it", score: 3, feedback: "A vacation is nice, but early in your career, building savings is more impactful.", impact: -600000, risk: "medium" },
          { text: "Invest it all in cryptocurrency", score: 1, feedback: "High-risk investments with money you may need is gambling, not investing.", impact: 0, risk: "high" },
        ],
      },
    ],
  },
  {
    id: "investment-journey",
    title: "Investment Starter",
    description: "You have Rs 1,500,000 to invest for the first time. Navigate the world of investing.",
    icon: TrendingUp,
    difficulty: "Intermediate",
    lifeStage: "Young Professional",
    startingBalance: 1500000,
    monthlyIncome: 1800000,
    skills: ["Investing", "Risk Management", "Market Knowledge"],
    estimatedTime: "~5 min",
    steps: [
      {
        title: "Getting Started",
        narrative: "You've saved Rs 1,500,000 and the money's been sitting in your checking account earning nothing. Inflation is eating away at it. You want to start investing. But first — what should you check?",
        choices: [
          { text: "Ensure I have an emergency fund and no high-interest debt", score: 10, feedback: "Perfect! Investing before having a safety net or while paying 20%+ interest is risky.", impact: 0, risk: "low" },
          { text: "Research which stocks are trending right now", score: 3, feedback: "Chasing trends is speculative, not investing. Fundamentals matter more.", impact: 0, risk: "high" },
          { text: "Ask friends what they're investing in", score: 2, feedback: "Friends' situations differ from yours. What works for them may not work for you.", impact: 0, risk: "medium" },
          { text: "Put it all in immediately to avoid missing gains", score: 1, feedback: "FOMO-driven investing often leads to buying high. Preparation prevents costly mistakes.", impact: 0, risk: "high" },
        ],
      },
      {
        title: "Choosing Your Approach",
        narrative: "You're 25 and won't need this money for 20+ years. Your risk tolerance is moderate. The KSE-100 has averaged ~12% annual returns historically. What strategy do you choose?",
        choices: [
          { text: "Diversified mutual funds with low fees", score: 10, feedback: "Mutual funds offer broad market exposure with minimal fees. The smart long-term approach!", impact: 180000, risk: "low" },
          { text: "Pick individual stocks of companies I like", score: 4, feedback: "Stock picking is risky and most professionals can't beat the market consistently.", impact: 0, risk: "high" },
          { text: "All in on one high-growth tech stock", score: 1, feedback: "Concentrating in one stock is extremely risky. If it drops 50%, you lose half your money.", impact: -750000, risk: "high" },
          { text: "Keep it all in a savings account — investing is too risky", score: 3, feedback: "Savings accounts lose value to inflation over time. Some investment risk is necessary for growth.", impact: -90000, risk: "medium" },
        ],
      },
      {
        title: "Market Downturn",
        narrative: "Three months later, the KSE-100 drops 15%. Your Rs 1,500,000 is now worth Rs 1,275,000. Your WhatsApp group is panicking. Everyone is selling. What do you do?",
        choices: [
          { text: "Stay the course — downturns are normal over 20 years", score: 10, feedback: "Markets have always recovered over long periods. Staying invested is key to long-term growth.", impact: 0, risk: "low" },
          { text: "Sell everything to prevent further losses", score: 1, feedback: "Selling during a downturn locks in your losses. You'd miss the recovery.", impact: -225000, risk: "high" },
          { text: "Invest more while prices are lower", score: 8, feedback: "Buying the dip is smart if you have the funds! You're getting more units at a discount.", impact: 300000, risk: "medium" },
          { text: "Move everything to prize bonds for safety", score: 3, feedback: "At 25 with a 20-year horizon, you have time to recover. Prize bonds won't grow enough.", impact: -50000, risk: "medium" },
        ],
      },
    ],
  },
  {
    id: "housing-decision",
    title: "Rent vs. Buy",
    description: "You're considering buying your first home. Make smart decisions about this major purchase.",
    icon: Home,
    difficulty: "Advanced",
    lifeStage: "Young Family",
    startingBalance: 9000000,
    monthlyIncome: 1800000,
    skills: ["Property", "Mortgage Planning", "Long-term Strategy"],
    estimatedTime: "~5 min",
    steps: [
      {
        title: "The Big Question",
        narrative: "You earn Rs 1,800,000/month and have Rs 9,000,000 saved. Rent is Rs 450,000/month. A house you like costs Rs 75,000,000. Your family is pressuring you to buy. What's your first consideration?",
        choices: [
          { text: "Calculate total costs of ownership vs renting long-term", score: 10, feedback: "Smart! Owning includes mortgage, taxes, insurance, maintenance. Compare the full picture.", impact: 0, risk: "low" },
          { text: "Buy immediately — renting is throwing money away", score: 2, feedback: "Rent isn't wasted — it buys flexibility and zero maintenance costs. Buying isn't always better.", impact: 0, risk: "high" },
          { text: "Keep renting — buying is too much responsibility", score: 5, feedback: "Renting can be smart, but dismissing ownership entirely means missing potential benefits.", impact: 0, risk: "medium" },
          { text: "Buy the most expensive house I can get approved for", score: 1, feedback: "Banks approve more than you can comfortably afford. Being house-poor is stressful.", impact: 0, risk: "high" },
        ],
      },
      {
        title: "Down Payment Strategy",
        narrative: "You decide to work toward buying. You have Rs 9,000,000 saved. The recommended down payment is 20% (Rs 15,000,000). What's your plan?",
        choices: [
          { text: "Save more until I have 20% plus an emergency fund", score: 10, feedback: "20% down avoids PMI and keeps you financially safe.", impact: 0, risk: "low" },
          { text: "Put down 10% now and pay PMI", score: 6, feedback: "Viable if the market is right, but PMI adds cost. Make sure you can still save.", impact: -9000000, risk: "medium" },
          { text: "Use all Rs 9,000,000 as down payment with a smaller loan", score: 3, feedback: "Using all savings for a down payment leaves you with no emergency buffer. Risky!", impact: -9000000, risk: "high" },
          { text: "Borrow from my retirement account for the down payment", score: 2, feedback: "Raiding retirement has penalties and taxes, plus you lose years of compound growth.", impact: -9000000, risk: "high" },
        ],
      },
      {
        title: "Making an Offer",
        narrative: "You've saved enough. In a competitive market, a seller has multiple offers on a Rs 75,000,000 home. The realtor is pushing you to bid higher. What's your approach?",
        choices: [
          { text: "Offer asking price with a home inspection contingency", score: 10, feedback: "Fair price with protection. Never skip the inspection — hidden issues can cost millions.", impact: -75000000, risk: "low" },
          { text: "Offer Rs 84,000,000 to guarantee you win the bid", score: 2, feedback: "Overbidding 12% means you start with negative equity. Patience finds better deals.", impact: -84000000, risk: "high" },
          { text: "Waive all contingencies to make your offer attractive", score: 1, feedback: "Waiving inspection is extremely risky. You could inherit huge hidden problems.", impact: -75000000, risk: "high" },
          { text: "Offer below asking and be prepared to walk away", score: 7, feedback: "In a hot market this may not work, but knowing your limit is financially disciplined.", impact: -70000000, risk: "medium" },
        ],
      },
    ],
  },
  // --- New Pakistan-Specific Scenarios ---
  {
    id: "eid-expenses",
    title: "Eid is Coming",
    description: "Manage Eid expenses, gifts, and family obligations on your fixed salary without going broke.",
    icon: Gift,
    difficulty: "Beginner",
    lifeStage: "First Job",
    startingBalance: 150000,
    monthlyIncome: 120000,
    skills: ["Budgeting", "Family Finance", "Planning"],
    estimatedTime: "~6 min",
    steps: [
      {
        title: "Eid Planning",
        narrative: "Eid is three weeks away. Your family expects new clothes for everyone (Rs 40,000), gifts for younger cousins (Rs 15,000), Eidi money (Rs 20,000), and special food (Rs 25,000). That's Rs 100,000 — almost your entire monthly salary. Your bank balance is Rs 150,000.",
        choices: [
          { text: "Set a total Eid budget of Rs 60,000 and communicate limits to family", score: 10, feedback: "Setting clear boundaries while still celebrating is the mature financial move. Your family will understand.", impact: -60000, risk: "low" },
          { text: "Spend the full Rs 100,000 — it's Eid, you can't be stingy", score: 3, feedback: "Cultural pressure is real, but spending almost everything leaves you exposed to any unexpected expense.", impact: -100000, risk: "high" },
          { text: "Skip Eid celebrations entirely to save money", score: 4, feedback: "While financially safe, completely skipping cultural celebrations can harm relationships. Find a middle ground.", impact: 0, risk: "medium" },
          { text: "Borrow Rs 50,000 from a friend to cover everything properly", score: 2, feedback: "Starting the month after Eid in debt is a terrible way to begin. Celebrate within your means.", impact: -100000, risk: "high" },
        ],
      },
      {
        title: "Shopping Strategy",
        narrative: "You've set your Eid budget. Now you're at the market. Branded clothes cost 3x what bazaar options cost. Your siblings will definitely notice the difference. What's your approach?",
        choices: [
          { text: "Mix branded and bazaar items — one nice outfit each, rest from bazaar", score: 10, feedback: "Smart compromise! One quality piece makes an outfit look premium without the premium price.", impact: -35000, risk: "low" },
          { text: "All branded — quality matters and people will notice", score: 2, feedback: "Brand loyalty on a tight budget is a fast track to financial stress. Nobody checks your labels at namaz.", impact: -80000, risk: "high" },
          { text: "All bazaar — save the maximum amount", score: 7, feedback: "Practical choice! Local markets have great options. Your wallet will thank you.", impact: -20000, risk: "low" },
          { text: "Buy online during Eid sales for the best discounts", score: 8, feedback: "Sales and discounts are smart! Just watch out for delivery timing before Eid.", impact: -25000, risk: "low" },
        ],
      },
      {
        title: "After Eid Reality",
        narrative: "Eid was wonderful. But now it's the 5th of the new month and your rent (Rs 30,000) is due. You look at your balance and it's lower than expected. How do you recover?",
        choices: [
          { text: "Create a strict 2-week recovery budget — bare minimum spending", score: 10, feedback: "A short-term recovery plan is the fastest way to get back on track without long-term pain.", impact: 30000, risk: "low" },
          { text: "Use a credit card for rent and pay it back with next salary", score: 4, feedback: "This starts a dangerous cycle. One month of credit card rent can snowball into persistent debt.", impact: -30000, risk: "high" },
          { text: "Start planning for next Eid now — save Rs 8,000/month in an Eid fund", score: 10, feedback: "Brilliant! Planning ahead means next Eid won't impact your finances at all. This is financial maturity.", impact: 8000, risk: "low" },
          { text: "It'll sort itself out — payday is only 3 weeks away", score: 2, feedback: "Hoping for the best without a plan is how small problems become big ones.", impact: 0, risk: "high" },
        ],
      },
    ],
  },
  {
    id: "salary-raise",
    title: "You Got a Raise!",
    description: "Your salary just went up by Rs 20,000/month. Decide how to allocate this increase wisely.",
    icon: ArrowUpRight,
    difficulty: "Beginner",
    lifeStage: "Young Professional",
    startingBalance: 200000,
    monthlyIncome: 140000,
    skills: ["Budgeting", "Investing", "Lifestyle Design"],
    estimatedTime: "~5 min",
    steps: [
      {
        title: "The Good News",
        narrative: "Your manager just told you — you're getting a Rs 20,000/month raise! Your new salary is Rs 140,000. Friends are already suggesting a bigger apartment and new phone. What's your first move?",
        choices: [
          { text: "Keep my lifestyle the same and allocate the full Rs 20,000 to savings/investments", score: 10, feedback: "Lifestyle creep is the #1 wealth killer. Saving 100% of raises is how ordinary people build extraordinary wealth.", impact: 20000, risk: "low" },
          { text: "Split 50/50 — Rs 10,000 to savings, Rs 10,000 to lifestyle upgrade", score: 7, feedback: "Good balance! You improve your life and your finances at the same time.", impact: 10000, risk: "low" },
          { text: "Upgrade my lifestyle — I deserve it after working hard", score: 3, feedback: "You do deserve it, but lifestyle creep means you'll always need the next raise to feel comfortable.", impact: -20000, risk: "medium" },
          { text: "Celebrate with a big purchase — new phone on installments", score: 2, feedback: "A raise should make you wealthier, not add new monthly obligations. Installments eat future raises.", impact: -5000, risk: "high" },
        ],
      },
      {
        title: "Investment Choice",
        narrative: "You've decided to save at least Rs 10,000/month from your raise. Where should this money go? You already have a basic savings account.",
        choices: [
          { text: "Open a mutual fund account with auto-deposit", score: 10, feedback: "Mutual funds in Pakistan offer better returns than savings accounts with professional management. Great choice!", impact: 12000, risk: "low" },
          { text: "Buy prize bonds — maybe I'll win big", score: 3, feedback: "Prize bonds offer no guaranteed return. The expected value is lower than a savings account.", impact: 0, risk: "medium" },
          { text: "Keep it in my savings account for easy access", score: 5, feedback: "Safe but inflation erodes your purchasing power. At least use a high-yield savings account.", impact: 5000, risk: "low" },
          { text: "Give it to a friend who trades forex — he says 30% returns", score: 1, feedback: "Unregulated forex trading through friends is how people lose everything. If it sounds too good, it is.", impact: -10000, risk: "high" },
        ],
      },
      {
        title: "Six Months Later",
        narrative: "It's been 6 months since your raise. You review your finances. If you saved Rs 10,000/month, you now have Rs 60,000 extra. A colleague suggests putting it all into a friend's 'business opportunity'. Another suggests Zakat-eligible investments.",
        choices: [
          { text: "Continue the systematic investment plan — compound growth takes time", score: 10, feedback: "Patience is the most underrated financial skill. At 12% annual returns, this grows dramatically over time.", impact: 60000, risk: "low" },
          { text: "Invest in the colleague's business opportunity — high returns promised", score: 2, feedback: "Most informal 'business opportunities' fail or are scams. Never invest money you can't afford to lose.", impact: -60000, risk: "high" },
          { text: "Withdraw it all and buy gold — it always goes up", score: 4, feedback: "Gold is a hedge, not a growth investment. It barely beats inflation long-term.", impact: 0, risk: "medium" },
          { text: "Split between Zakat-eligible mutual funds and emergency savings", score: 9, feedback: "Beautiful financial planning — you're growing wealth while fulfilling religious obligations.", impact: 60000, risk: "low" },
        ],
      },
    ],
  },
  {
    id: "small-business",
    title: "Starting a Small Business",
    description: "You have Rs 500,000 to start a small business. Allocate capital wisely across inventory, rent, marketing, and reserves.",
    icon: Briefcase,
    difficulty: "Advanced",
    lifeStage: "Entrepreneur",
    startingBalance: 500000,
    monthlyIncome: 0,
    skills: ["Business Finance", "Risk Management", "Capital Allocation"],
    estimatedTime: "~8 min",
    steps: [
      {
        title: "Capital Allocation",
        narrative: "You've saved Rs 500,000 and are ready to launch a small food delivery business from home. You need to split this between inventory (ingredients/packaging), marketing, equipment, and an emergency reserve. How do you allocate?",
        choices: [
          { text: "40% inventory, 20% marketing, 20% equipment, 20% reserve", score: 10, feedback: "Balanced allocation with a healthy reserve. Most businesses fail from running out of cash, not from lack of sales.", impact: -400000, risk: "low" },
          { text: "70% inventory, 20% marketing, 10% equipment, 0% reserve", score: 3, feedback: "No reserve means one slow week or equipment breakdown could end your business.", impact: -500000, risk: "high" },
          { text: "30% each on inventory and marketing, 30% equipment, 10% reserve", score: 6, feedback: "Heavy marketing spend is good for awareness but you need product to sell first.", impact: -450000, risk: "medium" },
          { text: "Go all-in on inventory — if the product is good, people will come", score: 2, feedback: "'Build it and they will come' rarely works. Marketing is essential for any new business.", impact: -500000, risk: "high" },
        ],
      },
      {
        title: "First Month Results",
        narrative: "Month 1 results: Revenue Rs 180,000, Costs Rs 120,000, Profit Rs 60,000. Not bad! A commercial kitchen space becomes available for Rs 40,000/month that would let you scale up 3x. Do you take it?",
        choices: [
          { text: "Wait 2 more months to validate demand before committing to rent", score: 10, feedback: "One good month isn't a trend. Validating demand before scaling is how smart entrepreneurs operate.", impact: 60000, risk: "low" },
          { text: "Take it immediately — you need to scale while momentum is hot", score: 4, feedback: "Fixed costs kill startups. Adding Rs 40,000/month rent means you need consistent revenue to survive.", impact: -40000, risk: "high" },
          { text: "Negotiate a 3-month trial period at reduced rent", score: 8, feedback: "Excellent negotiation thinking! Reducing risk while testing scalability is smart business.", impact: -25000, risk: "low" },
          { text: "Skip the kitchen and invest the profit in more marketing instead", score: 5, feedback: "Marketing without capacity to deliver more orders creates disappointed customers.", impact: -60000, risk: "medium" },
        ],
      },
      {
        title: "Crisis Point",
        narrative: "Month 3: A food safety inspection finds a minor issue. You need to invest Rs 80,000 in equipment upgrades or face shutdown. Your business account has Rs 120,000. This will cut deep into your operating capital.",
        choices: [
          { text: "Fix it immediately from reserves — compliance is non-negotiable", score: 10, feedback: "This is why reserves exist. Health compliance protects your customers and your business reputation.", impact: -80000, risk: "low" },
          { text: "Take a small business loan to cover it and preserve cash", score: 6, feedback: "Debt for compliance isn't ideal but preserves working capital. Watch the interest rate.", impact: -80000, risk: "medium" },
          { text: "Do the minimum fix and hope they don't check again", score: 1, feedback: "Cutting corners on food safety can lead to fines, lawsuits, or someone getting sick. Never worth it.", impact: -20000, risk: "high" },
          { text: "Shut down temporarily until you can save up for proper fixes", score: 4, feedback: "Shutting down loses momentum and customers. But it's better than operating unsafely.", impact: -80000, risk: "medium" },
        ],
      },
    ],
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency",
    description: "A family member needs urgent treatment costing Rs 300,000. Navigate insurance, loans, and savings.",
    icon: HeartPulse,
    difficulty: "Intermediate",
    lifeStage: "Young Family",
    startingBalance: 400000,
    monthlyIncome: 150000,
    skills: ["Emergency Planning", "Insurance", "Family Finance"],
    estimatedTime: "~6 min",
    steps: [
      {
        title: "The Emergency",
        narrative: "Your father calls at 2 AM. Your mother has been rushed to the hospital. The doctor says she needs surgery that will cost Rs 300,000. Your savings account shows Rs 400,000. Your family is looking to you. What do you do first?",
        choices: [
          { text: "Check if parents have health insurance and what it covers", score: 10, feedback: "Always check insurance coverage first. Many Pakistani families have employer health benefits they never use.", impact: 0, risk: "low" },
          { text: "Transfer Rs 300,000 immediately — time is critical", score: 6, feedback: "Your mother's health comes first, but checking insurance could save you most of this amount.", impact: -300000, risk: "medium" },
          { text: "Start a GoFundMe or ask family members to chip in", score: 4, feedback: "Crowdfunding takes time you may not have. It's good as a supplement but not a primary plan.", impact: 0, risk: "medium" },
          { text: "Ask the hospital about payment plans or government schemes", score: 8, feedback: "Many hospitals offer payment plans, and Pakistan has government health programs. Smart to explore options.", impact: 0, risk: "low" },
        ],
      },
      {
        title: "Managing the Cost",
        narrative: "Insurance covers 60% — Rs 180,000. You still need Rs 120,000. Your mother is in surgery and recovering well. How do you handle the remaining cost?",
        choices: [
          { text: "Pay from savings — this is what emergency funds are for", score: 10, feedback: "Perfect use of emergency savings. You still have Rs 280,000 left in your account.", impact: -120000, risk: "low" },
          { text: "Split with siblings equally", score: 8, feedback: "Fair and practical. Sharing family responsibilities strengthens bonds and reduces individual burden.", impact: -40000, risk: "low" },
          { text: "Put it on a credit card — deal with it later", score: 3, feedback: "Credit card debt at 20%+ interest on a medical bill creates compounding financial stress.", impact: -120000, risk: "high" },
          { text: "Ask the hospital for a discount — many offer one for upfront payment", score: 7, feedback: "Hospital bill negotiation is real and common in Pakistan. Always ask — worst they can say is no.", impact: -90000, risk: "low" },
        ],
      },
      {
        title: "Prevention for the Future",
        narrative: "Your mother is recovering well. This experience shook the family. You realize nobody in your family has proper health insurance or a medical emergency fund. What's your next step?",
        choices: [
          { text: "Research and buy family health insurance (Takaful) — Rs 5,000/month", score: 10, feedback: "Takaful (Islamic insurance) gives you Shariah-compliant coverage. Rs 60,000/year vs Rs 300,000+ emergencies is obvious.", impact: -5000, risk: "low" },
          { text: "Start a family medical emergency fund — everyone contributes monthly", score: 8, feedback: "A family fund builds solidarity and financial resilience. Great cultural approach to a common problem.", impact: -3000, risk: "low" },
          { text: "Just save more in your personal account — insurance is a waste", score: 3, feedback: "Self-insuring works until the bill exceeds your savings. Insurance is about transferring catastrophic risk.", impact: 0, risk: "high" },
          { text: "Don't worry about it — this was a one-time thing", score: 1, feedback: "Medical emergencies are not one-time events. Statistically, a family will face multiple health crises.", impact: 0, risk: "high" },
        ],
      },
    ],
  },
  {
    id: "first-investment",
    title: "Investing Your First Rs 100,000",
    description: "Choose between savings accounts, prize bonds, mutual funds, and stocks with your first real investment.",
    icon: Landmark,
    difficulty: "Intermediate",
    lifeStage: "Young Professional",
    startingBalance: 100000,
    monthlyIncome: 130000,
    skills: ["Investing", "Risk Assessment", "Pakistan Markets"],
    estimatedTime: "~6 min",
    steps: [
      {
        title: "The Options",
        narrative: "You've finally saved Rs 100,000 beyond your emergency fund. It's sitting in your current account earning nothing. You've researched four options: savings account (7% return), prize bonds (lottery-based), mutual funds (10-14% historical), and direct stocks. What do you choose?",
        choices: [
          { text: "Split across mutual funds (70%) and high-yield savings (30%)", score: 10, feedback: "Diversification with a growth tilt is textbook smart. The 30% liquid portion gives you flexibility.", impact: 12000, risk: "low" },
          { text: "All in prize bonds — if I win, it's tax-free", score: 2, feedback: "Prize bonds have an expected return below inflation. You're essentially playing lottery with your savings.", impact: -5000, risk: "high" },
          { text: "Keep all in savings account — I can't risk losing it", score: 5, feedback: "Safe but inflation at ~25% means you're actually losing purchasing power every year.", impact: -15000, risk: "medium" },
          { text: "Buy stocks directly — I've been watching market trends", score: 4, feedback: "Direct stock picking requires deep expertise. Most retail investors underperform index funds.", impact: 0, risk: "high" },
        ],
      },
      {
        title: "Choosing a Fund",
        narrative: "You decide to invest in mutual funds. Your bank offers three options: a money market fund (8% return, very safe), a balanced fund (12% return, moderate risk), and an equity fund (16% potential return, high volatility). Where do you put your Rs 70,000?",
        choices: [
          { text: "Balanced fund — moderate risk matches my experience level", score: 10, feedback: "Perfect for a first-time investor. Balanced funds give you equity exposure with built-in diversification.", impact: 8400, risk: "low" },
          { text: "Equity fund — I'm young, I can handle volatility", score: 7, feedback: "Aggressive but valid for a long horizon. Just don't panic-sell during downturns.", impact: 11200, risk: "medium" },
          { text: "Money market fund — I want guaranteed returns", score: 5, feedback: "Safe choice but barely beats inflation. You're leaving growth on the table.", impact: 5600, risk: "low" },
          { text: "Split equally across all three for maximum diversification", score: 8, feedback: "Good instinct on diversification! Though a balanced fund already gives you that mix internally.", impact: 8400, risk: "low" },
        ],
      },
      {
        title: "Three Months Later",
        narrative: "Your balanced fund is up 4% (Rs 2,800 gain). A colleague tells you about a 'guaranteed' crypto opportunity promising 50% returns in a month. Your WhatsApp group is buzzing about it. Rs 70,000 is in the fund. What do you do?",
        choices: [
          { text: "Ignore it completely — if it sounds too good to be true, it is", score: 10, feedback: "Crypto scams are rampant in Pakistan. The SECP has warned against exactly these schemes. You protected yourself.", impact: 0, risk: "low" },
          { text: "Move Rs 20,000 into crypto — small amount, limited risk", score: 3, feedback: "Even small amounts in scams are lost forever. 'Limited risk' with unregulated crypto is an illusion.", impact: -20000, risk: "high" },
          { text: "Move everything into crypto — the returns are too good to ignore", score: 0, feedback: "This is how people lose their life savings. The entire 'opportunity' disappeared next month — a classic Ponzi scheme.", impact: -70000, risk: "high" },
          { text: "Report it to friends as a potential scam and warn them", score: 9, feedback: "Not only did you protect yourself, you helped protect others. Financial literacy spreads through community.", impact: 0, risk: "low" },
        ],
      },
    ],
  },
  {
    id: "inflation-month",
    title: "Inflation Month",
    description: "Your usual expenses cost 20% more this month. What do you cut and how do you adapt?",
    icon: TrendingDown,
    difficulty: "Intermediate",
    lifeStage: "First Job",
    startingBalance: 80000,
    monthlyIncome: 120000,
    skills: ["Budgeting", "Adaptation", "Priority Setting"],
    estimatedTime: "~6 min",
    steps: [
      {
        title: "The Price Shock",
        narrative: "You go to buy your usual monthly groceries and the bill is Rs 36,000 instead of Rs 30,000. Petrol is up 15%. Your electricity bill jumped Rs 4,000. Overall, your monthly costs are up Rs 18,000 this month. Your salary hasn't changed. What's your first reaction?",
        choices: [
          { text: "Review my entire budget and find Rs 18,000 in cuts", score: 10, feedback: "Proactive budgeting is the only real defense against inflation. You adapt before the situation becomes a crisis.", impact: 0, risk: "low" },
          { text: "Dip into savings for the Rs 18,000 difference this month", score: 4, feedback: "Using savings for recurring cost increases is unsustainable. What about next month?", impact: -18000, risk: "medium" },
          { text: "Put the extra expenses on credit card and hope prices go back down", score: 2, feedback: "Inflation rarely reverses. Credit card debt on regular expenses compounds rapidly.", impact: -18000, risk: "high" },
          { text: "Ignore it — one month won't matter", score: 1, feedback: "Inflation is persistent by nature. Ignoring it means your financial situation degrades month after month.", impact: -18000, risk: "high" },
        ],
      },
      {
        title: "Making Cuts",
        narrative: "You need to find Rs 18,000 in savings from your current spending. You look at your budget categories: Entertainment (Rs 15,000), Dining Out (Rs 12,000), Subscriptions (Rs 5,000), Transport (Rs 20,000). Where do you cut?",
        choices: [
          { text: "Cut dining out by Rs 8,000 and entertainment by Rs 6,000, cancel 2 subscriptions", score: 10, feedback: "Smart proportional cuts across multiple categories. You're still living a life, just being smarter about it.", impact: 18000, risk: "low" },
          { text: "Eliminate entertainment entirely — need to get serious", score: 5, feedback: "Total elimination leads to burnout. Reduce, don't eliminate, to maintain this long-term.", impact: 15000, risk: "medium" },
          { text: "Switch to a motorcycle to save Rs 12,000 on fuel", score: 7, feedback: "Practical transport change! Just factor in weather, safety, and whether it works for your commute.", impact: 12000, risk: "low" },
          { text: "Ask for a raise — my expenses went up so my salary should too", score: 4, feedback: "You should negotiate salary, but it takes time. You need immediate budget fixes while you pursue that.", impact: 0, risk: "medium" },
        ],
      },
      {
        title: "Long-term Inflation Strategy",
        narrative: "Inflation isn't going away. Prices have been rising 20-30% annually in Pakistan. Your Rs 120,000 salary buys less every month. How do you protect yourself long-term?",
        choices: [
          { text: "Upskill to increase earning power and invest in inflation-beating assets", score: 10, feedback: "The only real defense: grow income faster than inflation and invest in assets that beat it (equity, real estate, gold).", impact: 30000, risk: "low" },
          { text: "Switch to buying everything in bulk when prices are low", score: 6, feedback: "Bulk buying is a tactic, not a strategy. It helps on groceries but doesn't solve the structural problem.", impact: 5000, risk: "low" },
          { text: "Keep all money in cash — at least I know what I have", score: 1, feedback: "Cash loses value fastest during inflation. Rs 100,000 today buys Rs 75,000 worth of goods next year.", impact: -25000, risk: "high" },
          { text: "Start a side hustle to create a second income stream", score: 9, feedback: "Multiple income streams are the best inflation hedge. Even Rs 20,000/month extra changes everything.", impact: 20000, risk: "low" },
        ],
      },
    ],
  },
];
