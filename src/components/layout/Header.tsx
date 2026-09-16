import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useStore";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; params?: { category: string } };

const NAV: NavItem[] = [
  { label: "Men", to: "/$category", params: { category: "men" } },
  { label: "Women", to: "/$category", params: { category: "women" } },
  { label: "Watches", to: "/$category", params: { category: "watches" } },
  { label: "Accessories", to: "/$category", params: { category: "accessories" } },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Best Sellers", to: "/best-sellers" },
  { label: "Offers", to: "/offers" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-hidden px-4 py-2 text-center">
        <span className="eyebrow animate-fade-in">New Collection Available</span>
        <span className="eyebrow hidden text-gold sm:inline">Secure Online Payments</span>
        <span className="eyebrow hidden md:inline">COD Available</span>
      </div>
    </div>
  );
}

export function Header() {
  const { data: cart } = useCart();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const count = (cart ?? []).reduce((a, l) => a + l.quantity, 0);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/search", search: { q: term.trim() } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetTitle className="font-display text-xl">Royal Street</SheetTitle>
            <nav className="mt-6 flex flex-col">
              <Link to="/" onClick={() => setOpen(false)} className="border-b border-border/60 py-3 text-sm uppercase tracking-[0.18em]">
                Home
              </Link>
              {NAV.map((n, i) => (
                <Link
                  key={n.label}
                  to={n.to}
                  params={n.params}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 35}ms` }}
                  className="animate-fade-up border-b border-border/60 py-3 text-sm uppercase tracking-[0.18em]"
                >
                  {n.label}
                </Link>
              ))}
              <Link to="/account" onClick={() => setOpen(false)} className="border-b border-border/60 py-3 text-sm uppercase tracking-[0.18em]">
                My Account
              </Link>
              <Link to="/wishlist" onClick={() => setOpen(false)} className="border-b border-border/60 py-3 text-sm uppercase tracking-[0.18em]">
                Wishlist
              </Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="border-b border-border/60 py-3 text-sm uppercase tracking-[0.18em]">
                Contact
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="mr-auto flex flex-col leading-none lg:mr-8">
          <span className="font-display text-lg tracking-tight md:text-2xl">ROYAL STREET</span>
          <span className="eyebrow text-[0.55rem] text-muted-foreground md:text-[0.6rem]">Mini Mall · Gurugram</span>
        </Link>

        <nav className="mr-auto hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              params={n.params}
              className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen((v) => !v)}>
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" aria-label="Wishlist">
            <Link to="/wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex" aria-label="Account">
            <Link to={user ? "/account" : "/auth"}>
              <User className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
            <Link to="/cart">
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -right-0.5 -top-0.5 grid size-4 min-w-4 animate-pop place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-semibold text-primary"
                >
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300",
          searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <form onSubmit={submitSearch} className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search for t-shirts, watches, dresses…"
            className="h-11 rounded-none border-0 border-b bg-transparent focus-visible:ring-0"
          />
          <Button type="submit" size="sm" className="rounded-none px-6 uppercase tracking-[0.16em]">
            Search
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} aria-label="Close search">
            <X className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
