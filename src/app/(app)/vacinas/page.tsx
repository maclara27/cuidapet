"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Pet, Vaccine } from "@/types";
import { VaccineFormModal } from "@/components/vaccine-form-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSingleVaccineStatus, formatDate } from "@/lib/utils";
import {
  Syringe,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Trash2,
  Dog,
  Cat,
  PawPrint,
} from "lucide-react";
import Link from "next/link";

function VacinasContent() {
  const searchParams = useSearchParams();
  const initialPetId = searchParams.get("petId") || "";

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPetsAndVaccines = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      if (isSupabaseConfigured()) {
        const { data: petsData } = await supabase
          .from("pets")
          .select("*")
          .order("name", { ascending: true });

        const petsList = (petsData as Pet[]) || [];
        setPets(petsList);

        const currentPetId =
          selectedPetId || (initialPetId && petsList.some((p) => p.id === initialPetId) ? initialPetId : petsList[0]?.id);

        if (currentPetId) {
          setSelectedPetId(currentPetId);
          const { data: vacData } = await supabase
            .from("vaccines")
            .select("*")
            .eq("pet_id", currentPetId)
            .order("next_booster_date", { ascending: true });

          setVaccines((vacData as Vaccine[]) || []);
        }
      } else {
        // Fallback localstorage
        const petsStr = localStorage.getItem("cuidapet_demo_pets") || "[]";
        const petsList: Pet[] = JSON.parse(petsStr);
        setPets(petsList);

        const currentPetId =
          selectedPetId || (initialPetId && petsList.some((p) => p.id === initialPetId) ? initialPetId : petsList[0]?.id);

        if (currentPetId) {
          setSelectedPetId(currentPetId);
          const vacStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
          const allVacs: Vaccine[] = JSON.parse(vacStr);
          const petVacs = allVacs.filter((v) => v.pet_id === currentPetId);
          setVaccines(petVacs);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados de vacinas:", err);
    } finally {
      setLoading(false);
    }
  }, [initialPetId, selectedPetId]);

  useEffect(() => {
    fetchPetsAndVaccines();
  }, [fetchPetsAndVaccines]);

  const handlePetChange = async (petId: string) => {
    setSelectedPetId(petId);
    setLoading(true);
    try {
      const supabase = createClient();
      if (isSupabaseConfigured()) {
        const { data: vacData } = await supabase
          .from("vaccines")
          .select("*")
          .eq("pet_id", petId)
          .order("next_booster_date", { ascending: true });

        setVaccines((vacData as Vaccine[]) || []);
      } else {
        const vacStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
        const allVacs: Vaccine[] = JSON.parse(vacStr);
        setVaccines(allVacs.filter((v) => v.pet_id === petId));
      }
    } catch (err) {
      console.error("Erro ao filtrar vacinas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsApplied = async (vaccine: Vaccine) => {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const newBooster = nextYear.toISOString().split("T")[0];

    try {
      const supabase = createClient();
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("vaccines")
          .update({
            applied: true,
            application_date: today,
            next_booster_date: newBooster,
          })
          .eq("id", vaccine.id);

        if (error) throw error;
      } else {
        const vacStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
        const allVacs: Vaccine[] = JSON.parse(vacStr);
        const updated = allVacs.map((v) =>
          v.id === vaccine.id
            ? { ...v, applied: true, application_date: today, next_booster_date: newBooster }
            : v
        );
        localStorage.setItem("cuidapet_demo_vaccines", JSON.stringify(updated));
      }

      setVaccines((prev) =>
        prev.map((v) =>
          v.id === vaccine.id
            ? { ...v, applied: true, application_date: today, next_booster_date: newBooster }
            : v
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar vacina:", err);
    }
  };

  const handleDeleteVaccine = async (vaccineId: string) => {
    if (!confirm("Deseja realmente remover esta vacina?")) return;

    try {
      const supabase = createClient();
      if (isSupabaseConfigured()) {
        await supabase.from("vaccines").delete().eq("id", vaccineId);
      } else {
        const vacStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
        const allVacs: Vaccine[] = JSON.parse(vacStr);
        const filtered = allVacs.filter((v) => v.id !== vaccineId);
        localStorage.setItem("cuidapet_demo_vaccines", JSON.stringify(filtered));
      }
      setVaccines((prev) => prev.filter((v) => v.id !== vaccineId));
    } catch (err) {
      console.error("Erro ao deletar vacina:", err);
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4">
      {/* Header */}
      <header className="pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Carteira de Saúde
            </span>
            <h1 className="text-xl font-black text-emerald-950">
              Controle de Vacinas 💉
            </h1>
          </div>
          {pets.length > 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-1.5 shadow-sm rounded-xl font-bold h-10 px-3.5"
            >
              <Plus className="w-4 h-4" />
              <span>Vacina</span>
            </Button>
          )}
        </div>
      </header>

      {/* Caso sem pets */}
      {pets.length === 0 && (
        <div className="bg-white border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center flex flex-col items-center mt-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-primary flex items-center justify-center mb-3">
            <PawPrint className="w-7 h-7 stroke-[2]" />
          </div>
          <h4 className="text-base font-bold text-emerald-950">
            Cadastre seu primeiro pet
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Para registrar vacinas, você precisa primeiro cadastrar um pet no CuidaPet.
          </p>
          <Button asChild className="mt-4 rounded-xl h-10 px-5 text-xs font-bold">
            <Link href="/dashboard">+ Cadastrar Pet no Início</Link>
          </Button>
        </div>
      )}

      {/* Caso com pets */}
      {pets.length > 0 && (
        <div className="space-y-4">
          {/* Seletor do Pet no Topo */}
          <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-soft">
            <label className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-1.5">
              Filtrar por Pet:
            </label>
            <Select value={selectedPetId} onValueChange={handlePetChange}>
              <SelectTrigger className="w-full bg-[#F8FAF9] border-emerald-200/70 font-semibold text-emerald-950">
                <SelectValue placeholder="Selecione um pet..." />
              </SelectTrigger>
              <SelectContent>
                {pets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      {p.species === "Cachorro" ? (
                        <Dog className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Cat className="w-4 h-4 text-emerald-700" />
                      )}
                      <span>
                        {p.name} ({p.species})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Vacinas do Pet */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                Histórico de {selectedPet?.name || "Pet"}
              </h3>
              <span className="text-xs text-muted-foreground font-medium">
                {vaccines.length} {vaccines.length === 1 ? "vacina" : "vacinas"}
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                <span className="text-xs">Carregando vacinas...</span>
              </div>
            ) : vaccines.length === 0 ? (
              <div className="bg-white rounded-2xl border border-emerald-100 p-6 text-center shadow-soft">
                <Syringe className="w-8 h-8 text-primary/50 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-emerald-950">
                  Nenhuma vacina registrada para {selectedPet?.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                  Mantenha a proteção em dia adicionando a primeira dose ou reforço.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 gap-1.5 rounded-xl h-10 px-5 text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Vacina
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccines.map((vaccine) => {
                  const statusInfo = getSingleVaccineStatus(vaccine);

                  return (
                    <Card
                      key={vaccine.id}
                      className="border border-emerald-100 shadow-soft hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-emerald-950">
                                {vaccine.name}
                              </h4>
                            </div>
                            {vaccine.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {vaccine.notes}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={statusInfo.badgeVariant}
                            className="shrink-0 text-xs px-2.5 py-0.5"
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        {/* Datas */}
                        <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-[#F8FAF9] text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                              Aplicada em:
                            </span>
                            <div className="flex items-center gap-1 font-semibold text-emerald-950 mt-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{formatDate(vaccine.application_date)}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                              Próximo Reforço:
                            </span>
                            <div className="flex items-center gap-1 font-semibold text-emerald-950 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>
                                {vaccine.next_booster_date
                                  ? formatDate(vaccine.next_booster_date)
                                  : "Não agendado"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Descritivo e Ação */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {statusInfo.description}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsApplied(vaccine)}
                              className="h-8 text-[11px] font-bold px-2.5 gap-1 rounded-lg border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                              title="Atualizar aplicação para hoje e renovar reforço em 1 ano"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Aplicada hoje
                            </Button>

                            <button
                              type="button"
                              onClick={() => handleDeleteVaccine(vaccine.id)}
                              className="text-gray-300 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                              title="Excluir vacina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Vacina */}
      <VaccineFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        pets={pets}
        selectedPetId={selectedPetId}
        onVaccineCreated={(newVac) => {
          setVaccines((prev) => [...prev, newVac]);
        }}
      />
    </div>
  );
}

export default function VacinasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <span className="text-xs">Carregando carteira de vacinas...</span>
        </div>
      }
    >
      <VacinasContent />
    </Suspense>
  );
}
