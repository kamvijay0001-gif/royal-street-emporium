# Royal Street Commerce

🚀 BUILD A COMPLETE PRODUCTION-READY E-COMMERCE PLATFORM



ROYAL STREET MINI MALL



Build a fully functional, production-ready, premium fashion e-commerce website and admin management system for:



ROYAL STREET MINI MALL



The store sells:



- Men's Clothing

- Women's Clothing

- Watches

- Fashion Accessories

- Future categories should be addable from Admin



Business profile/reference:



https://share.google/OjtDH8vsDh3wp7mPW



Use the publicly available information from this business profile for the store's actual business information wherever possible. Do not invent important business details when information is available from the provided source.



---



1. CORE REQUIREMENT



This must be a real working e-commerce application, NOT just a UI prototype.



Build the complete workflow:



Customer:



Home → Category → Product → Variant → Cart → Checkout → Address → Delivery → Payment → Verification → Order → Tracking → Delivery → Review



Admin:



Login → Dashboard → Products → Inventory → Orders → Payments → Customers → Coupons → Returns → Delivery → Analytics → Settings



All important information must be stored in a real database.



No important business functionality should depend on hardcoded frontend data.



---



2. RECOMMENDED TECHNOLOGY



Use a modern scalable architecture:



- React

- TypeScript

- Vite

- Tailwind CSS

- Supabase

- PostgreSQL

- Supabase Authentication

- Supabase Storage

- Supabase Realtime where useful

- Secure server/edge functions

- Razorpay or another reliable Indian payment gateway



Use environment variables for all secrets.



NEVER expose:



- Payment gateway secret keys

- Supabase service-role keys

- API secrets

- Private credentials



in frontend code.



---



3. PREMIUM DESIGN



Create a premium modern fashion experience.



Visual direction:



- Luxury

- Modern

- Minimal

- Youthful

- Fashion-forward

- Elegant

- High-end Indian retail aesthetic



Suggested colors:



- Black

- White

- Off-white

- Charcoal

- Subtle gold



Use:



- Premium typography

- Large fashion photography

- Generous whitespace

- Rounded cards where appropriate

- Elegant buttons

- Beautiful product grids

- Premium banners

- Clean icons



Do NOT make it look like a generic AI-generated template.



---



4. ANIMATIONS



Use smooth animations throughout the complete customer journey.



Include:



- Hero animation

- Page transitions

- Scroll reveal

- Product image transitions

- Product hover effects

- Wishlist animation

- Add-to-cart animation

- Cart drawer animation

- Checkout step transitions

- Payment processing animation

- Payment success animation

- Order confirmation animation

- Order tracking timeline animation

- Skeleton loading

- Toast notifications

- Mobile menu animation

- Modal transitions



Animations must remain fast and professional.



Do not sacrifice performance for animation.



---



5. CUSTOMER WEBSITE PAGES



Create:



- Home

- Men

- Women

- Watches

- Accessories

- New Arrivals

- Best Sellers

- Offers

- Categories

- Search

- Product Details

- Cart

- Checkout

- Login

- Register

- My Account

- Orders

- Order Tracking

- Wishlist

- Reviews

- Returns/Exchange

- Contact

- About

- Shipping Policy

- Return & Refund Policy

- Privacy Policy

- Terms & Conditions



---



6. HEADER



Desktop header:



- Logo

- Home

- Men

- Women

- Watches

- New Arrivals

- Best Sellers

- Offers

- Search

- Wishlist

- Account

- Cart



Mobile header:



- Logo

- Search

- Cart

- Hamburger



Show live cart count.



Use sticky navigation where appropriate.



---



7. HOMEPAGE



Create a premium fashion homepage.



Announcement Bar



Examples:



- New Collection Available

- Secure Online Payments

- COD Available



Hero



Use a premium fashion image/video.



Display:



ROYAL STREET MINI MALL



with a strong fashion-focused headline.



Buttons:



SHOP NOW



EXPLORE COLLECTION



Categories



MEN

WOMEN

WATCHES

ACCESSORIES



New Arrivals



Dynamic database products.



Best Sellers



Automatically determined from sales data.



Trending



Dynamic products.



Offers



Admin-controlled promotional banners.



Fashion Campaign Banner



Premium visual promotional section.



