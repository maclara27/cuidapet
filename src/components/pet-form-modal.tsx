"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Pet, Species } from "@/types";
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
import { Camera, Dog, Cat, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface PetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPetCreated: (pet: Pet) => void;
}

export function PetFormModal({
  open,
  onOpenChange,
  onPetCreated,
}: PetFormModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("Cachorro");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("A imagem deve ter no máximo 5MB.");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const resetForm = () => {
    setName("");
    setSpecies("Cachorro");
    setBreed("");
    setBirthDate("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Por favor, digite o nome do pet.");
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      let photoUrl: string | null = null;

      // 1. Upload da foto se houver
      if (photoFile) {
        if (isSupabaseConfigured()) {
          const fileExt = photoFile.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("pet-avatars")
            .upload(filePath, photoFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from("pet-avatars")
              .getPublicUrl(filePath);
            photoUrl = publicUrlData.publicUrl;
          } else {
            console.warn("Storage upload warning, using preview as fallback:", uploadError);
            photoUrl = photoPreview;
          }
        } else {
          // Fallback para modo demo local
          photoUrl = photoPreview;
        }
      }

      // 2. Salvar pet no banco
      if (isSupabaseConfigured()) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (!userId) {
          throw new Error("Usuário não autenticado no Supabase.");
        }

        const { data: insertedPet, error: insertError } = await supabase
          .from("pets")
          .insert({
            user_id: userId,
            name: name.trim(),
            species,
            breed: breed.trim() || null,
            birth_date: birthDate || null,
            photo_url: photoUrl,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        onPetCreated(insertedPet as Pet);
      } else {
        // Fallback localstorage
        const demoPet: Pet = {
          id: "pet-" + Date.now(),
          user_id: "demo-user",
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          birth_date: birthDate || null,
          photo_url: photoUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const existingStr = localStorage.getItem("cuidapet_demo_pets") || "[]";
        const existing: Pet[] = JSON.parse(existingStr);
        existing.unshift(demoPet);
        localStorage.setItem("cuidapet_demo_pets", JSON.stringify(existing));
        onPetCreated(demoPet);
      }

      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || "Erro ao cadastrar pet. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">Cadastrar Novo Pet</SheetTitle>
          <SheetDescription>
            Adicione os dados do seu companheiro para acompanhar a saúde e vacinas.
          </SheetDescription>
        </SheetHeader>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center">
            <label
              htmlFor="pet-photo-upload"
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all shadow-inner group"
            >
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Prévia do Pet"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <Camera className="w-7 h-7 mb-1" />
                  <span className="text-[10px] font-bold">Foto</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                Alterar
              </div>
            </label>
            <input
              id="pet-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <span className="text-[11px] text-muted-foreground mt-1.5">
              Toque para escolher uma foto
            </span>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="pet-name">Nome do Pet *</Label>
            <Input
              id="pet-name"
              placeholder="Ex: Thor, Mel, Luna..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Espécie */}
          <div className="space-y-1.5">
            <Label>Espécie *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpecies("Cachorro")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  species === "Cachorro"
                    ? "bg-emerald-50 border-primary text-primary shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Dog className="w-4 h-4" />
                Cachorro
              </button>
              <button
                type="button"
                onClick={() => setSpecies("Gato")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  species === "Gato"
                    ? "bg-emerald-50 border-primary text-primary shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Cat className="w-4 h-4" />
                Gato
              </button>
            </div>
          </div>

          {/* Raça */}
          <div className="space-y-1.5">
            <Label htmlFor="pet-breed">Raça</Label>
            <Input
              id="pet-breed"
              placeholder="Ex: Vira-lata (SRD), Golden, Siamês..."
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-1.5">
            <Label htmlFor="pet-birth">Data de Nascimento</Label>
            <Input
              id="pet-birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="submit"
              disabled={uploading}
              className="w-full h-12 text-sm font-bold shadow-md"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando Pet...
                </>
              ) : (
                "Salvar Pet"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

