import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useSession";

export type SettingsMap = Record<string, Record<string, unknown>>;

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("key, value");
      if (error) throw error;
      const map: SettingsMap = {};
      for (const row of data ?? []) map[row.key] = (row.value ?? {}) as Record<string, unknown>;
      return map;
    },
  });
}

export function useStoreInfo() {
  const { data } = useSettings();
  const s = (data?.["store"] ?? {}) as Record<string, string>;
  return {
    name: s["name"] ?? "Royal Street Mini Mall",
    phone: s["phone"] ?? "+917015973927",
    whatsapp: s["whatsapp"] ?? "917015973927",
    email: s["email"] ?? "",
    instagram: s["instagram"] ?? "",
    address: s["address"] ?? "",
    city: s["city"] ?? "",
    state: s["state"] ?? "",
    pincode: s["pincode"] ?? "",
    hours: s["hours"] ?? "",
  };
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("position");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  mrp: number;
  price: number;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  category_id: string | null;
  subcategory_id: string | null;
  created_at: string;
  product_images: { url: string; alt: string | null; position: number; is_primary: boolean }[];
  product_variants: { id: string; size: string; color: string; color_hex: string | null; stock: number; is_active: boolean }[];
};

const PRODUCT_SELECT =
  "*, product_images(url, alt, position, is_primary), product_variants(id, size, color, color_hex, stock, is_active, sku, price_override)";

export function useProducts(opts: { categorySlug?: string; flag?: "new" | "best" | "offers" | "featured"; search?: string } = {}) {
  const { data: cats } = useCategories();
  return useQuery({
    queryKey: ["products", opts, cats?.length ?? 0],
    enabled: opts.categorySlug ? !!cats?.length : true,
    queryFn: async () => {
      let q = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true).is("archived_at", null);
      if (opts.categorySlug) {
        const cat = cats?.find((c) => c.slug === opts.categorySlug);
        if (cat) {
          const childIds = (cats ?? []).filter((c) => c.parent_id === cat.id).map((c) => c.id);
          const ids = [cat.id, ...childIds];
          q = q.or(`category_id.in.(${ids.join(",")}),subcategory_id.in.(${ids.join(",")})`);
        }
      }
      if (opts.flag === "new") q = q.eq("is_new_arrival", true);
      if (opts.flag === "best") q = q.eq("is_best_seller", true);
      if (opts.flag === "featured") q = q.eq("is_featured", true);
      if (opts.search) q = q.ilike("name", `%${opts.search}%`);
      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      let rows = (data ?? []) as unknown as ProductRow[];
      if (opts.flag === "offers") rows = rows.filter((p) => Number(p.mrp) > Number(p.price));
      return rows;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as (ProductRow & {
        description: string | null;
        material: string | null;
        care_instructions: string | null;
        size_chart: { note?: string; rows?: { size: string; chest: string; length: string }[] } | null;
        sku: string | null;
        video_url: string | null;
      }) | null;
    },
  });
}

/* ------------------------------- CART ------------------------------- */

export type CartLine = {
  id: string;
  quantity: number;
  variant_id: string;
  product_id: string;
  product_variants: { id: string; size: string; color: string; stock: number; price_override: number | null };
  products: { id: string; name: string; slug: string; price: number; mrp: number; product_images: { url: string; is_primary: boolean; position: number }[] };
};

async function ensureCart(userId: string) {
  const { data } = await supabase.from("carts").select("id").eq("user_id", userId).eq("status", "active").maybeSingle();
  if (data) return data.id;
  const { data: created, error } = await supabase.from("carts").insert({ user_id: userId }).select("id").single();
  if (error) throw error;
  return created.id;
}

export function useCart() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const cartId = await ensureCart(user!.id);
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          "id, quantity, variant_id, product_id, product_variants(id, size, color, stock, price_override), products(id, name, slug, price, mrp, product_images(url, is_primary, position))",
        )
        .eq("cart_id", cartId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as CartLine[];
    },
  });
}

export function useCartActions() {
  const { user } = useSession();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["cart"] });

  const add = useMutation({
    mutationFn: async (input: { productId: string; variantId: string; quantity?: number }) => {
      if (!user) throw new Error("Please sign in to add items to your bag");
      const cartId = await ensureCart(user.id);
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("variant_id", input.variantId)
        .maybeSingle();
      const qty = (existing?.quantity ?? 0) + (input.quantity ?? 1);
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock")
        .eq("id", input.variantId)
        .maybeSingle();
      if (!variant || variant.stock < qty) throw new Error("This variant is no longer available in that quantity.");
      if (existing) {
        const { error } = await supabase.from("cart_items").update({ quantity: qty }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ cart_id: cartId, product_id: input.productId, variant_id: input.variantId, quantity: qty });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success("Added to your bag");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setQty = useMutation({
    mutationFn: async (input: { id: string; quantity: number; stock: number }) => {
      if (input.quantity < 1) {
        const { error } = await supabase.from("cart_items").delete().eq("id", input.id);
        if (error) throw error;
        return;
      }
      if (input.quantity > input.stock) throw new Error("No more stock available for this variant.");
      const { error } = await supabase.from("cart_items").update({ quantity: input.quantity }).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast("Removed from bag");
    },
  });

  return { add, setQty, remove };
}

/* ----------------------------- WISHLIST ----------------------------- */

export function useWishlist() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("id, product_id, products(id, name, slug, price, mrp, rating_avg, rating_count, brand, product_images(url, is_primary, position))")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleWishlist() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Please sign in to save favourites");
      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      if (data) {
        await supabase.from("wishlists").delete().eq("id", data.id);
        return false;
      }
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      return true;
    },
    onSuccess: (added) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(added ? "Saved to wishlist" : "Removed from wishlist");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
