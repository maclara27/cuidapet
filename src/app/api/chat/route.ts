import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Você é o CuidaPet AI, o assistente virtual inteligente e carinhoso do aplicativo CuidaPet, especializado em saúde preventiva, nutrição, vacinação, rotina e bem-estar de cães e gatos.

Seu objetivo:
1. Ser empático, acolhedor, gentil e objetivo com os tutores.
2. Fornecer orientações práticas e confiáveis sobre alimentação segura, cuidados com higiene, vacinas essenciais e primeiros socorros preventivos.
3. REGRA ABSOLUTA DE SEGURANÇA: Você é uma IA de orientação e NÃO substitui uma consulta clínica veterinária. Se o tutor relatar que o animal comeu algo altamente tóxico (ex: chocolate, uva, cebola, veneno, remédio humano, planta tóxica), está apático, vomitante com sangue, tendo convulsões ou com falta de ar, instrua-o COM URGÊNCIA MÁXIMA a buscar um pronto-socorro veterinário ou clínica 24 horas imediatamente.
4. Responda em português brasileiro fluente, usando formatação limpa (listas com marcadores quando apropriado para facilitar a leitura no celular), linguagem acolhedora e positiva.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, petContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma mensagem fornecida." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Se o usuário ainda não colocou a chave no .env.local, fornecemos uma resposta inteligente de fallback
    if (!apiKey) {
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      
      let fallbackReply = "Olá! Sou o Assistente CuidaPet. Para respostas em tempo real personalizadas pelo Gemini 3.8 Flash, adicione sua chave `GEMINI_API_KEY` no arquivo `.env.local`.\n\n";

      if (lastUserMsg.includes("chocolate") || lastUserMsg.includes("veneno") || lastUserMsg.includes("remédio") || lastUserMsg.includes("uva")) {
        fallbackReply += "⚠️ **ALERTA DE EMERGÊNCIA:** Se o seu pet ingeriu chocolate, uvas, alho/cebola ou medicamentos humanos, leve-o **imediatamente a um pronto-socorro veterinário 24 horas**! A teobromina do chocolate e outras toxinas causam convulsões e falência de órgãos. Não induza vômito sem orientação profissional expressa.";
      } else if (lastUserMsg.includes("banho") || lastUserMsg.includes("gato")) {
        fallbackReply += "🐾 **Dica rápida:** Gatos realizam a própria auto-higienização diária com a língua. Banhos com água só são necessários em casos específicos de sujeira extrema ou recomendação veterinária (com xampu dermatológico específico).";
      } else if (lastUserMsg.includes("vacina")) {
        fallbackReply += "💉 **Vacinas Essenciais:** Para cães: V8/V10 (múltipla anual) e Antirrábica. Para gatos: V4/V5 e Antirrábica. Consulte sempre o médico veterinário de confiança para o protocolo individual do seu pet!";
      } else {
        fallbackReply += "Como posso ajudar no cuidado e bem-estar do seu cãozinho ou gatinho hoje? Lembre-se de sempre consultar um médico veterinário para diagnósticos clínicos.";
      }

      return NextResponse.json({
        content: fallbackReply,
        isFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Monta o histórico de mensagens no formato exigido pelo Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Se houver contexto de pet ativo, anexa à instrução do sistema
    let fullSystemInstruction = SYSTEM_INSTRUCTION;
    if (petContext) {
      fullSystemInstruction += `\n\nContexto do Pet atual do tutor: Nome: ${petContext.name}, Espécie: ${petContext.species}, Raça: ${petContext.breed || "Não informada"}, Idade aproximada: ${petContext.age || "Não informada"}. Use essas informações para personalizar seu tratamento quando fizer sentido.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Desculpe, não consegui formular uma resposta no momento. Poderia repetir a pergunta?";

    return NextResponse.json({
      content: replyText,
      isFallback: false,
    });
  } catch (error: unknown) {
    console.error("Erro na API do Gemini:", error);
    const err = error as { message?: string };
    return NextResponse.json(
      {
        error: "Erro ao processar mensagem com a IA.",
        details: err.message || "Falha desconhecida",
      },
      { status: 500 }
    );
  }
}

