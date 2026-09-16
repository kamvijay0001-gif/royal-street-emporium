import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { AnnouncementBar, Header } from "./Header";
import { Footer } from "./Footer";
import { useStoreInfo } from "@/hooks/useStore";

export function StoreLayout({ children }: { children: ReactNode }) {
  const store = useStoreInfo();
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
      <a
        href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent("Hi Royal Street Mini Mall, I have a question about an order.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-success text-success-foreground shadow-lift transition-transform hover:scale-110"
      >
        <MessageCircle className="size-6" />
      </a>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center md:py-16">
        <h1 className="animate-fade-up font-display text-3xl md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl animate-fade-up text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
