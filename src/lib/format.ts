export function inr(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function discountPercent(mrp: number, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export const ORDER_FLOW = [
  "pending_payment",
  "paid",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_failed: "Payment Failed",
  paid: "Payment Confirmed",
  confirmed: "Order Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  return_approved: "Return Approved",
  return_rejected: "Return Rejected",
  returned: "Returned",
  refund_pending: "Refund Pending",
  refunded: "Refunded",
};

export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  cod_pending: "Pay on Delivery",
  paid: "Paid",
  failed: "Failed",
  needs_review: "Needs Review",
  refunded: "Refunded",
};

export function statusLabel(s?: string | null) {
  if (!s) return "—";
  return STATUS_LABELS[s] ?? s.replace(/_/g, " ");
}

export function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Builds a UPI deep link for the exact, server-verified order amount. */
export function upiLink(opts: {
  upiId: string;
  name: string;
  amount: number;
  orderNumber: string;
}) {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.name,
    am: Number(opts.amount).toFixed(2),
    cu: "INR",
    tn: `Order ${opts.orderNumber}`,
  });
  return `upi://pay?${params.toString()}`;
}

export function qrImageUrl(data: string, size = 260) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;
}

export function recommendSize(opts: {
  heightCm: number;
  weightKg: number;
  fit: "slim" | "regular" | "oversized";
  gender: "men" | "women";
}) {
  const bmi = opts.weightKg / Math.pow(opts.heightCm / 100, 2);
  const scale = ["S", "M", "L", "XL", "XXL"];
  let idx = 1;
  if (bmi < 18.5) idx = 0;
  else if (bmi < 23) idx = 1;
  else if (bmi < 27) idx = 2;
  else if (bmi < 31) idx = 3;
  else idx = 4;
  if (opts.heightCm > 185) idx += 1;
  if (opts.heightCm < 160) idx -= 1;
  if (opts.fit === "oversized") idx += 1;
  if (opts.fit === "slim") idx -= 1;
  if (opts.gender === "women" && opts.fit !== "oversized") idx -= 0;
  return scale[Math.min(scale.length - 1, Math.max(0, idx))]!;
}
