"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Pet, Vaccine } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Syringe, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface VaccineFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pets: Pet[];
  selectedPetId?: string;
  onVaccineCreated: (vaccine: Vaccine) => void;
}

const COMMON_VACCINES = {
  Cachorro: [
    "V10 / V8 (Polivalente)",
    "Antirrábica (Raiva)",
    "Giárdia",
    "Gripe Canina (Tosse dos Canis)",
    "Leishmaniose",
  ],
  Gato: [
    "V4 / V5 (Quádrupla / Quíntupla Felina)",
    "Antirrábica (Raiva Felina)",
    "FeLV (Leucemia Felina)",
  ],
};

export function VaccineFormModal({
  open,
  onOpenChange,
  pets,
  selectedPetId,
  onVaccineCreated,
}: VaccineFormModalProps) {
  const [petId, setPetId] = useState<string>(selectedPetId || (pets[0]?.id || ""));
  const [name, setName] = useState("");
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [nextBoosterDate, setNextBoosterDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePet = pets.find((p) => p.id === (petId || selectedPetId)) || pets[0];

  const handleSelectSuggested = (vaccineName: string) => {
    setName(vaccineName);
    // Automaticamente sugere reforço para 1 ano à frente se ainda não preenchido
    if (!nextBoosterDate && applicationDate) {
      const appDate = new Date(applicationDate);
      appDate.setFullYear(appDate.getFullYear() + 1);
      setNextBoosterDate(appDate.toISOString().split("T")[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPetId = petId || selectedPetId || pets[0]?.id;

    if (!currentPetId) {
      setErrorMessage("Selecione um pet para associar a vacina.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Por favor, digite o nome da vacina.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();

      if (isSupabaseConfigured()) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
          throw new Error("Usuário não autenticado no Supabase.");
        }

        const { data: insertedVaccine, error } = await supabase
          .from("vaccines")
          .insert({
            pet_id: currentPetId,
            user_id: userId,
            name: name.trim(),
            application_date: applicationDate,
            next_booster_date: nextBoosterDate || null,
            applied: true,
            notes: notes.trim() || null,
          })
          .select()
          .single();

        if (error) throw error;
        onVaccineCreated(insertedVaccine as Vaccine);
      } else {
        // Fallback demo local
        const demoVaccine: Vaccine = {
          id: "vac-" + Date.now(),
          pet_id: currentPetId,
          user_id: "demo-user",
          name: name.trim(),
          application_date: applicationDate,
          next_booster_date: nextBoosterDate || null,
          applied: true,
          notes: notes.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existingStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
        const existing: Vaccine[] = JSON.parse(existingStr);
        existing.unshift(demoVaccine);
        localStorage.setItem("cuidapet_demo_vaccines", JSON.stringify(existing));
        onVaccineCreated(demoVaccine);
      }

      setName("");
      setNextBoosterDate("");
      setNotes("");
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || "Erro ao registrar vacina.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = activePet?.species === "Gato" ? COMMON_VACCINES.Gato : COMMON_VACCINES.Cachorro;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2">
            <Syringe className="w-5 h-5 text-primary" />
            Registrar Vacina
          </SheetTitle>
          <SheetDescription>
            Mantenha o histórico imunológico do seu pet sempre atualizado.
          </SheetDescription>
        </SheetHeader>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Seletor do Pet */}
          {pets.length > 1 && (
            <div className="space-y-1.5">
              <Label>Para qual pet? *</Label>
              <Select
                value={petId || selectedPetId || pets[0]?.id}
                onValueChange={(val) => setPetId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nome da Vacina */}
          <div className="space-y-1.5">
            <Label htmlFor="vaccine-name">Nome da Vacina *</Label>
            <Input
              id="vaccine-name"
              placeholder="Ex: V10, Antirrábica, Giárdia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Sugestões rápidas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSelectSuggested(sug)}
                  className="text-[10px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-lg transition-colors font-medium"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Data de Aplicação */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="app-date">Data da Aplicação *</Label>
              <Input
                id="app-date"
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                required
              />
            </div>

            {/* Data do Próximo Reforço */}
            <div className="space-y-1.5">
              <Label htmlFor="booster-date">Próximo Reforço</Label>
              <Input
                id="booster-date"
                type="date"
                value={nextBoosterDate}
                onChange={(e) => setNextBoosterDate(e.target.value)}
              />
            </div>
          </div>

          {/* Observações / Veterinário */}
          <div className="space-y-1.5">
            <Label htmlFor="vac-notes">Observações / Clínica (Opcional)</Label>
            <Input
              id="vac-notes"
              placeholder="Ex: Clínica Veterinária São Francisco, Lote 1234"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-bold shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando Vacina...
                </>
              ) : (
                "Salvar Vacina"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

