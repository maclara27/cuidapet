"use client";

import Link from "next/link";
import Image from "next/image";
import { PetWithVaccines } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateAge, getOverallPetVaccineStatus } from "@/lib/utils";
import { Dog, Cat, Calendar, Syringe, ChevronRight, Trash2 } from "lucide-react";

interface PetCardProps {
  pet: PetWithVaccines;
  onDelete?: (id: string) => void;
}

export function PetCard({ pet, onDelete }: PetCardProps) {
  const age = calculateAge(pet.birth_date);
  const vaccineStatus = getOverallPetVaccineStatus(pet.vaccines || []);

  return (
    <Card className="overflow-hidden border border-emerald-100/80 shadow-soft hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-3.5">
          {/* Circular Photo */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-emerald-50 border-2 border-white shadow-sm flex items-center justify-center">
            {pet.photo_url ? (
              <Image
                src={pet.photo_url}
                alt={pet.name}
                fill
                className="object-cover"
              />
            ) : pet.species === "Cachorro" ? (
              <Dog className="w-8 h-8 text-primary/70" />
            ) : (
              <Cat className="w-8 h-8 text-primary/70" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-base font-bold text-emerald-950 truncate">
                {pet.name}
              </h4>
              <Badge variant={vaccineStatus.badgeVariant} className="text-[10px] px-2 py-0.5 shrink-0">
                {vaccineStatus.label}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {pet.breed || pet.species} • {pet.species}
            </p>

            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-800/80 font-medium">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>{age}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-3.5 pt-3 border-t border-gray-100/80 flex items-center justify-between text-xs">
          <Link
            href={`/vacinas?petId=${pet.id}`}
            className="flex items-center gap-1 text-primary hover:text-emerald-800 font-semibold transition-colors"
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Ver carteira de vacinas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(pet.id)}
              className="text-gray-300 hover:text-red-500 p-1 rounded-lg transition-colors"
              title="Excluir pet"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

