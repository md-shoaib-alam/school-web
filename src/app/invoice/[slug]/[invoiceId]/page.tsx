"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

interface InvoiceRow {
  id: string;
  number: number;
  planName: string;
  amount: number;
  status: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  schoolName: string | null;
  schoolEmail: string | null;
}

const longDate = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const shortDate = (v: string) =>
  new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function InvoiceViewPage() {
  const { slug, invoiceId } = useParams();
  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/tenants/invoices")
      .then((data: any) => {
        if (cancelled) return;
        const pid = String(invoiceId);
        const found = (data?.invoices ?? []).find(
          (i: InvoiceRow) => (i.number != null && String(i.number) === pid) || i.id === pid
        );
        if (found) {
          setInvoice(found);
          setState("ready");
        } else {
          setState("error");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#f5f5f7] py-8 print:bg-white print:py-0">
        <div className="mx-auto w-full max-w-[800px] bg-white border border-[#e5e3eb] p-6 sm:p-11 animate-pulse">
          <div className="flex justify-between gap-6 pb-6 border-b-2 border-[#5126a8]">
            <div className="space-y-2">
              <div className="h-7 w-52 bg-muted rounded" />
              <div className="h-4 w-40 bg-muted rounded" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-7 w-28 bg-muted rounded ml-auto" />
              <div className="h-4 w-20 bg-muted rounded ml-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
            <div className="h-32 bg-[#f5f1fc] rounded-lg" />
            <div className="space-y-4 py-2">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          </div>

          <div className="h-10 bg-[#5126a8]/30 rounded-sm" />
          <div className="h-16 bg-muted rounded-b-sm mb-5" />

          <div className="flex justify-end items-center gap-6 bg-[#f2edfc] p-3 mb-9">
            <div className="h-4 w-24 bg-[#d9ccf3] rounded" />
            <div className="h-9 w-28 bg-[#5126a8]/40 rounded" />
          </div>

          <div className="h-4 w-32 bg-muted rounded mb-3" />
          <div className="h-4 w-full bg-muted rounded mb-3" />
          <div className="h-4 w-full bg-muted rounded mb-3" />

          <div className="h-16 bg-[#edf7ef] rounded mt-8" />

          <div className="space-y-2 mt-10 pt-5 border-t  text-center">
            <div className="h-4 w-64 bg-muted rounded mx-auto" />
            <div className="h-3 w-80 max-w-full bg-muted rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "error" || !invoice) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] grid place-items-center p-6 print:bg-white">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-[#171827]">Invoice not available</p>
          <p className="text-sm text-[#626579] max-w-sm">
            We could not load this invoice. Make sure you are signed in to the school that
            owns it, then open the link again.
          </p>
        </div>
      </div>
    );
  }

  const academyName =
    invoice.schoolName ||
    String(slug)
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const status = invoice.status.toUpperCase();
  const isPaid = invoice.status === "paid";
  const money = `Rs. ${Number(invoice.amount).toLocaleString("en-IN")}`;
  const invoiceNo = invoice.number
    ? `#${String(invoice.number).padStart(6, "0")}`
    : invoice.id;
  const billingPeriod = `${shortDate(invoice.startDate)}${
    invoice.endDate ? ` - ${shortDate(invoice.endDate)}` : ""
  }`;

  return (
    <div className="invoice-wrapper">
      <style>{css}</style>

      <div className="invoice">
        <header className="invoice-header">
          <div>
            <h1 className="brand-name">{academyName}</h1>
            <div className="subtitle">School Management Platform</div>
          </div>

          <div className="invoice-heading">
            <h2>INVOICE</h2>
            <div className="invoice-number">{invoiceNo}</div>
          </div>
        </header>

        <section className="invoice-details">
          <div className="billed-to">
            <div className="label">BILLED TO</div>
            <div className="value">{academyName}</div>
            <div style={{ marginTop: 18 }}>
              <div className="label">PAYMENT STATUS</div>
              <div className={`value ${isPaid ? "paid" : ""}`}>{status}</div>
            </div>
          </div>

          <div>
            <div className="meta-row">
              <span className="meta-label">Invoice number</span>
              <span className="meta-value">{invoiceNo}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Invoice date</span>
              <span className="meta-value">{longDate(invoice.createdAt)}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Billing period</span>
              <span className="meta-value">{billingPeriod}</span>
            </div>
          </div>
        </section>

        <table className="items-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th>PERIOD</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="item-name">{invoice.planName}</div>
                <div className="item-description">Monthly school subscription</div>
              </td>
              <td>{billingPeriod}</td>
              <td>
                <strong>{money}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="total-row">
          <span className="total-label">TOTAL PAID</span>
          <span className="total-value">{money}</span>
        </div>

        <section>
          <h3 className="section-title">Payment Details</h3>
          <div className="payment-row">
            <span>Payment method</span>
            <span>Razorpay</span>
          </div>
          <div className="payment-row">
            <span>Transaction ID</span>
            <span>{invoice.transactionId || "-"}</span>
          </div>
        </section>

        {isPaid && (
          <div className="success-box">
            <div className="success-title">✓ Payment Successful</div>
            <div className="success-description">
              Your school subscription has been renewed successfully.
            </div>
          </div>
        )}

        <footer className="invoice-footer">
          <div className="footer-title">Thank you for choosing {academyName}.</div>
          <div className="footer-text">
            For billing queries, please contact our support team.
          </div>
        </footer>
      </div>

      <button className="print-button" onClick={() => window.print()} type="button">
        Print / Save as PDF
      </button>
    </div>
  );
}

const css = `
  .invoice-wrapper {
    background: #f5f5f7;
    padding: 32px 16px;
    color: #171827;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .invoice {
    width: 100%;
    max-width: 800px;
    margin: auto;
    padding: 44px 48px;
    background: #fff;
    border: 1px solid #e5e3eb;
    box-sizing: border-box;
  }

  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 24px;
    border-bottom: 2px solid #5126a8;
  }

  .brand-name {
    font-size: 25px;
    font-weight: 700;
    margin: 0 0 5px;
  }

  .subtitle {
    font-size: 13px;
    color: #626579;
  }

  .invoice-heading {
    text-align: right;
  }

  .invoice-heading h2 {
    font-size: 25px;
    margin: 0 0 5px;
  }

  .invoice-number {
    color: #626579;
    font-size: 12px;
    overflow-wrap: anywhere;
  }

  .invoice-details {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 32px;
    margin: 32px 0 42px;
  }

  .billed-to {
    padding: 22px;
    background: #f5f1fc;
    border-radius: 8px;
    align-self: start;
  }

  .label {
    color: #626579;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 9px;
  }

  .value {
    font-size: 14px;
    font-weight: 700;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #e8e7ed;
    font-size: 12px;
  }

  .meta-row:last-child {
    border-bottom: none;
  }

  .meta-label {
    color: #626579;
    flex-shrink: 0;
  }

  .meta-value {
    text-align: right;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .paid {
    color: #168544;
  }

  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .items-table th {
    background: #5126a8;
    color: #fff;
    padding: 13px 14px;
    font-size: 11px;
    text-align: left;
  }

  .items-table th:last-child,
  .items-table td:last-child {
    text-align: right;
  }

  .items-table th:nth-child(2),
  .items-table td:nth-child(2) {
    text-align: center;
  }

  .items-table td {
    padding: 17px 14px;
    border-bottom: 1px solid #dedce5;
    font-size: 12px;
    vertical-align: middle;
  }

  .item-name {
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 5px;
  }

  .item-description {
    color: #626579;
    font-size: 11px;
  }

  .total-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    background: #f2edfc;
    padding: 13px 18px;
    margin-bottom: 36px;
  }

  .total-label {
    color: #32136f;
    font-weight: 700;
    font-size: 14px;
  }

  .total-value {
    background: #5126a8;
    color: white;
    padding: 10px 18px;
    font-size: 15px;
    font-weight: 700;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  .payment-row {
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 12px;
    padding: 12px 8px;
    border-bottom: 1px solid #e8e7ed;
    font-size: 12px;
  }

  .payment-row span:first-child {
    color: #626579;
  }

  .payment-row span:last-child {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .success-box {
    margin-top: 34px;
    padding: 19px;
    background: #edf7ef;
    border-left: 3px solid #168544;
  }

  .success-title {
    font-size: 14px;
    font-weight: 700;
    color: #168544;
    margin-bottom: 6px;
  }

  .success-description {
    color: #626579;
    font-size: 12px;
  }

  .invoice-footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 18px;
    border-top: 1px solid #dedce5;
  }

  .footer-title {
    color: #5126a8;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .footer-text {
    font-size: 11px;
    color: #626579;
  }

  .print-button {
    display: block;
    margin: 20px auto 0;
    padding: 11px 24px;
    background: #5126a8;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    .invoice-wrapper {
      padding: 12px 5px;
    }

    .invoice {
      padding: 24px 16px;
    }

    .brand-name {
      font-size: 18px;
    }

    .invoice-heading h2 {
      font-size: 20px;
    }

    .invoice-details {
      grid-template-columns: 1fr;
      gap: 20px;
      margin: 24px 0;
    }

    .items-table th,
    .items-table td {
      padding: 10px 6px;
      font-size: 10px;
    }

    .total-row {
      gap: 12px;
    }

    .payment-row {
      grid-template-columns: 1fr 1.4fr;
    }
  }

  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
    }

    .invoice-wrapper {
      padding: 0 !important;
      background: white !important;
    }

    .invoice {
      max-width: none;
      width: 100%;
      padding: 0;
      border: none;
      margin: 0;
    }

    .print-button {
      display: none !important;
    }

    .invoice-details,
    .total-row,
    .success-box,
    .invoice-footer {
      break-inside: avoid;
    }

    .items-table {
      break-inside: avoid;
    }
  }
`;
