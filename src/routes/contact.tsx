import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { StoreLayout, PageHeader } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { useStoreInfo } from "@/hooks/useStore";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Royal Street Mini Mall — Sukhrali, Gurugram" },
      { name: "description", content: "Visit Royal Street Mini Mall at HUDA Market, Sukhrali, Sector 17, Gurugram, or reach us on phone and WhatsApp." },
      { property: "og:title", content: "Contact Royal Street Mini Mall" },
      { property: "og:description", content: "Store address, phone, WhatsApp and opening hours." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const store = useStoreInfo();
  const phone = String(store?.["phone"] ?? "");
  const whatsapp = String(store?.["whatsapp"] ?? "").replace(/\D/g, "");
  const address = String(store?.["address"] ?? "");

  return (
    <StoreLayout>
      <PageHeader title="Contact Us" subtitle="We're happy to help with orders, sizing and returns" />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2">
        <div className="animate-fade-up space-y-6">
          <Item icon={MapPin} label="Store Address" value={address} />
          <Item icon={Phone} label="Phone" value={phone} />
          <Item icon={Clock} label="Opening Hours" value={String(store?.["hours"] ?? "")} />
          <Item icon={Instagram} label="Instagram" value="@royalstreet99" />
          <div className="flex flex-wrap gap-3 pt-2">
            {whatsapp && (
              <Button asChild className="rounded-none text-xs uppercase tracking-[0.16em]">
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 size-4" /> Chat on WhatsApp
                </a>
              </Button>
            )}
            {phone && (
              <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-[0.16em]">
                <a href={`tel:${phone.replace(/\s/g, "")}`}>Call the store</a>
              </Button>
            )}
          </div>
        </div>

        <div className="animate-fade-up overflow-hidden border border-border">
          <iframe
            title="Royal Street Mini Mall location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
            loading="lazy"
            className="h-full min-h-80 w-full"
          />
        </div>
      </div>
    </StoreLayout>
  );
}

function Item({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-1 size-5 shrink-0 text-gold" />
      <div>
        <p className="eyebrow text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm">{value}</p>
      </div>
    </div>
  );
}
