import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smartphone } from "lucide-react";
import { EPRELDataManager, type PhoneModel, type LabelMetrics } from "@/services/apiService";

// Demo data
const DEMO_DATA: PhoneModel[] = [
  {
    id: "demo-fairphone-5",
    brand: "Fairphone",
    modelName: "Fairphone 5",
    eprelUrl: "https://eprel.ec.europa.eu/public/…",
    metrics: {
      energyClass: "B",
      autonomyMinutes: 1450,
      cycleLifeTo80: 1000,
      durabilityDrops: 50,
      ipRating: "IP55",
      reparabilityScore: "A",
    },
  },
  {
    id: "demo-samsung-s24",
    brand: "Samsung",
    modelName: "Galaxy S24",
    eprelUrl: "https://eprel.ec.europa.eu/public/…",
    metrics: {
      energyClass: "C",
      autonomyMinutes: 1700,
      cycleLifeTo80: 800,
      durabilityDrops: 45,
      ipRating: "IP68",
      reparabilityScore: "B",
    },
  },
  {
    id: "demo-apple-iphone-15",
    brand: "Apple",
    modelName: "iPhone 15",
    eprelUrl: "https://eprel.ec.europa.eu/public/…",
    metrics: {
      energyClass: "C",
      autonomyMinutes: 1600,
      cycleLifeTo80: 800,
      durabilityDrops: 48,
      ipRating: "IP68",
      reparabilityScore: "C",
    },
  },
];

// Configuration (API Key & URL définis uniquement dans le code)
const EPREL_API_KEY = "j6t3lvmzll6ovEehi9ePS2sWlqWsIv4Va7ThCdaR"; // ⚠️ Remplacez par votre clé API
const EPREL_BASE_URL = "https://eprel.ec.europa.eu/api/public"; // https://eprel.ec.europa.eu/api/public";

// Adapter (demo + real API)
class EPRELAdapter {
  baseUrl: string;
  apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async listModelsDemo(brand?: string): Promise<PhoneModel[]> {
    return brand ? DEMO_DATA.filter((x) => x.brand === brand) : DEMO_DATA;
  }

  async listModels(brand?: string): Promise<PhoneModel[]> {
    if (!this.apiKey) return this.listModelsDemo(brand);
    try {
      const url = `${this.baseUrl}/products?productGroup=smartphones${brand ? `&brand=${encodeURIComponent(brand)}` : ""}`;
      const resp = await fetch(url, {
        headers: { "x-api-key": this.apiKey },
      });
      if (!resp.ok) throw new Error("API error");
      const data = await resp.json();
      return (data?.products || []).map((p: any) => ({
        id: p.modelIdentifier,
        brand: p.brand,
        modelName: p.modelName,
        eprelUrl: p.publicUrl,
        metrics: {
          energyClass: p.energyClass ?? "—",
          autonomyMinutes: p.autonomyMinutes ?? undefined,
          cycleLifeTo80: p.cycleLifeTo80 ?? undefined,
          durabilityDrops: p.durabilityDrops ?? undefined,
          ipRating: p.ipRating ?? "—",
          reparabilityScore: p.reparabilityScore ?? "—",
        },
      }));
    } catch (e) {
      console.error(e);
      return this.listModelsDemo(brand);
    }
  }

