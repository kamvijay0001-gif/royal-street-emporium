# Royal Street Mini Mall — Build Plan

A premium fashion store with a real database, real accounts, real orders, and a full admin panel. This is a large build, so it ships in phases — each phase leaves the site working.

## Look and feel
Black, off-white, charcoal with subtle gold accents. Large fashion imagery, generous whitespace, elegant type, smooth but fast animations (hero, scroll reveal, cart drawer, checkout steps, order tracking timeline, skeletons, toasts).

## Phase 1 — Foundation and storefront
- Turn on Lovable Cloud (database, logins, image storage) for the whole project.
- Database: categories, products, variants with per-size/per-colour stock, images, carts, wishlists, addresses, orders, payments, coupons, reviews, returns, refunds, pincodes, settings, audit log.
- Design system + header (live cart count), footer, announcement bar, mobile menu.
- Home page: hero, categories, new arrivals, best sellers, trending, offers, reviews, store info.
- Category pages (Men, Women, Watches, Accessories, New Arrivals, Best Sellers, Offers) with filters and sorting.
- Product page: gallery with zoom, size/colour swatches with out-of-stock variants disabled, size recommendation helper, PIN code delivery check, add to cart / buy now / wishlist.
- Sample products loaded into the database, all editable later from admin.

## Phase 2 — Accounts, cart, checkout, orders
- Sign up / login (email + password, Google sign-in), account dashboard, saved addresses, wishlist, orders, tracking.
- Cart with stock checks, coupons, delivery fee, COD security fee (₹99, changeable in settings).
- Four-step checkout: customer, address, review, payment.
- Cash on Delivery orders end-to-end; order confirmation, tracking timeline, invoice download.
- All pricing recalculated on the server — the browser is never trusted for totals.

## Phase 3 — Online payments
- Razorpay: UPI, cards, net banking, wallets. Requires your Razorpay Key ID and Key Secret (kept private on the server).
- Dynamic UPI QR for the exact verified order amount, showing 9053346151@upi and the order ID.
- Payment confirmed only by verified gateway signature and webhook — never by an "I have paid" click.
- Mismatched amounts flagged as "Payment requires admin review".

## Phase 4 — Admin panel (/admin)
- Role-protected login. Dashboard with revenue, orders, customers, stock and payment stats plus charts.
- Products (add/edit/duplicate/publish, images, variants), categories, inventory with adjustment reasons, orders with courier + tracking, payments, customers, coupons, returns, refunds, delivery zones/pincodes, analytics with date filters, abandoned carts, audit log, settings (store info, UPI, fees, policies).

## Phase 5 — Polish
- Returns/exchanges and refunds for customers, verified-purchase reviews with moderation, notifications, WhatsApp chat/order buttons, legal pages editable from admin, SEO metadata + product/organization/breadcrumb schema + sitemap, PWA install, performance pass, full test pass.

## Notes
- The Google business link you shared can't be opened from here, so I need the real business details from you (see questions) rather than inventing them.
- Secrets (payment keys, service keys) stay server-side only.
