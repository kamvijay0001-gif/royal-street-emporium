import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useStore";
import { useSession } from "@/hooks/useSession";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  material: string;
  care_instructions: string;
  category_id: string;
  subcategory_id: string;
  mrp: string;
  price: string;
  tax_rate: string;
  weight_grams: string;
  video_url: string;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
};

const EMPTY: Draft = {
  name: "", slug: "", sku: "", brand: "", description: "", material: "", care_instructions: "",
  category_id: "", subcategory_id: "", mrp: "", price: "", tax_rate: "0", weight_grams: "",
  video_url: "", is_active: true, is_featured: false, is_new_arrival: true, is_best_seller: false,
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const BUCKET = "product-images";

function AdminProducts() {
  const qc = useQueryClient();
  const { user } = useSession();
  const { data: categories } = useCategories();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [imagesFor, setImagesFor] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id, url, is_primary, position), product_variants(id, size, color, stock)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name,
        slug: d.slug || slugify(d.name),
        sku: d.sku || null,
        brand: d.brand || null,
        description: d.description || null,
        material: d.material || null,
        care_instructions: d.care_instructions || null,
        category_id: d.category_id || null,
        subcategory_id: d.subcategory_id || null,
        mrp: Number(d.mrp || 0),
        price: Number(d.price || 0),
        tax_rate: Number(d.tax_rate || 0),
        weight_grams: d.weight_grams ? Number(d.weight_grams) : null,
        video_url: d.video_url || null,
        is_active: d.is_active,
        is_featured: d.is_featured,
        is_new_arrival: d.is_new_arrival,
        is_best_seller: d.is_best_seller,
      };
      if (d.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id ?? null,
        action: d.id ? "product_updated" : "product_created",
        entity: "products",
        entity_id: d.id ?? payload.slug,
        new_value: payload,
      });
    },
    onSuccess: () => {
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").update({ archived_at: new Date().toISOString(), is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product archived — it is hidden from the store but not deleted.");
    },
  });

  const parents = (categories ?? []).filter((c) => !c.parent_id);
  const subs = (categories ?? []).filter((c) => c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Products</h1>
        <Button onClick={() => setDraft(EMPTY)} className="rounded-none text-xs uppercase tracking-[0.16em]">
          <Plus className="mr-2 size-4" /> New product
        </Button>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((p) => {
          const img = [...(p.product_images ?? [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0]?.url;
          const stock = (p.product_variants ?? []).reduce((a, v) => a + v.stock, 0);
          return (
            <div key={p.id} className="flex gap-4 border border-border bg-background p-4">
              <img src={img ?? "/images/hero.jpg"} alt={p.name} loading="lazy" className="aspect-4/5 w-20 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku ?? "no SKU"} · {inr(p.price)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stock} in stock · {p.is_active ? "Published" : "Hidden"} {p.archived_at ? "· Archived" : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none text-xs"
                    onClick={() =>
                      setDraft({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        sku: p.sku ?? "",
                        brand: p.brand ?? "",
                        description: p.description ?? "",
                        material: p.material ?? "",
                        care_instructions: p.care_instructions ?? "",
                        category_id: p.category_id ?? "",
                        subcategory_id: p.subcategory_id ?? "",
                        mrp: String(p.mrp),
                        price: String(p.price),
                        tax_rate: String(p.tax_rate),
                        weight_grams: p.weight_grams ? String(p.weight_grams) : "",
                        video_url: p.video_url ?? "",
                        is_active: p.is_active,
                        is_featured: p.is_featured,
                        is_new_arrival: p.is_new_arrival,
                        is_best_seller: p.is_best_seller,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-none text-xs" onClick={() => setImagesFor(p.id)}>
                    Images
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-none text-xs"
                    onClick={() =>
                      setDraft({
                        name: `${p.name} (copy)`,
                        slug: `${p.slug}-copy`,
                        sku: "",
                        brand: p.brand ?? "",
                        description: p.description ?? "",
                        material: p.material ?? "",
                        care_instructions: p.care_instructions ?? "",
                        category_id: p.category_id ?? "",
                        subcategory_id: p.subcategory_id ?? "",
                        mrp: String(p.mrp),
                        price: String(p.price),
                        tax_rate: String(p.tax_rate),
                        weight_grams: p.weight_grams ? String(p.weight_grams) : "",
                        video_url: "",
                        is_active: false,
                        is_featured: false,
                        is_new_arrival: true,
                        is_best_seller: false,
                      })
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-none text-xs" onClick={() => archive.mutate(p.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {draft && (
        <Dialog open onOpenChange={() => setDraft(null)}>
          <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{draft.id ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v, slug: draft.id ? draft.slug : slugify(v) })} />
              <F label="URL slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: slugify(v) })} />
              <F label="SKU" value={draft.sku} onChange={(v) => setDraft({ ...draft, sku: v })} />
              <F label="Brand" value={draft.brand} onChange={(v) => setDraft({ ...draft, brand: v })} />
              <F label="MRP" value={draft.mrp} onChange={(v) => setDraft({ ...draft, mrp: v })} />
              <F label="Selling price" value={draft.price} onChange={(v) => setDraft({ ...draft, price: v })} />
              <F label="Tax / GST %" value={draft.tax_rate} onChange={(v) => setDraft({ ...draft, tax_rate: v })} />
              <F label="Weight (grams)" value={draft.weight_grams} onChange={(v) => setDraft({ ...draft, weight_grams: v })} />
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Category</Label>
                <Select value={draft.category_id} onValueChange={(v) => setDraft({ ...draft, category_id: v })}>
                  <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {parents.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Subcategory</Label>
                <Select value={draft.subcategory_id} onValueChange={(v) => setDraft({ ...draft, subcategory_id: v })}>
                  <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {subs.filter((c) => !draft.category_id || c.parent_id === draft.category_id).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <F label="Video URL" value={draft.video_url} onChange={(v) => setDraft({ ...draft, video_url: v })} />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-[0.14em]">Description</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="mt-1 rounded-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Material</Label>
                <Textarea value={draft.material} onChange={(e) => setDraft({ ...draft, material: e.target.value })} className="mt-1 rounded-none" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-[0.14em]">Care instructions</Label>
                <Textarea value={draft.care_instructions} onChange={(e) => setDraft({ ...draft, care_instructions: e.target.value })} className="mt-1 rounded-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Toggle label="Published" checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
              <Toggle label="Featured" checked={draft.is_featured} onChange={(v) => setDraft({ ...draft, is_featured: v })} />
              <Toggle label="New arrival" checked={draft.is_new_arrival} onChange={(v) => setDraft({ ...draft, is_new_arrival: v })} />
              <Toggle label="Best seller" checked={draft.is_best_seller} onChange={(v) => setDraft({ ...draft, is_best_seller: v })} />
            </div>

            <Button
              onClick={() => save.mutate(draft)}
              disabled={!draft.name || !draft.price || save.isPending}
              className="rounded-none text-xs uppercase tracking-[0.16em]"
            >
              Save product
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {imagesFor && <ImagesDialog productId={imagesFor} onClose={() => setImagesFor(null)} />}
    </div>
  );
}

function ImagesDialog({ productId, onClose }: { productId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data } = useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () => {
      const { data } = await supabase.from("product_images").select("*").eq("product_id", productId).order("position");
      return data ?? [];
    },
  });

  async function addUrl(imageUrl: string) {
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url: imageUrl,
      position: (data ?? []).length,
      is_primary: (data ?? []).length === 0,
    });
    if (error) toast.error(error.message);
    else {
      setUrl("");
      qc.invalidateQueries({ queryKey: ["product-images", productId] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    }
  }

  async function shrinkImage(file: File): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const MAX = 1600;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
    return blob ?? file;
  }

  async function upload(rawFile: File) {
    setUploading(true);
    try {
      const file = await shrinkImage(rawFile);
      const base = rawFile.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/\.[^.]+$/, "");
      const path = `products/${productId}/${crypto.randomUUID()}-${base}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: "image/webp", cacheControl: "31536000" });
      if (error) {
        toast.error(
          /not found/i.test(error.message)
            ? "Image storage isn't set up yet. Please try again in a moment."
            : `Upload failed: ${error.message}`,
        );
        return;
      }
      const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, TEN_YEARS);
      if (signError || !signed?.signedUrl) {
        toast.error("Uploaded, but the image link could not be created. Please try again.");
        return;
      }
      await addUrl(signed.signedUrl);
    } catch (err) {
      toast.error(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(id: string, imageUrl: string) {
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) {
      toast.error(`Could not delete image: ${error.message}`);
      return;
    }
    const marker = `/${BUCKET}/`;
    const idx = imageUrl.indexOf(marker);
    if (idx !== -1) {
      const objectPath = decodeURIComponent(imageUrl.slice(idx + marker.length).split("?")[0]!);
      await supabase.storage.from(BUCKET).remove([objectPath]);
    }
    qc.invalidateQueries({ queryKey: ["product-images", productId] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    toast.success("Image removed");
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Product images</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {(data ?? []).map((img) => (
            <div key={img.id} className="relative">
              <img src={img.url} alt="" className="aspect-4/5 w-full object-cover" />
              <div className="mt-1 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 flex-1 text-[0.6rem]"
                  onClick={async () => {
                    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
                    await supabase.from("product_images").update({ is_primary: true }).eq("id", img.id);
                    qc.invalidateQueries({ queryKey: ["product-images", productId] });
                  }}
                >
                  {img.is_primary ? "Primary" : "Set primary"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[0.6rem]"
                  onClick={() => removeImage(img.id, img.url)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-[0.14em]">Upload image</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                for (const f of files) await upload(f);
              }}
              className="mt-1 rounded-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">Photos are automatically resized to a fast web size before upload.</p>
          </div>
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="or paste an image URL" className="h-10 rounded-none" />
            <Button onClick={() => addUrl(url)} disabled={!url} className="h-10 rounded-none text-xs uppercase">Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.14em]">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 rounded-none" />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between border border-border px-3 py-2">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
