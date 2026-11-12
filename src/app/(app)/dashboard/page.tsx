"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PetWithVaccines } from "@/types";
import { PetCard } from "@/components/pet-card";
import { PetFormModal } from "@/components/pet-form-modal";
import { Button } from "@/components/ui/button";
import {
  PawPrint,
  Plus,
  LogOut,
  Syringe,
  Sparkles,
  HeartHandshake,
  Loader2,
  CalendarCheck,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [pets, setPets] = useState<PetWithVaccines[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      if (isSupabaseConfigured()) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUserEmail(userData.user.email || null);
        }

        // Busca pets com suas vacinas
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select("*, vaccines(*)")
          .order("created_at", { ascending: false });

        if (petsError) throw petsError;
        setPets((petsData as PetWithVaccines[]) || []);
      } else {
        // Fallback localstorage para demo/ambiente de desenvolvimento
        const demoUser = localStorage.getItem("cuidapet_demo_user");
        if (demoUser) {
          try {
            setUserEmail(JSON.parse(demoUser).email);
          } catch {
            setUserEmail("tutor@cuidapet.app");
          }
        }

        const petsStr = localStorage.getItem("cuidapet_demo_pets") || "[]";
        const vacsStr = localStorage.getItem("cuidapet_demo_vaccines") || "[]";
        const demoPets = JSON.parse(petsStr);
        const demoVacs = JSON.parse(vacsStr);

        const merged = demoPets.map((p: PetWithVaccines) => ({
          ...p,
          vaccines: demoVacs.filter((v: { pet_id: string }) => v.pet_id === p.id),
        }));

        setPets(merged);
      }
    } catch (err) {
      console.error("Erro ao carregar pets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleSignOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out local fallback", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("cuidapet_demo_user");
    }
    router.replace("/login");
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm("Tem certeza que deseja remover este pet?")) return;

    try {
      const supabase = createClient();
      if (isSupabaseConfigured()) {
        await supabase.from("pets").delete().eq("id", petId);
      } else {
        const petsStr = localStorage.getItem("cuidapet_demo_pets") || "[]";
        const filtered = JSON.parse(petsStr).filter((p: { id: string }) => p.id !== petId);
        localStorage.setItem("cuidapet_demo_pets", JSON.stringify(filtered));
      }
      setPets((prev) => prev.filter((p) => p.id !== petId));
    } catch (err) {
      console.error("Erro ao excluir pet:", err);
    }
  };

  // Contagem de resumo
  const totalPets = pets.length;
  const totalVaccines = pets.reduce((acc, p) => acc + (p.vaccines?.length || 0), 0);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-5">
      {/* Header com saudação e logout */}
      <header className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-sm">
            <PawPrint className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              CuidaPet
            </span>
            <h1 className="text-xl font-black text-emerald-950 leading-tight">
              Olá, tutor! 👋
            </h1>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
          title="Sair da conta"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Banner de Boas-vindas & Ação de Destaque */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B7A56] via-[#166749] to-[#0F4632] p-5 text-white shadow-soft">
        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-medium text-emerald-100">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                Cuidado preventivo
              </span>
              <h2 className="text-lg font-bold mt-2">
                Seus pets sempre saudáveis
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5 max-w-[230px]">
                Acompanhe carteira de vacinas, nutrição correta e tire dúvidas com IA.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-emerald-200" />
            </div>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-white text-primary hover:bg-emerald-50 active:bg-emerald-100 font-bold shadow-md h-11 rounded-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Cadastrar Novo Pet
          </Button>
        </div>

        {/* Círculo decorativo */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Mini Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-emerald-100/60 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-emerald-950">
              {totalPets}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {totalPets === 1 ? "Pet cadastrado" : "Pets cadastrados"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-emerald-100/60 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-emerald-950">
              {totalVaccines}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">
              {totalVaccines === 1 ? "Vacina salva" : "Vacinas salvas"}
            </div>
          </div>
        </div>
      </div>

      {/* Seção da Lista de Pets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
            Meus Companheiros
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            {pets.length} {pets.length === 1 ? "animal" : "animais"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <span className="text-xs">Buscando pets...</span>
          </div>
        ) : pets.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-emerald-200 rounded-3xl p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-primary flex items-center justify-center mb-3">
              <PawPrint className="w-7 h-7 stroke-[2]" />
            </div>
            <h4 className="text-base font-bold text-emerald-950">
              Nenhum pet cadastrado
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
              Cadastre seu cão ou gato para acompanhar a saúde e as próximas vacinas.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 gap-1.5 rounded-xl h-10 px-5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onDelete={handleDeletePet}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal/Drawer de Cadastro de Pet */}
      <PetFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onPetCreated={(newPet) => {
          setPets((prev) => [newPet, ...prev]);
        }}
      />
    </div>
  );
}

