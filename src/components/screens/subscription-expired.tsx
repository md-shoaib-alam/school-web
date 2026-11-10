"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { useTenantMetadata } from "@/lib/graphql/hooks/platform.hooks";
import { SCHOOL_PLANS } from "@/lib/billing-constants";
import { CreditCard, Calendar, CalendarClock } from "lucide-react";

interface SubscriptionExpiredScreenProps {
  tenantName: string;
  tenantSlug: string;
  role: string;
  endDate?: string | null;
  status?: string;
  plan?: string | null;
}

export function SubscriptionExpiredScreen({
  tenantName,
  tenantSlug,
  role,
  endDate,
  status,
  plan,
}: SubscriptionExpiredScreenProps) {
  const { push } = useRouter();
  const { currentTenantId } = useAppStore();
  const isAdmin = role === "admin";
  const { data: metadata } = useTenantMetadata(isAdmin ? currentTenantId || "" : "");

  const catalogPlan = SCHOOL_PLANS.find((p) => p.id === (plan || "").toLowerCase());
  const planName =
    catalogPlan?.name ||
    (plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan` : "Starter Plan");

  const isSuspended = status === "suspended";

  const goToManagePlan = (planId?: string) =>
    push(planId ? `/${tenantSlug}/manage-plan?plan=${planId}` : `/${tenantSlug}/manage-plan`);

  return (
    <SubscriptionExpired
      schoolName={tenantName}
      expiredOn={endDate || undefined}
      isSuspended={isSuspended}
      isAdmin={isAdmin}
      planName={planName}
      planPrice={catalogPlan?.price}
      currentPlanId={(plan || "").toLowerCase()}
      startedOn={metadata?.tenant?.startDate || undefined}
      onRenew={() => goToManagePlan((plan || "").toLowerCase() || undefined)}
      onComparePlans={() => goToManagePlan()}
      onSelectPlan={(planId) => goToManagePlan(planId)}
      onSupport={() => {
        window.location.href = "mailto:support@schoolsaas.com";
      }}
      onBack={() => push("/")}
    />
  );
}

interface SubscriptionExpiredProps {
  schoolName: string;
  expiredOn?: string;
  isSuspended: boolean;
  isAdmin: boolean;
  planName: string;
  planPrice?: number;
  currentPlanId: string;
  startedOn?: string;
  onRenew: () => void;
  onComparePlans: () => void;
  onSelectPlan: (planId: string) => void;
  onSupport: () => void;
  onBack: () => void;
}

function SubscriptionExpired({
  schoolName,
  expiredOn,
  isSuspended,
  isAdmin,
  planName,
  planPrice,
  currentPlanId,
  startedOn,
  onRenew,
  onComparePlans,
  onSelectPlan,
  onSupport,
  onBack,
}: SubscriptionExpiredProps) {
  const parsed = expiredOn ? new Date(expiredOn) : null;
  const expiry = parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  const startedParsed = startedOn ? new Date(startedOn) : null;
  const started =
    startedParsed && !Number.isNaN(startedParsed.getTime()) ? startedParsed : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtLong = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="sx-wrap">
      <style>{css}</style>

      <div className={`sx-hero ${isSuspended ? "sx-hero-suspended" : ""}`}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="sx-ring" cx="100" cy="100" r="92" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 9" />
          <circle cx="100" cy="100" r="70" fill="rgba(255,255,255,.14)" />
          <path d="M70 90V72a30 30 0 0 1 60 0v18" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
          <rect x="56" y="88" width="88" height="68" rx="18" fill="#fff" />
          <circle cx="100" cy="116" r="9" fill={isSuspended ? "#e11d48" : "#2f5bff"} />
          <rect x="96" y="120" width="8" height="18" rx="4" fill={isSuspended ? "#e11d48" : "#2f5bff"} />
          <circle cx="152" cy="52" r="16" fill="#ffc14d" />
          <path d="M152 44v10M152 59v.5" stroke="#7a4300" strokeWidth="3.5" strokeLinecap="round" />
        </svg>

        <div>
          <span className="sx-badge">
            {isSuspended
              ? "Account suspended by the platform"
              : expiry
                ? `Plan expired on ${fmtLong(expiry)}`
                : "Plan expired"}
          </span>
          <h1>{schoolName} is {isSuspended ? "suspended" : "paused"}</h1>
          <p>
            {isSuspended
              ? "Access is locked by the platform. Contact support to restore the school."
              : "Logins for students, teachers and parents are on hold until the plan is renewed."}
          </p>
          <div className="sx-actions">
            {isSuspended || !isAdmin ? (
              <button className="sx-btn sx-primary" onClick={onSupport}>Talk to support</button>
            ) : (
              <>
                <button className="sx-btn sx-primary" onClick={onRenew}>Renew subscription</button>
                <button className="sx-btn sx-ghost" onClick={onComparePlans}>Compare plans</button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="sx-card sx-full">
        <h2>Subscription</h2>
        <div className="sx-kvs">
          <div className="sx-kv">
            <span className="k"><CreditCard />Plan</span>
            <span className="v">
              {planName}
              {planPrice !== undefined ? ` · ₹${planPrice.toLocaleString("en-IN")}/month` : ""}
            </span>
          </div>
          <div className="sx-kv">
            <span className="k"><Calendar />Started</span>
            <span className="v">{started ? fmt(started) : "—"}</span>
          </div>
          <div className="sx-kv">
            <span className="k"><CalendarClock />Ended</span>
            <span className="v">{expiry ? fmt(expiry) : "—"}</span>
          </div>
          <div className="sx-kv">
            <span className="k">Status</span>
            <span className={`sx-status ${isSuspended ? "is-suspended" : ""}`}>
              {isSuspended ? "SUSPENDED" : "EXPIRED"}
            </span>
          </div>
        </div>
      </div>

      {!isSuspended && isAdmin && (
        <div className="sx-card sx-full">
          <h2>Renew on a plan</h2>
          <p className="sx-sub">The same three plans your platform admin manages. Pick one to continue to payment.</p>
          <div className="sx-plan-grid">
            {SCHOOL_PLANS.map((p) => {
              const isCurrent = p.id === currentPlanId;
              return (
                <div key={p.id} className={`sx-pcard ${isCurrent ? "is-current" : ""}`}>
                  {isCurrent && <span className="sx-ptag">Current plan</span>}
                  <span className="sx-pname">{p.name}</span>
                  <span className="sx-pprice">
                    ₹{p.price.toLocaleString("en-IN")}
                    <span>/month</span>
                  </span>
                  <span className="sx-plimits">
                    {p.limits.students.toLocaleString("en-IN")} students · {p.limits.teachers} teachers · {p.limits.classes} classes
                  </span>
                  <button className="sx-pbtn" onClick={() => onSelectPlan(p.id)}>
                    {isCurrent ? `Renew ${p.name}` : `Switch to ${p.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="sx-foot">
        Questions about billing?{" "}
        <button className="sx-link" onClick={onSupport}>Talk to support</button>
        {"  or  "}
        <button className="sx-link" onClick={onBack}>Back to dashboard</button>
      </p>
    </section>
  );
}

const css = `
.sx-wrap{
  --ink:#14142b;--muted:#6b6e8a;--line:#e6e7f2;--surface:#fff;
  --brand:#2f5bff;--violet:#7c2cff;--amber:#f59e0b;--amber-ink:#9a4b00;--amber-soft:#fff4dc;
  --green:#12a26a;--green-soft:#e3f7ee;
  --shadow:0 1px 2px rgba(20,20,43,.05),0 18px 40px -18px rgba(47,91,255,.25);
  max-width:1040px;margin:0 auto;padding:40px 32px 56px;color:var(--ink);
  display:grid;grid-template-columns:1fr;gap:24px;
}
.sx-wrap *{box-sizing:border-box}
.sx-wrap button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}
.sx-wrap button:focus-visible{outline:3px solid #9bb0ff;outline-offset:2px}

.sx-hero{position:relative;overflow:hidden;border-radius:24px;padding:28px 32px;color:#fff;
  background:radial-gradient(120% 140% at 100% 0%,#7c2cff 0%,transparent 55%),linear-gradient(135deg,#1b2a78,#2f5bff);
  box-shadow:var(--shadow);display:flex;align-items:center;gap:24px}
.sx-hero-suspended{background:radial-gradient(120% 140% at 100% 0%,#9f1239 0%,transparent 55%),linear-gradient(135deg,#7f1d1d,#e11d48)}
.sx-hero svg{flex:none;width:120px;height:120px}
.sx-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600}
.sx-badge::before{content:"";width:8px;height:8px;border-radius:50%;background:#ffc14d;box-shadow:0 0 0 4px rgba(255,193,77,.3)}
.sx-hero h1{font-size:26px;line-height:1.2;letter-spacing:-.5px;margin:10px 0 6px;font-weight:700}
.sx-hero p{max-width:60ch;line-height:1.55;color:#dfe5ff;font-size:14px}
.sx-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;align-items:center}
.sx-btn{padding:11px 20px;border-radius:12px;font-weight:700;font-size:14px;transition:transform .15s,box-shadow .15s}
.sx-primary{background:#fff!important;color:#2a2fa8!important;box-shadow:0 10px 24px -10px rgba(0,0,0,.45)}
.sx-primary:hover{transform:translateY(-2px)}
.sx-ghost{color:#fff!important;border:1px solid rgba(255,255,255,.4)!important}
.sx-ghost:hover{background:rgba(255,255,255,.12)!important}

.sx-card{background:var(--surface);border:1px solid var(--line);border-radius:24px;padding:26px;box-shadow:var(--shadow)}
.sx-card h2{font-size:17px;letter-spacing:-.3px;margin-bottom:14px}
.sx-sub{color:var(--muted);font-size:13.5px;margin:-8px 0 18px}
.sx-full{grid-column:1/-1}

.sx-kvs{display:flex;flex-direction:column;gap:10px}
.sx-kv{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;border-radius:14px;background:#f8f9fe}
.sx-kv .k{display:flex;align-items:center;gap:9px;color:var(--muted);font-size:13.5px}
.sx-kv .k svg{width:16px;height:16px}
.sx-kv .v{font-size:13.5px;font-weight:700}
.sx-status{background:var(--amber);color:#fff;font-size:11px;font-weight:800;letter-spacing:.4px;padding:5px 12px;border-radius:999px}
.sx-status.is-suspended{background:#e11d48}

.sx-plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.sx-pcard{position:relative;display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid var(--line);border-radius:24px;background:#fbfbff}
.sx-pcard.is-current{border-color:var(--brand);box-shadow:0 0 0 3px #e8edff}
.sx-ptag{position:absolute;top:-10px;right:14px;background:var(--brand);color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px}
.sx-pname{font-size:15px;font-weight:800}
.sx-pprice{font-size:22px;font-weight:800;letter-spacing:-.5px}
.sx-pprice span{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:0}
.sx-plimits{font-size:12px;color:var(--muted);line-height:1.5}
.sx-pbtn{margin-top:auto;padding:10px 14px;border-radius:12px;background:#eef1ff;color:#2a2fa8;font-weight:700;font-size:13.5px;transition:background .15s}
.sx-pbtn:hover{background:#dde4ff}

.sx-link{font-weight:700;font-size:13px;color:var(--violet)!important}
.sx-foot{grid-column:1/-1;text-align:center;color:var(--muted);font-size:13px}
.sx-foot .sx-link{color:var(--brand)!important;font-weight:600}

@media (max-width:980px){
  .sx-wrap{padding:24px 18px}
  .sx-hero{flex-direction:column;text-align:center;padding:24px 20px}
  .sx-hero svg{width:96px;height:96px}
  .sx-actions{justify-content:center}
  .sx-plan-grid{grid-template-columns:1fr}
}
@media (prefers-reduced-motion:no-preference){
  .sx-ring{animation:sx-pulse 2.6s ease-in-out infinite;transform-origin:center}
  @keyframes sx-pulse{50%{opacity:.35}}
}
`;