Reviews



Customer reviews with verified-purchase badge.



Store Section



Use actual business information from the supplied Google profile.



Footer



Include:



- Store information

- Categories

- Customer support

- Contact

- WhatsApp

- Social links

- Policies

- Copyright



---



8. CATEGORIES



Default categories:



MEN



- T-Shirts

- Shirts

- Jeans

- Trousers

- Jackets

- Hoodies

- Ethnic Wear



WOMEN



- Tops

- Dresses

- Jeans

- Kurtis

- Ethnic Wear

- Co-ords

- Jackets



WATCHES



- Men's Watches

- Women's Watches

- Analog

- Digital

- Premium Watches



ACCESSORIES



Allow admin to add additional categories.



Admin must be able to:



- Create

- Edit

- Delete

- Hide/show

- Reorder categories



---



9. PRODUCT LISTING



Create a premium product grid.



Each card should show:



- Product image

- Product name

- Brand

- Original price

- Selling price

- Discount %

- Rating

- Available colors

- Available sizes

- Stock status

- Wishlist

- Quick View

- Add to Cart



Filters:



- Category

- Subcategory

- Price

- Size

- Color

- Brand

- Rating

- Availability

- Discount



Sorting:



- Newest

- Popular

- Best Selling

- Price Low → High

- Price High → Low

- Highest Rated



---



10. PRODUCT DETAILS



Show:



- Multiple images

- Image gallery

- Zoom

- Product video if available

- Product name

- Brand

- Rating

- Reviews

- Original price

- Selling price

- Discount

- Description

- Material

- Care instructions

- Size chart

- Delivery information

- Return information



SIZE SELECTION



Support:



S

M

L

XL

XXL



and any custom sizes added by Admin.



COLOR SELECTION



Use visual color swatches.



Example:



Black

White

Blue

Red



Unavailable variants must be disabled.



Example:



Black / L — OUT OF STOCK



Buttons:



ADD TO CART



BUY NOW



WISHLIST



---



11. SIZE RECOMMENDATION



Add an optional smart size recommendation feature.



Customer can enter approximate:



- Height

- Weight

- Preferred fit

- Gender

- Body-fit preference



Then show:



Recommended Size: L



Clearly state that this is an estimate and the customer should also check the store's size chart.



Admin must be able to configure size-chart information.



---



12. PIN CODE DELIVERY CHECK



Product and checkout pages should have:



Check Delivery Availability



Customer enters Indian PIN code.



Display:



Delivery Available



or



Delivery Currently Unavailable



Admin can manage serviceable PIN codes/zones.



---



13. VARIANT INVENTORY



Inventory must work independently for every variant.



Example:



Black:



S = 5

M = 8

L = 0

XL = 4



White:



S = 3

M = 0

L = 7

XL = 2



Only available variants can be purchased.



Prevent overselling through server-side stock validation.



---



14. CART



Complete cart functionality:



- Add

- Remove

- Increase quantity

- Decrease quantity

- Size

- Color

- Variant

- Stock validation

- Coupon

- Delivery

- COD security fee



Display:



Subtotal

Product Discount

Coupon Discount

Delivery Fee

COD Security Fee

GRAND TOTAL



Revalidate price and inventory before checkout.



---



15. ABANDONED CART



Implement abandoned-cart architecture.



For logged-in customers:



- Save cart

- Detect abandoned carts

- Maintain cart items

- Allow customer to return and continue shopping



If notification integrations are configured, support reminders through approved email/WhatsApp/SMS providers.



Do not spam customers.



---



16. CHECKOUT



Use a clean multi-step checkout.



STEP 1 — CUSTOMER



Ask:



- Full Name

- Mobile

- Email

- WhatsApp Number



STEP 2 — ADDRESS



Ask:



- Full Name

- Mobile

- House/Flat

- Street/Area

- Landmark

- Village/Town/City

- District

- State

- PIN Code

- Delivery Instructions



Allow:



Save Address



Logged-in users can maintain multiple addresses.



STEP 3 — ORDER REVIEW



Show:



- Products

- Size

- Color

- Quantity

- Price

- Discounts

- Coupon

- Delivery

- COD fee

- Final amount



STEP 4 — PAYMENT



---



17. PAYMENT GATEWAY



