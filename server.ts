import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please check the Secrets panel in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Generar o actualizar ruta de consejería
app.post("/api/generar-ruta", async (req, res) => {
  try {
    const { problema, contexto, etapaInicialSelect, prevRouteJson } = req.body;

    if (!problema || !problema.trim()) {
      res.status(400).json({ error: "La descripción del problema es requerida." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `Eres un teólogo y consejero bíblico cristocéntrico experto y compasivo, con décadas de experiencia en el pastoreo de almas y consejería bíblica (psicología bíblica).
Sigues de forma rigurosa la metodología de transformación de las "4R" para guiar a las personas desde su crisis o dolor hacia la madurez y arrepentimiento en Cristo:
  1. Redefinir: Redefinir la situación de forma vertical (bíblica), ayudando a ver que los problemas horizontales (circunstancias, personas) revelan realidades verticales de nuestra relación con Dios.
  2. Reenfocar: Dirigir el enfoque al corazón del aconsejado. Revelar las motivaciones interiores, ídolos del corazón (comodidad, control, aprobación, placer) y sus propias respuestas en lugar de obsesionarse con la conducta ajena.
  3. Rendir: Someter los ídolos, demandas y pecados al señorío de Cristo mediante el arrepentimiento sincero, rindiendo de rodillas las prioridades del ego y abrazando la gracia justificadora y santificadora de la cruz.
  4. Reestructurar: Establecer nuevos hábitos de obediencia, fe encarnada y amor práctico. Crear pautas concretas para vestir el nuevo hombre según Efesios 4:22-24.

Instrucciones para generar la ruta:
- Sé sumamente específico. Evita generalidades vacías. Utiliza terminología pastoral y bíblica profunda.
- Devuelve EXACTAMENTE las 4 etapas del proceso, rellenando con precisión la información de las preguntas de corazón, las herramientas pastorales y las tareas aplicables para este caso específico.
- Cada etapa debe tener exactamente 4 preguntas profundas de introspección espiritual, exactamente 3 herramientas específicas en sesión y exactamente 3 pasajes bíblicos.
- Si se proporciona un "itinerario previo" (prevRouteJson), debes INTEGRAR Y ADAPTAR la nueva crisis o información emergente en el plan existente, perfeccionando las directrices sin borrar el progreso anterior, y adaptándolo de forma cohesiva.`;

    let userPrompt = `Caso de consejería:
Problema o dolor actual expresado por el aconsejado: "${problema}"
Áreas de vida seleccionadas o contexto: "${contexto || "General"}"
Sugerencia de etapa inicial: ${etapaInicialSelect === "auto" ? "Detectar de manera automática de acuerdo a la severidad de la situación" : `Etapa ${etapaInicialSelect}`}
`;

    if (prevRouteJson) {
      userPrompt += `\nExiste una versión previa de la ruta de consejería en curso, que es:\n${JSON.stringify(prevRouteJson)}\nPor favor, actualiza y ajusta esta ruta de forma cohesiva integrando la nueva información o evento de crisis sin descuidar el plan general.`;
    }

    userPrompt += `\nGenera un plan de consejería detallado que responda rigurosamente al esquema solicitado.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        titulo: {
          type: Type.STRING,
          description: "Un título corto y altamente pastoral que defina el caso (máximo 6 palabras)."
        },
        etapaInicial: {
          type: Type.INTEGER,
          description: "La etapa en la cual el consejero debería comenzar a trabajar de forma urgente (entre 1 y 4)."
        },
        diagnostico: {
          type: Type.STRING,
          description: "Análisis teológico continuo y profundo del corazón del aconsejado (2-3 oraciones). Identifica si hay idolatría de control, comodidad, aprobación, temor al hombre, etc."
        },
        etapas: {
          type: Type.ARRAY,
          description: "La ruta detallada con exactamente cuatro elementos correspondientes a las etapas 1 (Redefinir), 2 (Reenfocar), 3 (Rendir) y 4 (Reestructurar) por orden.",
          items: {
            type: Type.OBJECT,
            properties: {
              numero: { type: Type.INTEGER, description: "Número de la etapa (1 a 4)." },
              nombre: { type: Type.STRING, description: "Nombre de la etapa (Redefinir, Reenfocar, Rendir, Reestructurar)." },
              enfoque: { type: Type.STRING, description: "El enfoque central específico de esta fase del aconsejado (1 oración)." },
              mentira: { type: Type.STRING, description: "La mentira espiritual sutil o creencia distorsionada que rige el corazón en esta fase de crisis." },
              verdad: { type: Type.STRING, description: "La verdad y promesa del Evangelio que desmantela esa mentira con poder." },
              preguntas: {
                type: Type.ARRAY,
                description: "Exactamente 4 preguntas de instrospección profunda.",
                items: { type: Type.STRING }
              },
              herramientas: {
                type: Type.ARRAY,
                description: "Exactamente 3 herramientas para usar en sesión con el consejero.",
                items: { type: Type.STRING }
              },
              tarea: { type: Type.STRING, description: "La tarea espiritual o relacional concreta y realizable en casa." },
              pasajes: {
                type: Type.ARRAY,
                description: "Exactamente 3 pasajes bíblicos.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ref: { type: Type.STRING, description: "Cita del pasaje, p. ej. 'Santiago 4:1-3'" },
                    razon: { type: Type.STRING, description: "Explicación breve de la relevancia para superar la mentira específica." }
                  },
                  required: ["ref", "razon"]
                }
              }
            },
            required: ["numero", "nombre", "enfoque", "mentira", "verdad", "preguntas", "herramientas", "tarea", "pasajes"]
          }
        },
        senalesAlerta: {
          type: Type.ARRAY,
          description: "Tres o cuatro señales físicas, conductuales o relacionales de peligro inminente o estancamiento del aconsejado.",
          items: { type: Type.STRING }
        },
        derivar: {
          type: Type.BOOLEAN,
          description: "True si hay indicadores graves que sugieran la necesidad de derivar a atención de salud mental urgente o reportes pertinentes ante situaciones delictivas/de violencia extrema."
        }
      },
      required: ["titulo", "etapaInicial", "diagnostico", "etapas", "senalesAlerta", "derivar"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No se pudo obtener una respuesta válida del modelo de IA.");
    }

    const data = JSON.parse(textOutput);
    res.json(data);
  } catch (error: any) {
    console.error("Error en /api/generar-ruta:", error);
    res.status(500).json({ error: error.message || "Error interno del servidor al procesar la ruta." });
  }
});

async function start() {
  // Vite dev mode integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Servir archivos estáticos en producción
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
  });
}

start();
