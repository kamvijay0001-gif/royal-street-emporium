import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { useStoreInfo } from "@/hooks/useStore";

export function Footer() {
  const store = useStoreInfo();
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">ROYAL STREET</p>
          <p className="eyebrow mt-1 text-gold">Mini Mall</p>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">{store.address}</p>
          <p className="mt-3 text-sm text-primary-foreground/70">{store.hours}</p>
        </div>

        <div>
          <p className="eyebrow text-gold">Shop</p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/men" className="hover:text-primary-foreground">Men</Link></li>
            <li><Link to="/women" className="hover:text-primary-foreground">Women</Link></li>
            <li><Link to="/watches" className="hover:text-primary-foreground">Watches</Link></li>
            <li><Link to="/accessories" className="hover:text-primary-foreground">Accessories</Link></li>
            <li><Link to="/offers" className="hover:text-primary-foreground">Offers</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Help</p>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/account/orders" className="hover:text-primary-foreground">Track Order</Link></li>
            <li><Link to="/returns" className="hover:text-primary-foreground">Returns & Exchange</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-primary-foreground">Shipping Policy</Link></li>
            <li><Link to="/return-policy" className="hover:text-primary-foreground">Return & Refund Policy</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary-foreground">Terms & Conditions</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground">Contact</Link></li>
            <li><Link to="/about" className="hover:text-primary-foreground">About</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Reach Us</p>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${store.phone}`} className="hover:text-primary-foreground">{store.phone}</a>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle className="mt-0.5 size-4 shrink-0" />
              <a
                href={`https://wa.me/${store.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary-foreground"
              >
                Chat on WhatsApp
              </a>
            </li>
            {store.instagram && (
              <li className="flex items-start gap-2">
                <Instagram className="mt-0.5 size-4 shrink-0" />
                <a href={store.instagram} target="_blank" rel="noreferrer" className="hover:text-primary-foreground">
                  @royalstreet99
                </a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>Sector 17, Gurugram</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-5 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Royal Street Mini Mall. All rights reserved.
      </div>
    </footer>
  );
}