  async getModelById(id: string): Promise<PhoneModel | null> {
    if (!this.apiKey) return DEMO_DATA.find((x) => x.id === id) || null;
    try {
      const url = `${this.baseUrl}/products/${id}`;
      const resp = await fetch(url, {
        headers: { "x-api-key": this.apiKey },
      });
      if (!resp.ok) throw new Error("API error");
      const p = await resp.json();
      return {
        id: p.modelIdentifier,
        brand: p.brand,
        modelName: p.modelName,
        eprelUrl: p.publicUrl,
        metrics: {
          energyClass: p.energyClass ?? "—",
          autonomyMinutes: p.autonomyMinutes ?? undefined,
          cycleLifeTo80: p.cycleLifeTo80 ?? undefined,
          durabilityDrops: p.durabilityDrops ?? undefined,
          ipRating: p.ipRating ?? "—",
          reparabilityScore: p.reparabilityScore ?? "—",
        },
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

function pretty(x: any) {
  if (x === null || x === undefined || x === "") return "—";
  return String(x);
}

function minutesToHhMm(min?: number) {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export default function EPRELSmartphonesComparator() {
  const [brand, setBrand] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selected, setSelected] = useState<PhoneModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Load brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await EPRELDataManager.getBrands();

        if (result.error) {
          console.error("Error loading brands:", result.error);
          setError(result.error);
          // Fallback to demo data
          const demoBrands = Array.from(new Set(DEMO_DATA.map((m) => m.brand))).sort();
          setBrands(demoBrands);
          setModels(DEMO_DATA);
        } else if (result.data) {
          setBrands(result.data.brands);
          // Also load all smartphones to populate models
          const smartphonesResult = await EPRELDataManager.getSmartphones();
          if (smartphonesResult.data) {
            setModels(smartphonesResult.data.smartphones);
          } else {
            setModels(DEMO_DATA);
          }
        }
      } catch (err) {
        console.error("Unexpected error loading brands:", err);
        setError("Erreur de connexion au serveur");
        // Fallback to demo data
        const demoBrands = Array.from(new Set(DEMO_DATA.map((m) => m.brand))).sort();
        setBrands(demoBrands);
        setModels(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // Load models when brand changes
  useEffect(() => {
    if (!brand) return;

    const loadModelsForBrand = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await EPRELDataManager.getSmartphones({ brand });

        if (result.error) {
          console.error("Error loading models for brand:", result.error);
          setError(result.error);
          // Fallback to demo data filtered by brand
          setModels(DEMO_DATA.filter((m) => m.brand === brand));
        } else if (result.data) {
          setModels(result.data.smartphones);
        }
      } catch (err) {
        console.error("Unexpected error loading models:", err);
        setError("Erreur de connexion au serveur");
        setModels(DEMO_DATA.filter((m) => m.brand === brand));
      } finally {
        setLoading(false);
      }
    };

    loadModelsForBrand();
  }, [brand]);

  const modelsForBrand = useMemo(() => models.filter((m) => (brand ? m.brand === brand : true)), [models, brand]);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);

  const addSelection = async () => {
    if (!modelId || selectedIds.has(modelId)) return;

    setLoading(true);
    setError("");

    try {
      // Find the model in current models list first
      let detail = models.find((m) => m.id === modelId);

      if (!detail) {
        // If not found, try to fetch from API
        const result = await EPRELDataManager.getSmartphones(); // Get all to find the model
        if (result.data) {
          detail = result.data.smartphones.find((m) => m.id === modelId);
        }

        // Final fallback to demo data
        if (!detail) {
          detail = DEMO_DATA.find((m) => m.id === modelId);
        }
      }

      if (detail) {
        setSelected((prev) => [...prev, detail!].slice(0, 3));
      } else {
        setError("Modèle non trouvé");
      }
    } catch (err) {
      console.error("Error adding selection:", err);
      setError("Erreur lors de l'ajout du modèle");
    } finally {
      setLoading(false);
    }

    setModelId("");
  };

  const reset = () => {
    setSelected([]);
    setBrand("");
    setModelId("");
    setError("");
  };

  const fields: { key: keyof LabelMetrics | "brand" | "modelName"; label: string; format?: (v: any) => string }[] = [
    { key: "brand", label: "Marque" },
    { key: "modelName", label: "Modèle" },
    { key: "energyClass", label: "Classe énergétique" },
    { key: "autonomyMinutes", label: "Autonomie (1 cycle)", format: minutesToHhMm },
    { key: "cycleLifeTo80", label: "Nombre de cycles (80%)" },
    { key: "durabilityDrops", label: "Durabilité (chutes)" },
    { key: "ipRating", label: "Indice IP" },
    { key: "reparabilityScore", label: "Réparabilité" },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <Smartphone className="w-6 h-6" />
          <h1 className="text-lg font-semibold">Comparateur EPREL – Smartphones</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md p-4 space-y-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 space-y-3">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {/* Brand selector with search */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between" disabled={loading}>
                    {loading ? "Chargement..." : brand || "Marque"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher une marque..." />
                    <CommandList>
                      <CommandEmpty>Aucune marque trouvée</CommandEmpty>
                      <CommandGroup>
                        {brands.map((b) => (
                          <CommandItem
                            key={b}
                            value={b}
                            onSelect={() => {
                              setBrand(b);
                              setModelId("");
                              setError("");
                            }}
                          >
                            {b}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Model selector with search */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={!brand || loading}
                  >
                    {loading
                      ? "Chargement..."
                      : modelId
                        ? modelsForBrand.find((m) => m.id === modelId)?.modelName
                        : brand
                          ? "Modèle"
                          : "Choisissez d'abord une marque"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Rechercher un modèle..." />
                    <CommandList>
                      <CommandEmpty>Aucun modèle trouvé</CommandEmpty>
                      <CommandGroup>
                        {modelsForBrand.map((m) => (
                          <CommandItem key={m.id} value={m.id} onSelect={() => setModelId(m.id)}>
                            {m.modelName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button onClick={addSelection} disabled={!modelId || loading} className="w-full">
                {loading ? "Ajout en cours..." : "Ajouter à la comparaison"}
              </Button>
              <Button onClick={reset} variant="outline" className="w-full" disabled={loading}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">Comparaison</h2>

          {selected.length === 0 && !loading && (
            <div className="text-sm text-gray-500">Ajoutez jusqu'à 3 smartphones pour les comparer.</div>
          )}

          {loading && selected.length === 0 && <div className="text-sm text-blue-500">Chargement des données...</div>}

          {selected.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Critère</th>
                    {selected.map((m) => (
                      <th key={m.id} className="p-2 text-center border-l">
                        {m.brand} {m.modelName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f) => (
                    <tr key={f.key} className="border-t">
                      <td className="p-2 font-medium text-gray-700">{f.label}</td>
                      {selected.map((m) => {
                        let val;
                        if (f.key === "brand" || f.key === "modelName") {
                          val = m[f.key as "brand"];
                        } else {
                          val = (m.metrics as any)[f.key];
                        }
                        return (
                          <td key={m.id + f.key} className="p-2 text-center border-l">
                            {f.format ? f.format(val) : pretty(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
