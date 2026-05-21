export interface ScripturePassage {
  ref: string;
  razon: string;
}

export interface CounselingStage {
  numero: number;
  nombre: string;
  enfoque: string;
  mentira: string;
  verdad: string;
  preguntas: string[];
  herramientas: string[];
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
}

export interface SessionNote {
  txt: string;
  etapa: number;
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
}