Implement a real secure payment workflow.



Preferred:



Razorpay



Support:



- UPI

- Cards

- Net Banking

- Supported wallets



Workflow:



Customer creates checkout



→ Backend validates order



→ Backend calculates final amount



→ Backend creates gateway order/payment request



→ Payment gateway opens



→ Customer pays



→ Gateway returns payment details



→ Backend verifies payment signature/status



→ Webhook confirms payment



→ Order becomes PAID



→ Customer receives confirmation



Never trust frontend payment status.



---



18. STORE UPI



Store UPI ID:



9053346151@upi



Use this as the store UPI identifier where appropriate.



Display it on the UPI payment interface.



---



19. DYNAMIC UPI QR



Create a proper:



PAY WITH UPI QR



option.



The QR must be generated dynamically according to the verified order amount.



Example:



Order total = ₹220



QR payment amount = ₹220



Order total = ₹1,499



QR payment amount = ₹1,499



Never hardcode the amount.



Display:



PAY ₹220



[GENERATED QR]



UPI ID:



9053346151@upi



Order ID



Also provide:



OPEN UPI APP



where technically supported.



IMPORTANT:



Customer clicking:



I HAVE PAID



must NOT automatically mark an order as paid.



Payment must be verified through the configured gateway/backend/webhook.



---



20. COD



Payment options:



PAY ONLINE



CASH ON DELIVERY



COD must add:



₹99 COD SECURITY FEE



Example:



Product = ₹1,000

Delivery = ₹50

COD Security Fee = ₹99



Final = ₹1,149



For online prepaid orders:



COD fee = ₹0



Admin can change the COD security fee from Settings.



---



21. PAYMENT RECONCILIATION



Implement payment reconciliation.



If:



Expected amount = ₹1,399



but gateway reports:



₹1,499



or any unexpected amount/status,



do NOT automatically complete the order.



Flag it:



PAYMENT REQUIRES ADMIN REVIEW



Admin can inspect:



- Expected amount

- Paid amount

- Payment ID

- Gateway order ID

- Payment method

- Status

- Timestamp



---



22. ORDER CREATION



Before creating an order, validate server-side:



- Customer

- Address

- Product

- Variant

- Price

- Stock

- Coupon

- Delivery fee

- COD fee

- Final total

- Payment method



Prevent:



- Duplicate orders

- Duplicate payments

- Negative inventory

- Price manipulation

- Coupon manipulation



---



23. ORDER STATUS



Statuses:



- Pending Payment

- Payment Failed

- Paid

- Confirmed

- Processing

- Packed

- Shipped

- Out for Delivery

- Delivered

- Cancelled

- Return Requested

- Return Approved

- Return Rejected

- Returned

- Refund Pending

- Refunded



---



24. ORDER TRACKING



Customer sees:



ORDER PLACED



↓



PAYMENT CONFIRMED



↓



ORDER CONFIRMED



↓



PROCESSING



↓



PACKED



↓



SHIPPED



↓



OUT FOR DELIVERY



↓



DELIVERED



Show timestamps for each status.



Allow:



- Courier name

- Tracking number

- Tracking link



---



25. SHIPPING / COURIER ARCHITECTURE



Design the system so courier integrations can be added.



Support future integration with services such as:



- Shiprocket

- Delhivery

- Blue Dart

- Other supported courier APIs



Do not hardcode a courier.



Admin can manually enter:



- Courier

- Tracking number

- Tracking URL



---



26. CUSTOMER ACCOUNT



Dashboard:



- Profile

- Orders

- Order Details

- Track Order

- Saved Addresses

- Wishlist

- Recently Viewed

- Coupons

- Reviews

- Returns

- Notifications



Authentication:



- Email/password

- Mobile OTP where supported

- Google login where supported



---



27. RETURNS & EXCHANGES



Create complete return/exchange workflow.



Customer can request:



RETURN



or



EXCHANGE



Request fields:



- Order

- Product

- Quantity

- Reason

- Description

- Photos

- Preferred resolution



Reasons:



- Wrong size

- Damaged product

- Wrong product

- Product not as expected

- Other



Admin can:



- Approve

- Reject

- Request more information

- Mark returned

- Approve exchange

- Start refund workflow



Show return status to customer.



---



28. REFUNDS



