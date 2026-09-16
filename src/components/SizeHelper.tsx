import { useState } from "react";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recommendSize } from "@/lib/format";

type Chart = { note?: string; rows?: { size: string; chest: string; length: string }[] } | null;

export function SizeHelper({ chart }: { chart: Chart }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fit, setFit] = useState<"slim" | "regular" | "oversized">("regular");
  const [gender, setGender] = useState<"men" | "women">("men");
  const [result, setResult] = useState<string | null>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-xs uppercase tracking-[0.14em]">
          <Ruler className="mr-1.5 size-3.5" /> Size guide & fit helper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Find your size</DialogTitle>
          <DialogDescription>
            An estimate based on your measurements. Please also check the size chart below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Height (cm)</Label>
            <Input value={height} onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))} className="mt-1 h-10 rounded-none" />
          </div>
          <div>
            <Label className="text-xs">Weight (kg)</Label>
            <Input value={weight} onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))} className="mt-1 h-10 rounded-none" />
          </div>
          <div>
            <Label className="text-xs">Preferred fit</Label>
            <Select value={fit} onValueChange={(v) => setFit(v as typeof fit)}>
              <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Slim</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="oversized">Oversized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Body type</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
              <SelectTrigger className="mt-1 h-10 rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="rounded-none text-xs uppercase tracking-[0.16em]"
          disabled={!height || !weight}
          onClick={() => setResult(recommendSize({ heightCm: Number(height), weightKg: Number(weight), fit, gender }))}
        >
          Recommend my size
        </Button>

        {result && (
          <div className="animate-scale-in border border-gold bg-gold-soft/30 p-4 text-center">
            <p className="eyebrow text-muted-foreground">Recommended Size</p>
            <p className="font-display text-4xl">{result}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              This is an estimate only. Please also check the size chart before ordering.
            </p>
          </div>
        )}

        {chart?.rows?.length ? (
          <div className="mt-2">
            <p className="eyebrow mb-2">Size chart</p>
            <table className="w-full border border-border text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="p-2 text-left font-medium">Size</th>
                  <th className="p-2 text-left font-medium">Chest</th>
                  <th className="p-2 text-left font-medium">Length</th>
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((r) => (
                  <tr key={r.size} className="border-t border-border">
                    <td className="p-2">{r.size}</td>
                    <td className="p-2">{r.chest}"</td>
                    <td className="p-2">{r.length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {chart.note && <p className="mt-2 text-xs text-muted-foreground">{chart.note}</p>}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
