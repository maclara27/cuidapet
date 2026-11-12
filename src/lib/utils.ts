import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Vaccine } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula a idade de forma legível em português a partir da data de nascimento.
 */
export function calculateAge(birthDateString?: string | null): string {
  if (!birthDateString) return "Idade não informada";

  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return "Idade não informada";

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "Recém-nascido";

  if (years === 0) {
    if (months === 0) {
      const diffTime = Math.abs(today.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1 ? "1 dia" : `${diffDays} dias`;
    }
    return months === 1 ? "1 mês" : `${months} meses`;
  }

  if (months === 0) {
    return years === 1 ? "1 ano" : `${years} anos`;
  }

  const yearStr = years === 1 ? "1 ano" : `${years} anos`;
  const monthStr = months === 1 ? "1 mês" : `${months} meses`;
  return `${yearStr} e ${monthStr}`;
}

/**
 * Formata data ISO para pt-BR (DD/MM/AAAA)
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export type VaccineStatusType = "up_to_date" | "upcoming" | "delayed" | "none";

export interface ComputedVaccineStatus {
  status: VaccineStatusType;
  label: "Em dia" | "Próxima" | "Atrasada" | "Sem vacinas";
  badgeVariant: "success" | "warning" | "destructive" | "neutral";
  description: string;
}

/**
 * Avalia o status de uma vacina individual com base na data de reforço
 */
export function getSingleVaccineStatus(vaccine: Vaccine): ComputedVaccineStatus {
  if (!vaccine.next_booster_date) {
    return {
      status: "up_to_date",
      label: "Em dia",
      badgeVariant: "success",
      description: "Aplicada (sem reforço agendado)",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const boosterDate = new Date(vaccine.next_booster_date);
  boosterDate.setHours(0, 0, 0, 0);

  const diffTime = boosterDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "delayed",
      label: "Atrasada",
      badgeVariant: "destructive",
      description: `Atrasada há ${Math.abs(diffDays)} dia(s)`,
    };
  }

  if (diffDays <= 30) {
    return {
      status: "upcoming",
      label: "Próxima",
      badgeVariant: "warning",
      description: diffDays === 0 ? "Vence hoje!" : `Vence em ${diffDays} dia(s)`,
    };
  }

  return {
    status: "up_to_date",
    label: "Em dia",
    badgeVariant: "success",
    description: `Reforço em ${formatDate(vaccine.next_booster_date)}`,
  };
}

/**
 * Avalia o status geral das vacinas de um pet
 */
export function getOverallPetVaccineStatus(vaccines: Vaccine[] = []): ComputedVaccineStatus {
  if (!vaccines || vaccines.length === 0) {
    return {
      status: "none",
      label: "Sem vacinas",
      badgeVariant: "neutral",
      description: "Nenhuma vacina registrada",
    };
  }

  let hasDelayed = false;
  let hasUpcoming = false;
  let closestUpcomingDays = Infinity;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const v of vaccines) {
    if (!v.next_booster_date) continue;
    const booster = new Date(v.next_booster_date);
    booster.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((booster.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      hasDelayed = true;
    } else if (diffDays <= 30) {
      hasUpcoming = true;
      if (diffDays < closestUpcomingDays) closestUpcomingDays = diffDays;
    }
  }

  if (hasDelayed) {
    return {
      status: "delayed",
      label: "Atrasada",
      badgeVariant: "destructive",
      description: "Existe vacina pendente",
    };
  }

  if (hasUpcoming) {
    return {
      status: "upcoming",
      label: "Próxima",
      badgeVariant: "warning",
      description: closestUpcomingDays === 0 ? "Reforço hoje" : `Reforço em ${closestUpcomingDays}d`,
    };
  }

  return {
    status: "up_to_date",
    label: "Em dia",
    badgeVariant: "success",
    description: "Todas as vacinas em dia",
  };
}