Create refund workflow.



Statuses:



- Refund Requested

- Refund Approved

- Refund Processing

- Refund Completed

- Refund Failed



Store:



- Refund ID

- Amount

- Date

- Reason

- Payment reference



Use gateway refund APIs where supported.



---



29. INVOICE



Generate professional order invoices.



Invoice should contain:



- Royal Street Mini Mall

- Store details

- Invoice number

- Order ID

- Date

- Customer name

- Billing/delivery address

- Products

- SKU

- Size

- Color

- Quantity

- Unit price

- Discount

- Tax if applicable

- Delivery

- COD fee if applicable

- Total

- Payment status



Allow customer/admin to download invoice.



---



30. WHATSAPP



Add WhatsApp support.



Buttons:



CHAT ON WHATSAPP



ORDER ON WHATSAPP



Where configured, generate a prefilled message containing:



- Customer name

- Order ID

- Product

- Quantity

- Total



Do not expose unnecessary customer data.



---



31. ADMIN PANEL



Create secure:



"/admin"



Admin login must be completely protected.



Use role-based authorization.



---



32. ADMIN DASHBOARD



Show:



- Total Revenue

- Today's Revenue

- Weekly Revenue

- Monthly Revenue

- Orders

- Pending Orders

- Delivered Orders

- Cancelled Orders

- Customers

- Products

- Low Stock

- Failed Payments

- COD Orders

- Online Orders

- Return Requests

- Refunds



Charts:



- Revenue

- Orders

- Best Products

- Categories

- Payment methods

- COD vs Online

- Returns

- Customer growth



---



33. ADMIN PRODUCT MANAGEMENT



Admin can:



ADD PRODUCT



Fields:



- Name

- SKU

- Category

- Subcategory

- Brand

- Description

- Images

- Video

- Original Price

- Selling Price

- Discount

- Tax/GST if applicable

- Sizes

- Colors

- Variant SKU

- Variant stock

- Weight

- Featured

- New Arrival

- Best Seller

- Active/Inactive



Actions:



- Add

- Edit

- Delete

- Duplicate

- Publish

- Unpublish

- Change price

- Change inventory

- Manage variants

- Manage images



---



34. IMAGE MANAGEMENT



Use Supabase Storage.



Admin can:



- Upload multiple images

- Reorder

- Delete

- Set primary image



Optimize images automatically where possible.



Use modern formats such as WebP/AVIF where supported.



Implement:



- Lazy loading

- Responsive image sizes

- Thumbnails



---



35. ADMIN INVENTORY



Show:



- Product

- SKU

- Variant

- Color

- Size

- Current stock

- Reserved stock

- Available stock

- Low-stock warning



Allow stock adjustment with reason.



Example:



+10 Stock Received



-2 Damaged



Every important inventory adjustment should be recorded.



---



36. ADMIN ORDER MANAGEMENT



Table:



Order ID

Customer

Phone

Products

Amount

Payment

Payment Status

Order Status

Date



Admin can:



- Open order

- Confirm

- Process

- Pack

- Ship

- Add courier

- Add tracking number

- Mark delivered

- Cancel

- Manage return

- Manage refund

- Add internal notes



---



37. ADMIN CUSTOMER MANAGEMENT



Show legitimate business/customer information:



- Name

- Mobile

- Email

- Orders

- Total spending

- Last order

- Saved delivery addresses

- Order history



Never expose:



- Password

- OTP

- Card number

- CVV

- UPI PIN

- Payment secrets



---



38. COUPONS



Admin can create:



- Percentage discount

- Fixed discount

- Minimum order

- Maximum discount

- Start date

- End date

- Usage limit

- Customer usage limit

- Category restriction

- Product restriction

- Active/inactive



Example:



WELCOME10 — 10% OFF



---



39. ADMIN ANALYTICS



Create analytics dashboard:



- Total revenue

- Net sales

- Orders

- Average order value

- Conversion rate

- Best sellers

- Low sellers

- Category performance

- Customer growth

- Repeat customers

- COD percentage

- Online payment percentage

- Failed payments

- Return rate

- Refund amount

- Abandoned carts



Provide date filters:



- Today

- 7 Days

- 30 Days

- 3 Months

- 1 Year

- Custom



---



