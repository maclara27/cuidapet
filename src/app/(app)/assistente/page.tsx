"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content:
      "Olá, tutor! 🐾 Sou o **CuidaPet AI**, seu assistente especializado em cuidados, nutrição e vacinas para cães e gatos.\n\nComo posso ajudar você e seu pet hoje?",
    timestamp: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];

const QUICK_SUGGESTIONS = [
  "Meu cachorro comeu chocolate, o que fazer?",
  "Quantas vezes dar banho em gato?",
  "Quais vacinas são anuais para cães?",
  "Gato pode comer ração de cachorro?",
  "Como saber se meu pet está com dor?",
];

export default function AssistentePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok && !data.content) {
        throw new Error(data.details || data.error || "Erro de conexão com o assistente.");
      }

      const assistantMessage: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.content || "Desculpe, ocorreu um erro na resposta.",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMessage: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Desculpe, ocorreu uma instabilidade: ${error.message || "Tente novamente mais tarde."}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5rem)] max-w-md mx-auto w-full">
      {/* Header do Chat */}
      <header className="p-3.5 px-4 bg-white border-b border-emerald-100 flex items-center justify-between shadow-xs sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-emerald-950">CuidaPet AI</h2>
              <span className="text-[10px] bg-emerald-50 text-primary font-bold px-1.5 py-0.2 rounded-md border border-emerald-200">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              Assistente de Saúde Animal
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2 rounded-xl text-gray-400 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
          title="Reiniciar conversa"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Alerta de Saúde Importante */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-tight">
          Em caso de emergência ou sintomas graves, procure um veterinário imediatamente.
        </span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-primary flex items-center justify-center shrink-0 mb-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs shadow-xs leading-relaxed ${
                  isUser
                    ? "bg-primary text-white rounded-br-xs"
                    : "bg-white text-gray-800 border border-emerald-100/90 rounded-bl-xs shadow-soft"
                }`}
              >
                {/* Renderização simples com quebras de linha e negrito */}
                <div className="whitespace-pre-wrap">
                  {message.content.split("\n").map((line, idx) => {
                    // Trata negrito markdown simples **texto**
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <span key={idx} className="block min-h-[1.1rem]">
                        {parts.map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong
                                key={pIdx}
                                className={isUser ? "text-white font-bold" : "text-emerald-950 font-bold"}
                              >
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        })}
                      </span>
                    );
                  })}
                </div>

                <div
                  className={`text-[9px] mt-1.5 text-right font-medium ${
                    isUser ? "text-emerald-200" : "text-gray-400"
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mb-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-center gap-2 justify-start">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl rounded-bl-xs p-3 shadow-soft flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span>CuidaPet AI está pensando...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões Rápidas (Chips) */}
      <div className="px-3 py-2 bg-[#F8FAF9] border-t border-emerald-100/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              disabled={loading}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-medium px-2.5 py-1.5 rounded-full transition-colors shrink-0 shadow-xs disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input de Envio de Mensagem */}
      <div className="p-3 bg-white border-t border-emerald-100 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Pergunte sobre saúde, vacinas ou nutrição..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#F8FAF9] border-emerald-200/80 h-11 text-xs focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="h-11 w-11 p-0 rounded-xl bg-primary text-white hover:bg-emerald-700 shrink-0 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

