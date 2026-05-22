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
    const { problema, contexto, etapaInicialSelect, prevRouteJson, isLiderCase } = req.body;

    if (!problema || !problema.trim()) {
      res.status(400).json({ error: "La descripción del problema es requerida." });
      return;
    }

    const ai = getGeminiClient();

    let systemInstruction = `Eres un teólogo y consejero bíblico teocéntrico y cristocéntrico experto y compasivo, con décadas de experiencia en el pastoreo de almas y consejería bíblica para creyentes y líderes eclesiales.
Sigues de forma rigurosa la metodología de transformación de las "4R" para guiar a las personas desde su crisis o dolor hacia la madurez y el arrepentimiento sincero en Cristo:
  1. Redefinir: Redefinir la situación de forma vertical (bíblica), ayudando a ver que los problemas horizontales (circunstancias, personas) revelan realidades verticales de nuestra relación con Dios.
  2. Reenfocar: Dirigir el enfoque al corazón del aconsejado. Revelar las motivaciones interiores, ídolos del corazón (comodidad, control, aprobación, placer, éxito ministerial) y sus propias respuestas en lugar de obsesionarse con la conducta ajena o los frutos públicos.
  3. Rendir: Someter los ídolos, demandas, orgullo y pecados al señorío de Cristo mediante el arrepentimiento sincero, rindiendo las prioridades del ego ante Dios y abrazando la gracia justificadora y santificadora de la cruz.
  4. Reestructurar: Establecer nuevos hábitos de obediencia de fe, discipulado y amor práctico. Crear pautas concretas para vestir el nuevo hombre según Efesios 4:22-24.`;

    if (isLiderCase) {
      systemInstruction += `\n\nCRÍTICO: Este es un caso de CONSEJERÍA PARA LÍDERES MINISTERIALES / MINISTROS. Los líderes enfrentan presiones y tentaciones únicas, orgullo ministerial, aislamiento relacional y una identidad unida a su rol público antes que a Cristo.
Debes rellenar obligatoriamente todos los campos opcionales del liderazgo en el JSON:
- "diagnosticoLider": diagnóstico específico de cómo la obra, el rol o las expectativas de la iglesia agitan el corazón del líder.
- "pecadoMinisterial": pecado raíz público u oculto o patrón en el ministerio (aislamiento, doble vida, perfeccionismo, codicia de poder, burnout, etc.).
- "riesgoMinisterio": indicador booleano de si hay riesgo inminente de caída, escándalo público o necesidad urgente de un proceso formal de restauración ministerial.
- "patronesLider": array de 3 o 4 patrones del alma propios del liderazgo que se manifiestan aquí.
- "prevencion": un objeto completo con { "habitos": [], "comunidad": "", "limites": [] } enfocado en sostenibilidad espiritual del ministro.
- "pasajesLider": array de exactamente 3 pasajes sobre pastoreo, humildad e identidad ministerial aplicada (p. ej., 1 Pedro 5:1-4, 2 Corintios 12:9).`;
    }

    systemInstruction += `\n\nInstrucciones para generar la ruta:
- Sé sumamente específico. Evita generalidades vacías. Utiliza terminología pastoral y bíblica profunda.
- Devuelve EXACTAMENTE las 4 etapas del proceso, rellenando con precisión la información de las preguntas de corazón, las herramientas pastorales y las tareas aplicables para este caso específico.
- Cada etapa debe tener exactamente 4 preguntas profundas de introspección espiritual, exactamente 3 herramientas específicas en sesión y exactamente 3 pasajes bíblicos.
- Si se proporciona un "itinerario previo" (prevRouteJson), debes INTEGRAR Y ADAPTAR la nueva crisis o información emergente en el plan existente, perfeccionando las directrices sin borrar el progreso anterior, y adaptándolo de forma cohesiva.`;

    let userPrompt = `Caso de consejería:
Problema o dolor actual expresado por el aconsejado: "${problema}"
Áreas de vida seleccionadas o contexto: "${contexto || "General"}"
Sugerencia de etapa inicial: ${etapaInicialSelect === "auto" ? "Detectar de manera automática de acuerdo a la severidad de la situación" : `Etapa ${etapaInicialSelect}`}
Modo del caso: ${isLiderCase ? "LIDERAZGO MINISTERIAL (Aplicar un enfoque de salud del alma del ministro)" : "CONSEJERÍA GENERAL o PERSONAL"}
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
                description: "Exactamente 3 herramientas pastorales estructuradas para usar en sesión con el consejero.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nombre: { type: Type.STRING, description: "Nombre claro e identificativo de la herramienta o dinámica pastoral (máximo 5 palabras)." },
                    concepto: { type: Type.STRING, description: "Qué es la herramienta/dinámica: fundamento teológico, significado y por qué ayuda al aconsejado (2-3 oraciones claras)." },
                    instrucciones: { type: Type.STRING, description: "Cómo se realiza la herramienta paso a paso con el aconsejado para guiarle (guía práctica de 3 a 5 pasos claros numerados o en viñetas)." }
                  },
                  required: ["nombre", "concepto", "instrucciones"]
                }
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
        },
        // Leadership optional properties
        diagnosticoLider: {
          type: Type.STRING,
          description: "Análisis teológico específico de cómo el ministerio y el rol están afectando el corazón del líder (2-3 oraciones). Requerido si isLiderCase es true."
        },
        pecadoMinisterial: {
          type: Type.STRING,
          description: "El pecado o patrón raíz específico que emerge en el contexto del liderazgo (aislamiento, doble vida, orgullo ministerial, etc.). Requerido si isLiderCase es true."
        },
        riesgoMinisterio: {
          type: Type.BOOLEAN,
          description: "True si hay riesgo de caída pública o necesidad urgente de un proceso de restauración ministerial formal. Requerido si isLiderCase es true."
        },
        patronesLider: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "De 3 a 4 patrones de pensamiento o conducta propios de líderes que aparecen aquí. Requerido si isLiderCase es true."
        },
        prevencion: {
          type: Type.OBJECT,
          properties: {
            habitos: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array de exactamente 3 hábitos diarios o semanales de restauración y sostenibilidad para prevenir recaídas."
            },
            comunidad: {
              type: Type.STRING,
              description: "Directrices de rendición de cuentas e inserción en una comunidad de pastores o consejeros."
            },
            limites: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array de exactamente 3 límites saludables específicos en el ministerio."
            }
          },
          required: ["habitos", "comunidad", "limites"],
          description: "Plan de prevención de recaídas y sostenibilidad ministerial. Requerido si isLiderCase es true."
        },
        pasajesLider: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ref: { type: Type.STRING, description: "Cita bíblica sobre liderazgo o pastoreo (ej. '1 Pedro 5:1-4')." },
              razon: { type: Type.STRING, description: "Por qué este pasaje es vital para el sostenimiento e identidad del líder." }
            },
            required: ["ref", "razon"]
          },
          description: "Exactamente 3 pasajes bíblicos sobre el liderazgo, servicio y debilidad pastoral aplicados al caso. Requerido si isLiderCase es true."
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