40. ABANDONED CART ANALYTICS



Admin can see:



- Abandoned carts

- Cart value

- Customer if logged in

- Last activity

- Products in cart



Show recovery metrics if reminder integrations are enabled.



---



41. ADMIN AUDIT LOG



Create an admin audit system.



Record important actions:



- Product created

- Product edited

- Price changed

- Stock changed

- Order status changed

- Refund changed

- Coupon created

- Settings changed

- Admin login



Store:



- Admin

- Action

- Date/time

- Relevant record

- Previous value where appropriate

- New value where appropriate



---



42. BACKUP & RECOVERY



Design the system with reliable database backup/recovery in mind.



Important order/payment/customer records must not be accidentally lost through normal admin actions.



Use soft-delete/archive where appropriate.



Do not permanently delete critical financial/order records from a normal UI button without safeguards.



---



43. REVIEWS



Only customers who purchased a product can submit verified reviews.



Review:



- Rating

- Comment

- Images



Admin moderation:



- Approve

- Hide

- Delete



Show:



VERIFIED PURCHASE



---



44. NOTIFICATIONS



Customer notifications:



- Order placed

- Payment successful

- Payment failed

- Order confirmed

- Packed

- Shipped

- Out for delivery

- Delivered

- Return update

- Refund update

- Coupon/promotional notifications where consent allows



Support email/SMS/WhatsApp providers through proper integrations.



---



45. DATABASE



Use a proper relational database.



Suggested tables:



- profiles

- addresses

- categories

- subcategories

- products

- product_images

- product_variants

- inventory

- inventory_transactions

- carts

- cart_items

- wishlists

- orders

- order_items

- payments

- refunds

- coupons

- coupon_usage

- reviews

- notifications

- delivery_zones

- serviceable_pincodes

- order_status_history

- returns

- exchanges

- admin_users

- admin_audit_logs

- store_settings



Use:



- Foreign keys

- Indexes

- Constraints

- Timestamps

- Transaction-safe operations



---



46. SECURITY



Implement:



- Authentication

- Authorization

- Role-based access

- Supabase RLS

- Server-side validation

- Input validation

- Payment verification

- Webhooks

- Secure API endpoints

- Rate limiting where appropriate

- Environment variables

- Secure session handling



Customer A must never access Customer B's data.



Admin-only information must never be exposed to customers.



---



47. CUSTOMER DATA PRIVACY



Only collect information genuinely required for:



- Account

- Order

- Delivery

- Payment

- Customer support



Provide:



- Privacy Policy

- Data handling information

- Account deletion/request workflow where applicable



Do not expose customer information publicly.



---



48. SEO



Implement:



- Unique title

- Meta description

- Canonical URL

- Open Graph

- Product schema

- Organization schema

- Breadcrumb schema

- Sitemap

- Robots.txt

- Image alt text

- SEO-friendly URLs



Example:



"/product/mens-black-premium-tshirt"



Every product should have unique SEO metadata.



---



49. PERFORMANCE



Optimize:



- Core Web Vitals

- Mobile loading

- Image sizes

- Lazy loading

- Code splitting

- Database queries

- Caching where appropriate



Do not let animations make the website slow.



---



50. PWA / MOBILE EXPERIENCE



Make the website feel app-like on mobile.



Where supported:



- Installable PWA

- Add to Home Screen

- Fast loading

- Mobile-friendly navigation

- Push notifications with proper permission

- Persistent cart

- Smooth checkout



---



51. ADMIN SETTINGS



Admin can manage:



Store Name

Logo

Phone

WhatsApp

Email

Address

Social Links

UPI ID

COD Security Fee

Delivery Fee

Free Delivery Threshold

Payment Gateway

Tax Settings

Return Policy

Shipping Policy

Privacy Policy

Terms

Order Settings

Notification Settings



Default UPI:



9053346151@upi



Default COD security fee:



₹99



---



52. LEGAL PAGES



Create editable pages:



- Privacy Policy

- Terms & Conditions

- Shipping Policy

- Cancellation Policy

- Return & Exchange Policy

- Refund Policy



Make these manageable from Admin.



---



53. SAMPLE DATA



For development only, create realistic sample products:



- Premium Black Oversized T-Shirt

- Classic White Shirt

- Men's Denim Jeans

