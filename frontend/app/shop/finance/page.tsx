"use client";

import { useMemo, useState } from "react";

type FinanceProduct = {
  id: string;
  sku: string;
  productName: string;
  productType: string;
  subType: string;
  provider: string;
  description: string;
  minInvestmentKes: string;
  expectedReturnPct: string;
  riskLevel: string;
  liquidity: string;
  tenor: string;
  regulatedBy: string;
  bestFor: string;
  targetAgeMin: string;
  targetAgeMax: string;
  created_at: string;
  updated_at: string;
};

const financeProducts: FinanceProduct[] = [
  {
    updated_at: "2026-06-30 08:38:13.132000 UTC",
    targetAgeMin: "18",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "End of tenor",
    expectedReturnPct: "0.095",
    created_at: "2026-06-30 08:38:13.132000 UTC",
    minInvestmentKes: "50000.0",
    tenor: "12 months",
    description:
      "Equity Bank 12-month fixed deposit. KDIC-insured up to KES 500,000. Interest paid at maturity. Good for capital that must be preserved with a guaranteed return.",
    subType: "Term Deposit",
    sku: "WLT-019",
    productName: "Equity Bank Fixed Deposit",
    targetAgeMax: "75",
    productType: "Fixed Deposit",
    provider: "Equity Bank",
    bestFor: "Safety-first, short-term capital preservation",
    id: "23832c3f-da9b-40d6-8d6e-f53bf216915e",
  },
  {
    updated_at: "2026-06-30 08:38:14.199000 UTC",
    targetAgeMin: "18",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "End of tenor",
    expectedReturnPct: "0.09",
    created_at: "2026-06-30 08:38:14.199000 UTC",
    minInvestmentKes: "50000.0",
    tenor: "12 months",
    description:
      "KCB 12-month FD. Negotiable rate for amounts above KES 1M. KDIC-insured. Can be used as collateral for an emergency loan at KCB.",
    subType: "Term Deposit",
    sku: "WLT-020",
    productName: "KCB Bank Fixed Deposit",
    targetAgeMax: "75",
    productType: "Fixed Deposit",
    provider: "KCB Bank",
    bestFor: "Corporate and individual capital parking",
    id: "e486402d-a298-43c1-a415-0ab4b25d1ac4",
  },
  {
    updated_at: "2026-06-30 08:38:10.210000 UTC",
    targetAgeMin: "21",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "End of tenor",
    expectedReturnPct: "0.152",
    created_at: "2026-06-30 08:38:10.210000 UTC",
    minInvestmentKes: "49680.0",
    tenor: "182 days",
    description:
      "Kenya 182-day T-Bill. Better yield than 91-day for slightly longer lock-in. Same minimum. Zero credit risk. Ideal for money not needed for 6 months.",
    subType: "T-Bill",
    sku: "WLT-016",
    productName: "182-Day Treasury Bill",
    targetAgeMax: "75",
    productType: "Government Security",
    provider: "Central Bank of Kenya",
    bestFor: "Medium short-term government savings",
    id: "1fbb86d7-7439-48ab-85ad-53389efee303",
  },
  {
    updated_at: "2026-06-30 08:38:11.126000 UTC",
    targetAgeMin: "21",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "End of tenor",
    expectedReturnPct: "0.156",
    created_at: "2026-06-30 08:38:11.126000 UTC",
    minInvestmentKes: "49680.0",
    tenor: "364 days",
    description:
      "Kenya 364-day T-Bill - highest yield in the T-Bill curve. 1-year lock-in. Minimum KES 50,000 face value. Competitive vs. bank FDs with zero credit risk.",
    subType: "T-Bill",
    sku: "WLT-017",
    productName: "364-Day Treasury Bill",
    targetAgeMax: "75",
    productType: "Government Security",
    provider: "Central Bank of Kenya",
    bestFor: "Individuals seeking best short-term government yield",
    id: "af3e3d14-0c42-468e-9530-f92f074ebd45",
  },
  {
    updated_at: "2026-06-30 08:38:12.223000 UTC",
    targetAgeMin: "25",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "Semi-annual interest (TAX FREE)",
    expectedReturnPct: "0.168",
    created_at: "2026-06-30 08:38:12.223000 UTC",
    minInvestmentKes: "50000.0",
    tenor: "10 years",
    description:
      "Kenya Infrastructure Bond - interest income is TAX FREE. 10-year tenor. Semi-annual coupon payments. Funds earmarked for road, energy, and water infrastructure. Highly sought after by retail investors.",
    subType: "Infrastructure Bond",
    sku: "WLT-018",
    productName: "Infrastructure Bond IFB1/2025/10",
    targetAgeMax: "65",
    productType: "Government Security",
    provider: "National Treasury Kenya",
    bestFor: "Long-term wealth builders, tax-efficient investors",
    id: "df168eef-c603-4c23-a763-9a2a71e78053",
  },
  {
    updated_at: "2026-06-30 08:38:09.189000 UTC",
    targetAgeMin: "21",
    regulatedBy: "CBK",
    riskLevel: "Very Low",
    liquidity: "End of tenor",
    expectedReturnPct: "0.14800000000000002",
    created_at: "2026-06-30 08:38:09.189000 UTC",
    minInvestmentKes: "49680.0",
    tenor: "91 days",
    description:
      "Kenya 91-day T-Bill. Sold at a discount. Minimum purchase one face value unit (KES 50,000 face). Historically 13-16% p.a. equivalent. No default risk. Buy through CBK DhowCSD portal or commercial bank.",
    subType: "T-Bill",
    sku: "WLT-015",
    productName: "91-Day Treasury Bill",
    targetAgeMax: "75",
    productType: "Government Security",
    provider: "Central Bank of Kenya",
    bestFor: "Safety-first investors, idle cash deployment",
    id: "f9db9a68-5fdc-4413-af07-63dc35a0276b",
  },
  {
    updated_at: "2026-06-30 08:38:01.272000 UTC",
    targetAgeMin: "21",
    regulatedBy: "CMA Kenya",
    riskLevel: "Low-Medium",
    liquidity: "Weekly (T+3)",
    expectedReturnPct: "0.114",
    created_at: "2026-06-30 08:38:01.272000 UTC",
    minInvestmentKes: "5000.0",
    tenor: "Open-ended",
    description:
      "Old Mutual's Enhanced Income Fund invests in slightly longer-tenor government securities for a yield premium over standard MMFs. Weekly liquidity. Minimum KES 5,000.",
    subType: "Enhanced Income",
    sku: "WLT-007",
    productName: "Old Mutual Enhanced Income",
    targetAgeMax: "60",
    productType: "MMF",
    provider: "Old Mutual Investment Group",
    bestFor: "Income-oriented investors",
    id: "05240343-2f51-48af-a9c7-d064cfa0739d",
  },
  {
    updated_at: "2026-06-30 08:37:57.561000 UTC",
    targetAgeMin: "25",
    regulatedBy: "CMA Kenya",
    riskLevel: "Medium",
    liquidity: "Weekly (T+5)",
    expectedReturnPct: "0.138",
    created_at: "2026-06-30 08:37:57.561000 UTC",
    minInvestmentKes: "10000.0",
    tenor: "Open-ended",
    description:
      "Cytonn HYF invests in corporate bonds, real estate notes, and structured credit. Higher yield than T-Bill-backed MMFs, with commensurate credit risk. Minimum KES 10,000.",
    subType: "High-Yield",
    sku: "WLT-003",
    productName: "Cytonn High Yield Fund",
    targetAgeMax: "55",
    productType: "MMF",
    provider: "Cytonn Asset Management",
    bestFor: "Investors seeking higher short-term returns",
    id: "211cd525-76b9-4c27-b422-1ee8243b73a5",
  },
  {
    updated_at: "2026-06-30 08:38:00.363000 UTC",
    targetAgeMin: "18",
    regulatedBy: "CMA Kenya",
    riskLevel: "Low",
    liquidity: "Daily (T+1)",
    expectedReturnPct: "0.10300000000000001",
    created_at: "2026-06-30 08:38:00.363000 UTC",
    minInvestmentKes: "1000.0",
    tenor: "Open-ended",
    description:
      "ICEA Lion MMF combines safety and liquidity for professionals managing working capital or emergency savings. Portfolio: 60% government securities, 40% bank placements.",
    subType: "Money Market",
    sku: "WLT-006",
    productName: "ICEA Lion Money Market",
    targetAgeMax: "65",
    productType: "MMF",
    provider: "ICEA Lion Asset Management",
    bestFor: "Professionals, SME working capital",
    id: "49b5a19a-3c35-4c04-86ef-69fb752f77b9",
  },
  {
    updated_at: "2026-06-30 08:37:55.275000 UTC",
    targetAgeMin: "18",
    regulatedBy: "CMA Kenya",
    riskLevel: "Low",
    liquidity: "Daily (T+1)",
    expectedReturnPct: "0.102",
    created_at: "2026-06-30 08:37:55.275000 UTC",
    minInvestmentKes: "1000.0",
    tenor: "Open-ended",
    description:
      "CIC MMF is Kenya's most accessible money market fund. Earn daily interest on savings from KES 1,000. Backed by T-Bills, commercial paper, and bank deposits. Interest paid daily. Withdraw next business day.",
    subType: "Money Market",
    sku: "WLT-001",
    productName: "CIC Money Market Fund",
    targetAgeMax: "65",
    productType: "MMF",
    provider: "CIC Asset Management",
    bestFor: "First-time investors, emergency fund",
    id: "5fffcdaa-e1d9-4817-bf99-c2d3be74321c",
  },
];

