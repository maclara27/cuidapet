"use client";

import { useState, useMemo } from "react";
import { NUTRITION_FOODS } from "@/lib/nutrition-data";
import { FoodItem, FoodStatus } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Dog,
  Cat,
  Lightbulb,
  X,
} from "lucide-react";

export default function NutricaoPage() {
  const [activeTab, setActiveTab] = useState<"dog" | "cat">("dog");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FoodStatus | "all">("all");

  const filteredFoods = useMemo(() => {
    return NUTRITION_FOODS.filter((food) => {
      // 1. Filtro por espécie da aba
      const matchSpecies =
        food.species === "both" || food.species === activeTab;
      if (!matchSpecies) return false;

      // 2. Filtro por status
      if (statusFilter !== "all" && food.status !== statusFilter) {
        return false;
      }

      // 3. Filtro por termo de busca
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inName = food.name.toLowerCase().includes(query);
        const inExplanation = food.explanation.toLowerCase().includes(query);
        const inCategory = food.category.toLowerCase().includes(query);
        return inName || inExplanation || inCategory;
      }

      return true;
    });
  }, [activeTab, statusFilter, searchQuery]);

  const getStatusBadge = (status: FoodStatus) => {
    switch (status) {
      case "can_eat":
        return {
          variant: "success" as const,
          label: "Pode comer",
          icon: CheckCircle,
          borderColor: "border-l-emerald-500",
        };
      case "moderate":
        return {
          variant: "warning" as const,
          label: "Com moderação",
          icon: AlertTriangle,
          borderColor: "border-l-amber-500",
        };
      case "toxic":
        return {
          variant: "destructive" as const,
          label: "Proibido / Tóxico",
          icon: XCircle,
          borderColor: "border-l-red-500",
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4">
      {/* Header */}
      <header className="pt-2">
        <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
          Guia de Alimentação
        </span>
        <h1 className="text-xl font-black text-emerald-950">
          Alimentação Segura 🥑
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Consulte se o alimento é seguro antes de oferecer ao seu animalzinho.
        </p>
      </header>

      {/* Tabs Cães vs Gatos */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "dog" | "cat")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full h-12 bg-emerald-50/80 p-1">
          <TabsTrigger
            value="dog"
            className="flex items-center justify-center gap-2 font-bold text-xs data-[state=active]:text-primary"
          >
            <Dog className="w-4 h-4" />
            Alimentos para Cães
          </TabsTrigger>
          <TabsTrigger
            value="cat"
            className="flex items-center justify-center gap-2 font-bold text-xs data-[state=active]:text-primary"
          >
            <Cat className="w-4 h-4" />
            Alimentos para Gatos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Busca e Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <Input
            placeholder="Buscar alimento (ex: maçã, chocolate, frango...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-9 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Botões de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              statusFilter === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Todos ({NUTRITION_FOODS.filter(f => f.species === "both" || f.species === activeTab).length})
          </button>
          <button
            onClick={() => setStatusFilter("can_eat")}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              statusFilter === "can_eat"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100"
            }`}
          >
            ✅ Pode comer
          </button>
          <button
            onClick={() => setStatusFilter("moderate")}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              statusFilter === "moderate"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100"
            }`}
          >
            ⚠️ Com moderação
          </button>
          <button
            onClick={() => setStatusFilter("toxic")}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              statusFilter === "toxic"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 text-red-800 border border-red-200/60 hover:bg-red-100"
            }`}
          >
            🚫 Proibido / Tóxico
          </button>
        </div>
      </div>

      {/* Lista de Alimentos */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>{filteredFoods.length} alimentos encontrados</span>
          <span className="capitalize">
            {activeTab === "dog" ? "Guia Canino" : "Guia Felino"}
          </span>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-soft">
            <Utensils className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-gray-800">
              Nenhum alimento encontrado
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Tente buscar por outro termo ou limpe os filtros.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredFoods.map((item) => {
              const statusCfg = getStatusBadge(item.status);
              const StatusIcon = statusCfg.icon;

              return (
                <Card
                  key={item.id}
                  className={`border border-emerald-100 shadow-soft hover:shadow-md transition-all border-l-4 ${statusCfg.borderColor}`}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-emerald-950">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <Badge
                        variant={statusCfg.variant}
                        className="text-[10px] px-2 py-0.5 shrink-0 flex items-center gap-1 font-bold"
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                      {item.explanation}
                    </p>

                    {item.tip && (
                      <div className="mt-2.5 p-2 rounded-xl bg-[#F8FAF9] flex items-start gap-1.5 text-[11px] text-emerald-900 border border-emerald-100/50">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item.tip}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