- Premium Casual Shirt

- Women's Casual Dress

- Women's Denim

- Premium Analog Watch

- Classic Men's Watch

- Women's Fashion Watch



Make every sample product editable/removable from Admin.



---



54. BUSINESS INFORMATION



Use the supplied Google Business profile as the reference:



https://share.google/OjtDH8vsDh3wp7mPW



Use available information such as:



- Business name

- Location

- Contact

- Opening hours

- Business category

- Public business images where appropriate



Do not fabricate important information.



---



55. ERROR HANDLING



Every important action must have:



- Loading state

- Skeleton

- Empty state

- Error state

- Success state

- Retry

- Toast notification



Examples:



Payment failed:



Payment could not be completed. Please try again.



Out of stock:



This variant is no longer available.



Network issue:



Something went wrong. Please try again.



---



56. PAYMENT SECURITY RULE



Never trust:



- Frontend amount

- Frontend payment status

- Customer-submitted payment ID alone

- "I HAVE PAID" button



Backend must calculate:



Products + Delivery + COD Fee − Discounts − Coupons = Final Amount



Then create the gateway transaction using that verified amount.



Verify gateway response/signature.



Use webhook confirmation.



Only then:



"payment_status = PAID"



---



57. INVENTORY SECURITY RULE



Before order completion:



- Recheck stock

- Reserve/deduct stock safely

- Prevent negative stock

- Prevent overselling

- Prevent race-condition purchases



Restore stock according to cancellation/return workflow where appropriate.



---



58. REALTIME ADMIN



Where appropriate, use realtime updates.



Example:



Admin changes:



Stock 5 → 0



Customer immediately sees:



OUT OF STOCK



Admin changes:



₹999 → ₹899



Customer sees the updated database price.



---



59. FINAL QUALITY REQUIREMENT



The website must feel like a real premium fashion-commerce company.



The complete experience must be:



Fast + Premium + Trustworthy + Modern + Mobile Friendly + Secure



Do not use fake buttons.



Do not create fake payment verification.



Do not make payment status manually trusted.



Do not hardcode the final product catalog.



Do not expose secret credentials.



---



60. FINAL TESTING



Before completing the project, test:



CUSTOMER



- Homepage

- Navigation

- Search

- Filters

- Product page

- Size

- Color

- Out-of-stock variant

- Wishlist

- Cart

- Coupon

- Address

- PIN code

- COD

- ₹99 COD fee

- Online payment

- UPI

- Dynamic QR

- Payment verification

- Failed payment

- Order

- Tracking

- Invoice

- Return

- Exchange

- Refund

- Review

- WhatsApp

- Account

- Abandoned cart



ADMIN



- Login

- Authorization

- Dashboard

- Products

- Categories

- Images

- Variants

- Inventory

- Orders

- Payments

- Customers

- Coupons

- Returns

- Refunds

- Delivery

- Analytics

- Audit logs

- Settings



SECURITY



- RLS

- Customer data isolation

- Admin protection

- Server-side validation

- Payment verification

- Secret-key protection

- Stock protection

- Duplicate order prevention



RESPONSIVE



Test:



- Android mobile

- iPhone/mobile

- Tablet

- Laptop

- Desktop



Fix:



- Console errors

- Broken links

- Layout overflow

- Slow pages

- Missing states

- Payment edge cases

- Inventory edge cases

- Authentication issues



---



FINAL INSTRUCTION TO THE AI BUILDER



Build the complete system now.



Do not stop after creating the UI.



Connect:



DATABASE → AUTHENTICATION → PRODUCTS → INVENTORY → CART → CHECKOUT → ADDRESS → DELIVERY → COD → PAYMENT → DYNAMIC UPI QR → PAYMENT VERIFICATION → ORDERS → INVOICE → SHIPPING → TRACKING → RETURNS → REFUNDS → REVIEWS → ADMIN → ANALYTICS



The result must be a fully functional, scalable, secure and production-ready e-commerce platform specifically designed for:



ROYAL STREET MINI MALL



Store UPI:



9053346151@upi



COD Security Fee:



₹99



Make the customer experience premium and the admin experience powerful, simple and easy to operate.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://royal-street-emporium.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e8ce316-52b1-41a7-b34e-227ac0641b6e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