const formatKes = (value: string) =>
  `KES ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatReturnPct = (value: string) => `${(Number(value) * 100).toFixed(1)}% p.a.`;

export default function FinancePage() {
  const [activeType, setActiveType] = useState<string>("All");

  const productTypes = useMemo(() => {
    const unique = Array.from(new Set(financeProducts.map((item) => item.productType)));
    return ["All", ...unique];
  }, []);

  const visibleProducts = useMemo(() => {
    if (activeType === "All") {
      return financeProducts;
    }

    return financeProducts.filter((item) => item.productType === activeType);
  }, [activeType]);

  return (
    <section className="space-y-7 pb-8">
      <div className="rounded-3xl border border-emerald-200 bg-[linear-gradient(120deg,#ecfeff_0%,#f0fdf4_45%,#fff7ed_100%)] p-6 md:p-8">
        <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-emerald-700">
          FINANCE PRODUCTS
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Finance
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 md:text-base">
          Explore fixed deposits, treasury bills, bonds, and money market funds with
          different risk levels, tenors, and liquidity profiles.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {productTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeType === type
                ? "bg-emerald-700 text-white"
                : "border border-emerald-200 bg-white text-emerald-900 hover:border-emerald-500"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleProducts.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {item.productType}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {item.riskLevel} risk
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {item.regulatedBy}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-slate-900">{item.productName}</h2>
            <p className="text-sm font-medium text-slate-600">{item.provider}</p>

            <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Expected Return</dt>
                <dd className="font-semibold text-slate-900">{formatReturnPct(item.expectedReturnPct)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Minimum Investment</dt>
                <dd className="font-semibold text-slate-900">{formatKes(item.minInvestmentKes)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Tenor</dt>
                <dd className="font-semibold text-slate-900">{item.tenor}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Liquidity</dt>
                <dd className="font-semibold text-slate-900">{item.liquidity}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-slate-500">
              Best for: <span className="font-medium text-slate-700">{item.bestFor}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Age range: {item.targetAgeMin} - {item.targetAgeMax}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
