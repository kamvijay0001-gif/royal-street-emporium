import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Download, MessageCircle, QrCode } from "lucide-react";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreInfo } from "@/hooks/useStore";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_FLOW, formatDate, inr, qrImageUrl, statusLabel, upiLink } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/$id")({
  head: () => ({
    meta: [
      { title: "Order Details — Royal Street Mini Mall" },
      { name: "description", content: "Track your Royal Street Mini Mall order and download your invoice." },
      { property: "og:title", content: "Order Details — Royal Street Mini Mall" },
      { property: "og:description", content: "Track your order and download your invoice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const store = useStoreInfo();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(status, note, created_at), payments(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <PageHeader title="Order" />
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-12">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </StoreLayout>
    );
  }

  if (!order) {
    return (
      <StoreLayout>
        <PageHeader title="Order" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm text-muted-foreground">We couldn't find this order on your account.</p>
          <Button asChild className="mt-6 rounded-none px-8 text-xs uppercase tracking-[0.18em]">
            <Link to="/account">Go to my account</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const awaitingPayment = order.payment_method === "online" && order.payment_status !== "paid";
  const reached = ORDER_FLOW.indexOf(order.status);
  const address = order.shipping_address as Record<string, string>;
  const whatsappNumber = (store?.["whatsapp"] as string) ?? "";
  const waText = encodeURIComponent(
    `Hello Royal Street Mini Mall, I need help with order ${order.order_number} (Total ${inr(order.total)}).`,
  );

  return (
    <StoreLayout>
      <PageHeader title={`Order ${order.order_number}`} subtitle={`Placed on ${formatDate(order.placed_at)}`} />

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 print:py-4">
        {order.status === "pending_payment" && order.payment_method === "cod" ? null : null}

        {/* CONFIRMATION */}
        <div className="animate-scale-in border border-gold bg-gold-soft/30 p-6 text-center print:hidden">
          <Check className="mx-auto size-8 text-gold" />
          <p className="mt-3 font-display text-2xl">Thank you, your order is placed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {awaitingPayment
              ? "Complete the payment below. We confirm your order only after the payment is verified on our side."
              : "We'll notify you as your order moves through packing and dispatch."}
          </p>
        </div>

        {/* UPI PAYMENT */}
        {awaitingPayment && (
          <div className="border border-border p-6 print:hidden">
            <p className="eyebrow flex items-center gap-2"><QrCode className="size-4 text-gold" /> Pay {inr(order.total)}</p>
            <div className="mt-5 grid items-center gap-6 sm:grid-cols-[200px_1fr]">
              <img
                src={qrImageUrl(upiLink({ upiId: String(store?.["upi_id"] ?? "9053346151@upi"), name: String(store?.["name"] ?? "Royal Street Mini Mall"), amount: Number(order.total), note: order.order_number }))}
                alt={`UPI QR code for ${inr(order.total)}`}
                width={200}
                height={200}
                className="mx-auto border border-border p-2"
              />
              <div className="space-y-3 text-sm">
                <p>
                  Scan with any UPI app, or pay to <span className="font-medium">{String(store?.["upi_id"] ?? "9053346151@upi")}</span>
                </p>
                <p className="text-xs text-muted-foreground">Order reference: {order.order_number}</p>
                <Button asChild className="rounded-none text-xs uppercase tracking-[0.16em]">
                  <a
                    href={upiLink({
                      upiId: String(store?.["upi_id"] ?? "9053346151@upi"),
                      name: String(store?.["name"] ?? "Royal Street Mini Mall"),
                      amount: Number(order.total),
                      note: order.order_number,
                    })}
                  >
                    Open UPI App
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Your order is marked paid only after our team verifies the payment against this exact amount. Please
                  don't pay a different amount.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TRACKING */}
        <div className="border border-border p-6">
          <p className="eyebrow">Order Tracking</p>
          <ol className="mt-6 space-y-0">
            {ORDER_FLOW.map((s, i) => {
              const entry = order.order_status_history?.find((h) => h.status === s);
              const done = i <= reached;
              return (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn("grid size-6 place-items-center rounded-full border", done ? "border-gold bg-gold text-primary" : "border-border")}>
                      {done && <Check className="size-3.5" />}
                    </span>
                    {i < ORDER_FLOW.length - 1 && <span className={cn("w-px flex-1", done ? "bg-gold" : "bg-border")} />}
                  </div>
                  <div className="pb-6">
                    <p className={cn("text-sm", done ? "font-medium" : "text-muted-foreground")}>{statusLabel(s)}</p>
                    {entry && <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          {order.courier_name && (
            <p className="text-sm">
              Courier: <span className="font-medium">{order.courier_name}</span> · Tracking {order.tracking_number}{" "}
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noreferrer" className="underline">
                  Track shipment
                </a>
              )}
            </p>
          )}
        </div>

        {/* INVOICE */}
        <div className="border border-border p-6" id="invoice">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-xl">{String(store?.["name"] ?? "Royal Street Mini Mall")}</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">{String(store?.["address"] ?? "")}</p>
              <p className="text-xs text-muted-foreground">{String(store?.["phone"] ?? "")}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-medium">Invoice {order.order_number}</p>
              <p className="text-muted-foreground">{formatDate(order.placed_at)}</p>
              <p className="mt-1 uppercase tracking-[0.14em]">{order.payment_status === "paid" ? "PAID" : "PAYMENT PENDING"}</p>
            </div>
          </div>

          <div className="mt-6 text-xs">
            <p className="font-medium">Deliver to</p>
            <p className="text-muted-foreground">
              {address["full_name"]}, {address["house"]} {address["street"]}, {address["city"]}, {address["state"]} — {address["pincode"]}
            </p>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead className="border-y border-border text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="py-2 text-left font-normal">Item</th>
                <th className="py-2 text-center font-normal">Qty</th>
                <th className="py-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((it) => (
                <tr key={it.id} className="border-b border-border">
                  <td className="py-3">
                    {it.product_name}
                    <span className="block text-xs text-muted-foreground">
                      {it.color} · {it.size} {it.sku ? `· ${it.sku}` : ""}
                    </span>
                  </td>
                  <td className="text-center">{it.quantity}</td>
                  <td className="text-right">{inr(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={inr(order.subtotal)} />
            {Number(order.coupon_discount) > 0 && <Row label={`Coupon ${order.coupon_code ?? ""}`} value={`− ${inr(order.coupon_discount)}`} />}
            <Row label="Delivery fee" value={Number(order.delivery_fee) === 0 ? "FREE" : inr(order.delivery_fee)} />
            {Number(order.cod_fee) > 0 && <Row label="COD security fee" value={inr(order.cod_fee)} />}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-xl">{inr(order.total)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Button variant="outline" onClick={() => window.print()} className="rounded-none text-xs uppercase tracking-[0.16em]">
              <Download className="mr-2 size-4" /> Download invoice
            </Button>
            {whatsappNumber && (
              <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-[0.16em]">
                <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${waText}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 size-4" /> Chat on WhatsApp
                </a>
              </Button>
            )}
            <Button asChild variant="ghost" className="rounded-none text-xs uppercase tracking-[0.16em]">
              <Link to="/returns" search={{ order: order.order_number }}>Request return or exchange</Link>
            </Button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
