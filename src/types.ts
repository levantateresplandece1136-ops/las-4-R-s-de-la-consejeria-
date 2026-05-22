export interface ScripturePassage {
  ref: string;
  razon: string;
}

export interface HerramientaDetalle {
  nombre: string;
  concepto: string;
  instrucciones: string;
}

export interface CounselingStage {
  numero: number;
  nombre: string;
  enfoque: string;
  mentira: string;
  verdad: string;
  preguntas: string[];
  herramientas: (string | HerramientaDetalle)[];
  tarea: string;
  pasajes: ScripturePassage[];
}

export interface CounselingRoute {
  titulo: string;
  etapaInicial: number;
  diagnostico: string;
  etapas: CounselingStage[];
  senalesAlerta: string[];
  derivar: boolean;
  // Leadership fields
  diagnosticoLider?: string;
  pecadoMinisterial?: string;
  riesgoMinisterio?: boolean;
  patronesLider?: string[];
  prevencion?: {
    habitos: string[];
    comunidad: string;
    limites: string[];
  };
  pasajesLider?: { ref: string; razon: string }[];
}

export interface SessionNote {
  txt: string;
  etapa: number; // or can represent Tab id for leaders
  hora: string;
}

export interface SavedCase {
  id: string;
  title: string;
  date: string;
  problema: string;
  selectedAreas: string[];
  etapaInicialSelect: string;
  activeStage: number;
  route: CounselingRoute;
  notas: SessionNote[];
  isLiderCase?: boolean;
}

