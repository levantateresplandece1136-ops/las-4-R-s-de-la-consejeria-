import React, { useState, useEffect } from "react";
import { 
  ScripturePassage, 
  CounselingStage, 
  CounselingRoute, 
  SessionNote,
  SavedCase
} from "./types";
import { CASE_EXAMPLES, CaseExample } from "./components/CaseExamples";
import { 
  Heart, 
  Sparkles, 
  Plus, 
  Trash2, 
  ClipboardList, 
  BookOpen, 
  HeartHandshake, 
  TriangleAlert, 
  AlertOctagon, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Wrench, 
  BookMarked, 
  Activity, 
  FileText, 
  RefreshCw,
  Home,
  Save,
  FolderOpen,
  Download,
  Upload,
  Share2,
  Copy,
  Check,
  ShieldCheck
} from "lucide-react";

const LIFE_AREAS = [
  "Matrimonio", 
  "Crianza", 
  "Adicción", 
  "Trauma", 
  "Duelo", 
  "Identidad", 
  "Laboral", 
  "Ansiedad", 
  "Depresión", 
  "Ira", 
  "Sexualidad", 
  "Pornografía", 
  "Crisis aguda", 
  "Conflicto iglesia", 
  "Temor"
];

const MINISTERIOS = [
  "Pastor principal", 
  "Pastor asociado", 
  "Líder de ministerio", 
  "Misionero", 
  "Diácono/anciano", 
  "Líder de jóvenes", 
  "Líder de alabanza", 
  "Consejero bíblico"
];

const TENSIONES = [
  "Burnout ministerial", 
  "Doble vida / pecado oculto", 
  "Orgullo espiritual", 
  "Conflicto con la iglesia", 
  "Matrimonio deteriorado", 
  "Pérdida de gozo ministerial", 
  "Tentaciones de poder", 
  "Crisis de fe", 
  "Adicción", 
  "Pornografía", 
  "Aislamiento", 
  "Identidad basada en rol"
];

const LIDER_CASE_EXAMPLES = [
  {
    title: "Burnout del Pastor Principal",
    problema: "Pastor principal de una iglesia de 600 miembros, con 12 años de servicio continuo. Informa cansancio extremo y agotamiento interior severo, deseos frecuentes de abandonar el ministerio, irritabilidad creciente con los diáconos, sequedad en su tiempo de oración personal y apatía en la predicación dominical.",
    areas: ["Pastor principal", "Burnout ministerial", "Aislamiento"]
  },
  {
    title: "Doble Vida Ministerial y Desconexión",
    problema: "Líder de alabanza y pastor asociado de jóvenes. En público es un ministro ejemplar y carismático, pero reporta tensiones graves y distanciamiento gélido en su matrimonio, arrebatos de ira violentos en privado, luchas sordas y recurrentes con la pornografía y el temor de ser expuesto públicamente ante la congregación.",
    areas: ["Líder de alabanza", "Doble vida / pecado oculto", "Pornografía", "Matrimonio deteriorado"]
  }
];

export default function App() {
  const [mode, setMode] = useState<"gen" | "lid">("gen");
  const [problema, setProblema] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [etapaInicialSelect, setEtapaInicialSelect] = useState<string>("1");

  // Leadership specific states
  const [problemaLider, setProblemaLider] = useState<string>("");
  const [selectedMinisterios, setSelectedMinisterios] = useState<string[]>([]);
  const [selectedTensiones, setSelectedTensiones] = useState<string[]>([]);
  const [liderTab, setLiderTab] = useState<string>("base");
  
  // Guided input option states
  const [inputMode, setInputMode] = useState<"words" | "questions">("words");
  const [q1, setQ1] = useState<string>("");
  const [q2, setQ2] = useState<string>("");
  const [q3, setQ3] = useState<string>("");
  const [q4, setQ4] = useState<string>("");

  // Compile individual diagnostic questions automatically into 'problema' when in questions mode
  useEffect(() => {
    if (inputMode === "questions") {
      let compiled = "";
      if (q1.trim()) compiled += `[CIRCUNSTANCIA EXTERNA Y DETONANTE]:\n${q1.trim()}\n\n`;
      if (q2.trim()) compiled += `[REACCIÓN CONDUCTUAL Y EMOCIONAL]:\n${q2.trim()}\n\n`;
      if (q3.trim()) compiled += `[DESEOS RAÍCES / ÍDOLOS DEL CORAZÓN]:\n${q3.trim()}\n\n`;
      if (q4.trim()) compiled += `[PERSPECTIVA DE CONFIANZA Y FE EN DIOS]:\n${q4.trim()}\n\n`;
      setProblema(compiled.trim());
    }
  }, [q1, q2, q3, q4, inputMode]);
  
  // Route state
  const [route, setRoute] = useState<CounselingRoute | null>(null);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // New crisis update
  const [crisisInput, setCrisisInput] = useState<string>("");

  // Notes state
  const [notaInput, setNotaInput] = useState<string>("");
  const [notas, setNotas] = useState<SessionNote[]>([]);

  // Persistent Saved Cases States
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  // Load saved cases from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("sistema4r_casos");
    if (cached) {
      try {
        setSavedCases(JSON.parse(cached));
      } catch (e) {
        console.error("Error al leer los casos guardados:", e);
      }
    }
  }, []);

  // Sync cache helper
  const persistCasesList = (list: SavedCase[]) => {
    setSavedCases(list);
    localStorage.setItem("sistema4r_casos", JSON.stringify(list));
  };

  // Sync activeStage to disk when it changes
  useEffect(() => {
    if (currentCaseId && route) {
      const exists = savedCases.find(c => c.id === currentCaseId);
      if (exists && exists.activeStage !== activeStage) {
        const newList = savedCases.map(c => {
          if (c.id === currentCaseId) {
            return { ...c, activeStage };
          }
          return c;
        });
        persistCasesList(newList);
      }
    }
  }, [activeStage, currentCaseId, route]);

  // Share Modal & URL Copy states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Selected tool detail modal state
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [isToolModalOpen, setIsToolModalOpen] = useState<boolean>(false);

  const getToolDetails = (h: any, idx: number) => {
    if (typeof h === 'object' && h !== null && h.nombre) {
      return {
        nombre: h.nombre,
        concepto: h.concepto || "Dinámica pastoral para examinar el corazón a la luz del Evangelio.",
        instrucciones: h.instrucciones || "1. Lee detenidamente el pasaje bíblico asociado.\n2. Dedica tiempo a la reflexión o diálogo con el consejero.\n3. Define un paso de obediencia de fe concreto para la semana."
      };
    }
    
    // Fallback parser if it is a simple string (historical data)
    const str = String(h || "");
    const colonIndex = str.indexOf(':');
    if (colonIndex > 0) {
      const nombre = str.substring(0, colonIndex).trim();
      const resto = str.substring(colonIndex + 1).trim();
      return {
        nombre,
        concepto: resto,
        instrucciones: `1. Reúnanse en sesión de consejería o en un espacio personal libre de distracciones.\n2. Mediten sobre la verdad y mentira correspondiente descrita en esta etapa.\n3. Implementen un plan diario de rendición de cuentas para perseverar en este paso práctico.`
      };
    }
    
    return {
      nombre: str || `Dinámica ${idx + 1}`,
      concepto: `Ejercicio de consejería bíblica enfocado en la restauración y el arrepentimiento cotidiano.`,
      instrucciones: `1. Lean juntos la verdad del Evangelio de esta etapa.\n2. Sigan la guía del consejero respondiendo honestamente ante Dios.\n3. Registren el progreso de fe y perseveren en la tarea espiritual semanal.`
    };
  };

  // Listen for shared cases in URL on mount
  useEffect(() => {
    const getSharePayload = () => {
      // 1. Try search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const queryShare = urlParams.get("share");
      if (queryShare) return queryShare;

      // 2. Try hash parameters as backup
      const hash = window.location.hash;
      if (hash && hash.includes("share=")) {
        const parts = hash.split("share=");
        if (parts.length > 1) {
          return parts[1];
        }
      }
      return null;
    };

    const shareData = getSharePayload();
    if (shareData) {
      try {
        // Safe decode b64 with unicode support
        const decodedStr = decodeURIComponent(
          atob(shareData)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const parsed = JSON.parse(decodedStr);
        
        if (parsed && parsed.route) {
          // Load shared state
          setProblema(parsed.problema || "");
          setSelectedAreas(parsed.selectedAreas || []);
          setRoute(parsed.route);
          setActiveStage(parsed.activeStage || 1);
          setNotas(parsed.notas || []);
          setCurrentCaseId(parsed.id || `imported_${Date.now()}`);
          
          alert(`¡Expediente de Consejería "${parsed.title || parsed.route.titulo}" cargado con éxito!`);
          
          // Clear URL to clean browser bar without page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("No se pudo decodificar el caso compartido:", err);
      }
    }
  }, []);

  // Toggle life area chip
  const handleToggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(item => item !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  // Select quick example
  const handleSelectExample = (ex: CaseExample) => {
    setProblema(ex.problema);
    setSelectedAreas(ex.context);
    setEtapaInicialSelect("1");
    setInputMode("words");
  };

  // Select quick leadership example
  const handleSelectLiderExample = (ex: { title: string; problema: string; areas: string[] }) => {
    setProblemaLider(ex.problema);
    setSelectedMinisterios(ex.areas.filter(x => MINISTERIOS.includes(x)));
    setSelectedTensiones(ex.areas.filter(x => TENSIONES.includes(x)));
    setEtapaInicialSelect("1");
    setInputMode("words");
  };

  // Reset case
  const handleNewCase = () => {
    if (confirm("¿Estás seguro de que deseas iniciar un nuevo caso? Se limpiará el progreso actual.")) {
      setProblema("");
      setSelectedAreas([]);
      setProblemaLider("");
      setSelectedMinisterios([]);
      setSelectedTensiones([]);
      setLiderTab("base");
      setEtapaInicialSelect("1");
      setRoute(null);
      setActiveStage(1);
      setError(null);
      setCrisisInput("");
      setNotaInput("");
      setNotas([]);
      setCurrentCaseId(null);
      setInputMode("words");
      setQ1("");
      setQ2("");
      setQ3("");
      setQ4("");
    }
  };

  // Explicit Save Case changes (Manual trigger or rename)
  const handleSaveCurrentCase = (customTitle?: string) => {
    if (!route) return;
    const targetTitle = customTitle || route.titulo || "Caso de Consejería";
    const targetId = currentCaseId || `caso_${Date.now()}`;

    const newSavedCase: SavedCase = {
      id: targetId,
      title: targetTitle,
      date: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      problema: mode === "lid" ? problemaLider : problema,
      selectedAreas: mode === "lid" ? [...selectedMinisterios, ...selectedTensiones] : selectedAreas,
      etapaInicialSelect,
      activeStage,
      route,
      notas,
      isLiderCase: mode === "lid"
    };

    let newList: SavedCase[];
    const exists = savedCases.some(c => c.id === targetId);
    if (exists) {
      newList = savedCases.map(c => c.id === targetId ? newSavedCase : c);
    } else {
      newList = [newSavedCase, ...savedCases];
    }

    persistCasesList(newList);
    setCurrentCaseId(targetId);
    alert(`¡El caso "${targetTitle}" se ha guardado de forma segura!`);
  };

  // Load a Saved case
  const handleLoadCase = (item: SavedCase) => {
    if (item.isLiderCase) {
      setMode("lid");
      setProblemaLider(item.problema);
      setSelectedMinisterios(item.selectedAreas?.filter(x => MINISTERIOS.includes(x)) || []);
      setSelectedTensiones(item.selectedAreas?.filter(x => TENSIONES.includes(x)) || []);
      setLiderTab("base");
    } else {
      setMode("gen");
      setProblema(item.problema);
      setSelectedAreas(item.selectedAreas || []);
    }
    setEtapaInicialSelect(item.etapaInicialSelect || "auto");
    setRoute(item.route);
    setActiveStage(item.activeStage || 1);
    setNotas(item.notas || []);
    setCurrentCaseId(item.id);
    setInputMode("words");
  };

  // Export all session notes to a .txt file
  const handleExportNotesAsTxt = () => {
    if (notas.length === 0) return;
    
    const isLid = mode === "lid" || (route && route.diagnosticoLider !== undefined);
    const stageNames = isLid 
      ? ["Diagnóstico", "Redefinir (01)", "Reenfocar (02)", "Rendir (03)", "Reestructurar (04)", "Prevención"]
      : ["", "Redefinir", "Reenfocar", "Rendir", "Reestructurar"];

    let content = `==================================================\n`;
    content += `SISTEMA 4R - REPORTE DE ANOTACIONES DE CONSEJERÍA\n`;
    content += isLid ? `  [MÓDULO DE LIDERAZGO Y SALUD DE MINISTROS]\n` : "";
    content += `==================================================\n\n`;
    if (route) {
      content += `Caso: ${route.titulo}\n`;
      content += `Diagnóstico Teológico: ${route.diagnostico}\n`;
      if (route.diagnosticoLider) {
        content += `Diagnóstico Ministerial del Líder: ${route.diagnosticoLider}\n`;
      }
      if (route.pecadoMinisterial) {
        content += `Patrón de Pecado Ministerial: ${route.pecadoMinisterial}\n`;
      }
      content += `\n`;
    }
    content += `Problema / Crisis Inicial / Situación:\n"${isLid ? problemaLider : problema}"\n\n`;
    content += isLid 
      ? `Ministerio & Tensiones: ${[...selectedMinisterios, ...selectedTensiones].join(", ") || "General"}\n`
      : `Áreas de Vida: ${selectedAreas.join(", ") || "General"}\n`;
    content += `Fecha de Consulta: ${new Date().toLocaleDateString("es-ES")}\n\n`;
    content += `--------------------------------------------------\n`;
    content += `HISTORIAL DE NOTAS DEL CONSEJERO (${notas.length}):\n`;
    content += `--------------------------------------------------\n\n`;
    
    notas.forEach((n, idx) => {
      content += `Nota #${notas.length - idx}\n`;
      content += `Hora: ${n.hora}\n`;
      content += `Fase: ${stageNames[n.etapa] || "Desconocida"}\n`;
      content += `Anotación: ${n.txt}\n`;
      content += `--------------------------------------------------\n\n`;
    });
    
    content += `Reporte generado mediante el Sistema 4R. "Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmo 119:105\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const safeTitle = (route?.titulo || "Caso").trim().replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    link.download = `Notas_Consejería_${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate the encoded shareable URL link
  const getShareableUrl = () => {
    if (!route) return "";
    const payload = {
      id: currentCaseId || `caso_${Date.now()}`,
      title: route.titulo,
      problema: problema,
      selectedAreas: selectedAreas,
      activeStage: activeStage,
      route: route,
      notas: notas
    };
    try {
      const jsonStr = JSON.stringify(payload);
      const bytes = new TextEncoder().encode(jsonStr);
      let binString = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binString += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binString);
      return `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(b64)}`;
    } catch (e) {
      console.error(e);
      return `${window.location.origin}${window.location.pathname}`;
    }
  };

  // Generate plain-text layout summary of the route
  const getTemplateSummary = () => {
    if (!route) return "";
    const currentEtapaName = route.etapas[activeStage - 1]?.nombre || "";
    const currentEtapaEnfoque = route.etapas[activeStage - 1]?.enfoque || "";
    
    return `📋 REPORTE DE CONSEJERÍA BÍBLICA (SISTEMA 4R)\n` +
      `--------------------------------------------------\n` +
      `✝️ Expediente: ${route.titulo}\n` +
      `🩺 Enfoque Actual: Etapa 0${activeStage} - ${currentEtapaName}\n` +
      `🎯 Plan de Trabajo: "${currentEtapaEnfoque}"\n` +
      `💡 Diagnóstico Teológico: "${route.diagnostico}"\n` +
      `--------------------------------------------------\n` +
      `Reportado en: ${window.location.host || "Sistema 4R"}\n` +
      `Estudiado bajo la luz de las Escrituras.`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    try {
      navigator.clipboard.writeText(url).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }).catch(err => {
        // Fallback for some iframe sandbox constraints
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand("copy");
        } catch (e) {
          console.error("Fallback execCommand failed:", e);
        }
        document.body.removeChild(input);
        
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    } catch (err) {
      console.error("No se pudo copiar el enlace:", err);
    }
  };

  // Delete a Saved Case
  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar permanentemente este expediente? Esta acción es irreversible.")) {
      const newList = savedCases.filter(c => c.id !== id);
      persistCasesList(newList);
      if (currentCaseId === id) {
        setCurrentCaseId(null);
        setProblema("");
        setSelectedAreas([]);
        setEtapaInicialSelect("auto");
        setRoute(null);
        setActiveStage(1);
        setNotas([]);
      }
    }
  };

  // Export a case as JSON File Backup
  const handleExportCase = (item: SavedCase, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const exportData = {
      ...item,
      appIdentifier: "sistema4r_counseling_case"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    
    const safeTitle = item.title.trim().replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    downloadAnchor.setAttribute("download", `Expediente_4R_${safeTitle || "Restauracion"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import a case from a JSON Backup File
  const handleImportCase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        if (parsed && typeof parsed === "object" && parsed.route && parsed.problema !== undefined) {
          const freshId = `imported_${Date.now()}`;
          const imported: SavedCase = {
            id: freshId,
            title: parsed.title || parsed.route.titulo || "Expediente Importado",
            date: parsed.date || new Date().toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            }),
            problema: parsed.problema,
            selectedAreas: parsed.selectedAreas || [],
            etapaInicialSelect: parsed.etapaInicialSelect || "auto",
            activeStage: parsed.activeStage || 1,
            route: parsed.route,
            notas: parsed.notas || []
          };

          const newList = [imported, ...savedCases.filter(c => c.title !== imported.title)];
          persistCasesList(newList);
          handleLoadCase(imported);
          alert(`¡Expediente "${imported.title}" importado y cargado correctamente!`);
        } else {
          alert("El archivo seleccionado no tiene el formato de respaldo de un caso válido de Sistema 4R.");
        }
      } catch (err: any) {
        alert("Error al parsear el archivo JSON: " + err.message);
      }
    };
    
    fileReader.readAsText(files[0]);
    e.target.value = ""; // clear
  };

  // Generate or Update Route API Call
  const handleGenerateRoute = async (isUpdate: boolean = false) => {
    const isLid = mode === "lid";
    const textToProcess = isUpdate ? crisisInput : (isLid ? problemaLider : problema);
    
    if (!isUpdate && !textToProcess.trim()) {
      alert(isLid ? "Por favor, describe la situación o crisis del líder en detalle." : "Por favor, describe la situación o problema del aconsejado.");
      return;
    }
    if (isUpdate && !crisisInput.trim()) {
      alert("Por favor, ingresa los detalles del nuevo evento de crisis o información.");
      return;
    }

    setIsLoading(true);
    setLoadingText(isUpdate ? "Integrando la nueva información y actualizando la ruta anterior..." : "Profundizando en el caso y estructurando el proceso 4R...");
    setError(null);

    const activeProblemaBase = isLid ? problemaLider : problema;
    const activeContexto = isLid ? [...selectedMinisterios, ...selectedTensiones] : selectedAreas;

    try {
      const response = await fetch("/api/generar-ruta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problema: isUpdate ? `${activeProblemaBase} [Actualización/Crisis: ${crisisInput}]` : activeProblemaBase,
          contexto: activeContexto.join(", "),
          etapaInicialSelect,
          prevRouteJson: isUpdate ? route : null,
          isLiderCase: isLid
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Ocurrió un error al contactar al servidor.");
      }

      const data: CounselingRoute = await response.json();
      setRoute(data);

      if (isLid) {
        setLiderTab("base");
      }

      if (isUpdate) {
        setCrisisInput("");
        
        // Auto-save update to current loaded case
        if (currentCaseId) {
          const newList = savedCases.map(c => {
            if (c.id === currentCaseId) {
              return { 
                ...c, 
                problema: `${activeProblemaBase} [Actualización/Crisis: ${crisisInput}]`,
                route: data 
              };
            }
            return c;
          });
          persistCasesList(newList);
        }
      } else {
        const initialEtapa = 1;
        setActiveStage(initialEtapa);
        setNotas([]);

        // Auto-save new case immediately
        const newId = `caso_${Date.now()}`;
        setCurrentCaseId(newId);

        const newSavedCase: SavedCase = {
          id: newId,
          title: data.titulo || "Caso de Consejería",
          date: new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          problema: activeProblemaBase,
          selectedAreas: activeContexto,
          etapaInicialSelect: "1",
          activeStage: initialEtapa,
          route: data,
          notas: [],
          isLiderCase: isLid
        };
        const newList = [newSavedCase, ...savedCases];
        persistCasesList(newList);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo generar la ruta de consejería. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a Session Note with autosave
  const handleAddNote = () => {
    if (!notaInput.trim()) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

    let noteEtapa = activeStage;
    if (mode === "lid") {
      if (liderTab === "base") noteEtapa = 0;
      else if (liderTab === "r1") noteEtapa = 1;
      else if (liderTab === "r2") noteEtapa = 2;
      else if (liderTab === "r3") noteEtapa = 3;
      else if (liderTab === "r4") noteEtapa = 4;
      else if (liderTab === "prev") noteEtapa = 5;
    }

    const newNote: SessionNote = {
      txt: notaInput.trim(),
      etapa: noteEtapa,
      hora: timeStr
    };

    const updatedNotes = [newNote, ...notas];
    setNotas(updatedNotes);
    setNotaInput("");

    // Auto-save back into active case files cache
    if (currentCaseId) {
      const newList = savedCases.map(c => {
        if (c.id === currentCaseId) {
          return { ...c, notas: updatedNotes };
        }
        return c;
      });
      persistCasesList(newList);
    }
  };

  // Delete a Session Note with autosave
  const handleDeleteNote = (index: number) => {
    const updatedNotes = notas.filter((_, idx) => idx !== index);
    setNotas(updatedNotes);

    if (currentCaseId) {
      const newList = savedCases.map(c => {
        if (c.id === currentCaseId) {
          return { ...c, notas: updatedNotes };
        }
        return c;
      });
      persistCasesList(newList);
    }
  };

  const getStageClassMap = (stageNum: number, currentActive: number) => {
    const isAct = stageNum === currentActive;
    const isDone = stageNum < currentActive;

    const base = "flex-1 py-3 px-2 text-center text-xs font-semibold cursor-pointer border-b-3 transition-all flex flex-col items-center gap-1 uppercase tracking-wider ";
    
    if (isAct) {
      if (stageNum === 1) return base + "text-s1 border-s1 bg-s1-light";
      if (stageNum === 2) return base + "text-s2 border-s2 bg-s2-light";
      if (stageNum === 3) return base + "text-s3 border-s3 bg-s3-light";
      if (stageNum === 4) return base + "text-s4 border-s4 bg-s4-light";
    }

    if (isDone) {
      return base + "text-ink-muted border-sand-border bg-sand-dark opacity-80 hover:opacity-100";
    }

    return base + "text-ink-muted border-transparent hover:bg-white/40";
  };

  const getStageColorToken = (stageNum: number) => {
    if (stageNum === 1) return "s1";
    if (stageNum === 2) return "s2";
    if (stageNum === 3) return "s3";
    return "s4";
  };

  // Keep navigation boundaries functional
  const handleNavigateStage = (direction: "prev" | "next") => {
    if (direction === "prev" && activeStage > 1) {
      setActiveStage(activeStage - 1);
    } else if (direction === "next" && activeStage < 4) {
      setActiveStage(activeStage + 1);
    }
  };

  const handleNavigateLiderTab = (dir: "prev" | "next") => {
    const sequence = ["base", "r1", "r2", "r3", "r4", "prev"];
    const currentIndex = sequence.indexOf(liderTab);
    if (dir === "prev" && currentIndex > 0) {
      const nextTab = sequence[currentIndex - 1];
      setLiderTab(nextTab);
      if (nextTab.startsWith("r")) {
        setActiveStage(parseInt(nextTab.replace("r", "")));
      }
    } else if (dir === "next" && currentIndex < sequence.length - 1) {
      const nextTab = sequence[currentIndex + 1];
      setLiderTab(nextTab);
      if (nextTab.startsWith("r")) {
        setActiveStage(parseInt(nextTab.replace("r", "")));
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-sand text-ink">
      {/* Topbar */}
      <header className="px-6 h-14 bg-ink flex items-center justify-between gap-4 relative z-10 shrink-0 shadow-sm">
        <div 
          onClick={route ? handleNewCase : undefined}
          className={`flex items-center gap-2 ${route ? "cursor-pointer hover:opacity-85 transition-opacity" : ""}`}
          title={route ? "Volver al inicio (Limpiar y comenzar nuevo caso)" : undefined}
        >
          <h1 className="font-serif text-lg font-bold text-gold-light tracking-tight flex items-center gap-2">
            Sistema 4R
          </h1>
          <span className="text-white/45 text-xs font-normal border-l border-white/20 pl-2 hidden sm:inline ml-1">
            Plataforma Profesional de Consejería Bíblica Cristocéntrica
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {route && (
            <>
              {/* Back to Home / Clear */}
              <button 
                onClick={handleNewCase}
                className="px-3 py-1.5 rounded-lg bg-gold-light/10 text-gold-light hover:bg-gold-light/20 transition-all text-xs font-semibold border border-gold-light/20 flex items-center gap-1.5 cursor-pointer"
                title="Volver al inicio para crear u hojear otro caso"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Casos / Inicio</span>
              </button>

              {/* Autoguardado status beacon */}
              <span className="text-[10px] bg-white/5 border border-white/10 rounded-full py-1 px-2.5 text-white/70 hidden sm:flex items-center gap-1.5" title="Todos tus cambios en notas, crisis y progreso se sincronizan instantáneamente en la base de datos local">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-semibold tracking-wider">Autoguardado</span>
              </span>

              {/* JSON Backup Export Button */}
              <button
                onClick={(e) => {
                  const currentItem: SavedCase = {
                    id: currentCaseId || `caso_${Date.now()}`,
                    title: route.titulo,
                    date: new Date().toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }),
                    problema: mode === "lid" ? problemaLider : problema,
                    selectedAreas: mode === "lid" ? [...selectedMinisterios, ...selectedTensiones] : selectedAreas,
                    etapaInicialSelect,
                    activeStage,
                    route,
                    notas,
                    isLiderCase: mode === "lid"
                  };
                  handleExportCase(currentItem, e);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[#CCCCCC] hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="Exportar respaldo de este expediente en JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden md:inline">Respaldar</span>
              </button>
            </>
          )}

          <span className="text-[11px] bg-white/5 border border-white/10 rounded-full py-1 px-3 text-white/60 truncate max-w-[160px] sm:max-w-xs block">
            {route ? `Caso: ${route.titulo}` : "Sin sesión activa"}
          </span>
        </div>
      </header>

      {/* Mode Navigation Bar */}
      <div className="flex bg-[#F0EAD8] border-b-1.5 border-sand-border shrink-0 select-none">
        <button
          type="button"
          disabled={!!route}
          onClick={() => setMode("gen")}
          className={`flex-1 py-3.5 px-4 text-center text-xs font-bold uppercase transition-all flex items-center justify-center gap-2.5 tracking-wider ${
            mode === "gen"
              ? "text-s1 border-b-3 border-s1 bg-s1-light font-bold"
              : "text-ink-muted/70 border-b-3 border-transparent hover:text-ink-soft hover:bg-white/35 cursor-pointer"
          } ${route ? "opacity-60 cursor-not-allowed" : ""}`}
          title={route ? "Finaliza o inicia un nuevo expediente para cambiar de modalidad" : "Haz clic para cambiar al módulo de Consejería General"}
        >
          <Activity className="w-4 h-4 shrink-0" />
          <span>Consejería General</span>
        </button>
        <button
          type="button"
          disabled={!!route}
          onClick={() => setMode("lid")}
          className={`flex-1 py-3.5 px-4 text-center text-xs font-bold uppercase transition-all flex items-center justify-center gap-2.5 tracking-wider ${
            mode === "lid"
              ? "text-[#6B4C11] border-b-3 border-[#C49A3C] bg-[#FDF3DF] font-bold"
              : "text-ink-muted/70 border-b-3 border-transparent hover:text-ink-soft hover:bg-white/35 cursor-pointer"
          } ${route ? "opacity-60 cursor-not-allowed" : ""}`}
          title={route ? "Finaliza o inicia un nuevo expediente para cambiar de modalidad" : "Haz clic para cambiar al módulo de Cuidado de Líderes y Ministros"}
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span>Consejería para Líderes (Grave/Burnout)</span>
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="bg-[#FAF7F1] border-r-1.5 border-sand-border flex flex-col overflow-y-auto shrink-0 select-none">
          
          {mode === "gen" ? (
            /* GENERAL COUNSELING SIDEBAR VIEW */
            <>
              {/* Problem input / Quick Load Section */}
              <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-sm font-semibold text-ink">
                    Ficha del aconsejado
                  </h2>
                  {!route && (
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                      Pautas iniciales
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                    Descripción de la crisis o dolor
                  </span>
                  
                  {/* Segmented Controller for Input Modes */}
                  <div className="flex border border-sand-border rounded-lg overflow-hidden bg-sand-dark/25 p-0.5 mb-1">
                    <button
                      type="button"
                      disabled={!!route}
                      onClick={() => setInputMode("words")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === "words"
                          ? "bg-white text-gold shadow-xs font-bold font-serif"
                          : "text-ink-soft hover:text-ink hover:bg-white/40 font-sans"
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                      title="Expón el caso libremente en tus propias palabras"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Propias Palabras</span>
                    </button>
                    <button
                      type="button"
                      disabled={!!route}
                      onClick={() => setInputMode("questions")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === "questions"
                          ? "bg-white text-gold shadow-xs font-bold font-serif"
                          : "text-ink-soft hover:text-ink hover:bg-white/40 font-sans"
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                      title="Responde un set de preguntas para diagnosticar la situación con orden"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Preguntas Guía</span>
                    </button>
                  </div>

                  {inputMode === "words" ? (
                    <div className="flex flex-col gap-1">
                      <textarea 
                        value={problema}
                        onChange={(e) => setProblema(e.target.value)}
                        disabled={!!route}
                        placeholder="Describe la situación con detalle: contexto, desencadenantes, comportamiento observado, lo que el aconsejado expresa y actitudes espirituales..."
                        className="w-full text-xs min-h-[140px] resize-none border-1.5 border-sand-border bg-white rounded-lg p-2.5 focus:border-gold outline-none text-ink placeholder:text-ink-muted/55 disabled:bg-sand-dark/15 disabled:text-ink-soft"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1 border border-sand-border bg-white/40 rounded-xl p-3 max-h-[380px] overflow-y-auto">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider text-left">
                          1. Circunstancia Externa o Detonante
                        </label>
                        <textarea
                          value={q1}
                          onChange={(e) => setQ1(e.target.value)}
                          disabled={!!route}
                          placeholder="¿Qué eventos o dificultades detonaron esta crisis?"
                          className="w-full text-xs min-h-[60px] resize-none border border-sand-border bg-white rounded-lg p-2 focus:border-gold outline-none text-ink placeholder:text-ink-muted/50 disabled:bg-sand-dark/15 disabled:text-ink-soft text-left"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider text-left">
                          2. Reacción Conductual y Emocional
                        </label>
                        <textarea
                          value={q2}
                          onChange={(e) => setQ2(e.target.value)}
                          disabled={!!route}
                          placeholder="¿Cómo reacciona emocional o físicamente; palabras o conductas?"
                          className="w-full text-xs min-h-[60px] resize-none border border-sand-border bg-white rounded-lg p-2 focus:border-gold outline-none text-ink placeholder:text-ink-muted/50 disabled:bg-sand-dark/15 disabled:text-ink-soft text-left"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider text-left">
                          3. Corazón (Deseos o Ídolos)
                        </label>
                        <textarea
                          value={q3}
                          onChange={(e) => setQ3(e.target.value)}
                          disabled={!!route}
                          placeholder="¿Qué anhela, teme o valora más su corazón en esto?"
                          className="w-full text-xs min-h-[60px] resize-none border border-sand-border bg-white rounded-lg p-2 focus:border-gold outline-none text-ink placeholder:text-ink-muted/50 disabled:bg-sand-dark/15 disabled:text-ink-soft text-left"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider text-left">
                          4. Dios (Perspectiva de Fe y Gracia)
                        </label>
                        <textarea
                          value={q4}
                          onChange={(e) => setQ4(e.target.value)}
                          disabled={!!route}
                          placeholder="¿Cómo busca percibir el obrar o las escrituras en la circunstancia?"
                          className="w-full text-xs min-h-[60px] resize-none border border-sand-border bg-white rounded-lg p-2 focus:border-gold outline-none text-ink placeholder:text-ink-muted/50 disabled:bg-sand-dark/15 disabled:text-ink-soft text-left"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick pre-loaders if no route loaded */}
                {!route && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-ink-muted tracking-wider uppercase">
                      Casos de Estudio Prediseñados
                    </span>
                    <div className="flex flex-col gap-1">
                      {CASE_EXAMPLES.map((ex, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectExample(ex)}
                          className="text-left text-[11px] py-1.5 px-2.5 rounded-md border border-sand-border bg-white hover:border-gold hover:text-gold transition-all flex items-center justify-between w-full font-medium cursor-pointer"
                        >
                          <span className="truncate">{ex.title}</span>
                          <ArrowRight className="w-3 h-3 text-ink-muted" strokeWidth={2.5} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Life Areas Selector */}
              <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-2">
                <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                  Áreas de Vida Afectadas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LIFE_AREAS.map((area) => {
                    const isSelected = selectedAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        disabled={!!route}
                        onClick={() => handleToggleArea(area)}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all truncate text-left max-w-full font-medium ${
                          isSelected 
                            ? "bg-gold-pale border-gold text-gold hover:opacity-95" 
                            : "bg-white border-sand-border text-ink-soft hover:border-gold hover:text-gold cursor-pointer"
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* LEADERSHIP PREVENTIVE SIDEBAR VIEW */
            <>
              {/* Leader dossier form */}
              <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-sm font-semibold text-[#6B4C11]">
                    Ficha de Liderazgo (Ministro)
                  </h2>
                  {!route && (
                    <span className="text-[10px] text-amber-800 uppercase tracking-wider font-semibold bg-[#FDF3DF] px-2 py-0.5 rounded">
                      Cuidado Pastoral
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                    Situación del líder o ministro
                  </span>
                  <div className="flex flex-col gap-1">
                    <textarea 
                      value={problemaLider}
                      onChange={(e) => setProblemaLider(e.target.value)}
                      disabled={!!route}
                      placeholder="Describe en detalle: tiempo en el rol, responsabilidades, presiones, la tensión/agotamiento actual de la obra, o sospecha de doble vida oculta..."
                      className="w-full text-xs min-h-[140px] resize-none border-1.5 border-sand-border bg-white rounded-lg p-2.5 focus:border-[#C49A3C] outline-none text-ink placeholder:text-ink-muted/55 disabled:bg-sand-dark/15 disabled:text-ink-soft"
                    />
                  </div>
                </div>

                {/* Leadership examples selector */}
                {!route && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-[#6B4C11] tracking-wider uppercase">
                      Casos de Pastores y Líderes
                    </span>
                    <div className="flex flex-col gap-1">
                      {LIDER_CASE_EXAMPLES.map((ex, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectLiderExample(ex)}
                          className="text-left text-[11px] py-1.5 px-2.5 rounded-md border border-light-amber/40 bg-white hover:border-[#C49A3C] hover:text-[#6B4C11] transition-all flex items-center justify-between w-full font-medium cursor-pointer"
                        >
                          <span className="truncate">{ex.title}</span>
                          <ArrowRight className="w-3 h-3 text-ink-muted" strokeWidth={2.5} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Ministerios Chip Selectors */}
              <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-2">
                <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                  Cargo / Tipo de ministerio
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MINISTERIOS.map((min) => {
                    const isSelected = selectedMinisterios.includes(min);
                    return (
                      <button
                        key={min}
                        type="button"
                        disabled={!!route}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedMinisterios(selectedMinisterios.filter(x => x !== min));
                          } else {
                            setSelectedMinisterios([...selectedMinisterios, min]);
                          }
                        }}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all truncate text-left max-w-full font-medium ${
                          isSelected 
                            ? "bg-[#FDF3DF] border-[#C49A3C] text-[#6B4C11] hover:opacity-95" 
                            : "bg-white border-sand-border text-ink-soft hover:border-[#C49A3C] hover:text-[#6B4C11] cursor-pointer"
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {min}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tensiones Chip Selectors */}
              <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#6B4C11] tracking-wider uppercase">
                  Área de Tensión o Síntoma
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TENSIONES.map((ten) => {
                    const isSelected = selectedTensiones.includes(ten);
                    return (
                      <button
                        key={ten}
                        type="button"
                        disabled={!!route}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTensiones(selectedTensiones.filter(x => x !== ten));
                          } else {
                            setSelectedTensiones([...selectedTensiones, ten]);
                          }
                        }}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all truncate text-left max-w-full font-medium ${
                          isSelected 
                            ? "bg-rose-50 border-rose-300 text-rose-700 hover:opacity-95" 
                            : "bg-white border-sand-border text-ink-soft hover:border-rose-400 hover:text-rose-700 cursor-pointer"
                        } disabled:opacity-75 disabled:cursor-not-allowed`}
                      >
                        {ten}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Initial Stage Select (Fijo) */}
          <div className="p-5 border-b-1.5 border-sand-border flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                Etapa inicial del tratamiento
              </label>
              <div className="text-xs bg-sand-dark/30 border border-sand-border rounded-lg py-2 px-3 text-ink-soft font-semibold flex items-center justify-between">
                <span>01 — Redefinir la Situación</span>
                <span className="text-[9px] bg-gold-pale text-gold px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">Etapa Fija</span>
              </div>
            </div>

            {/* Main Action Button */}
            {!route && (
              <button
                type="button"
                onClick={() => handleGenerateRoute(false)}
                className={`w-full mt-2 py-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:-translate-y-[1px] active:translate-y-0 ${
                  mode === "lid"
                    ? "bg-[#6B4C11] text-gold-light hover:bg-[#523A0C]"
                    : "bg-ink text-gold-light hover:bg-neutral-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-light shrink-0 animate-pulse" />
                <span>{mode === "lid" ? "Generar ruta del Ministro" : "Generar ruta de consejería"}</span>
              </button>
            )}
          </div>

          {/* PERSISTENT CRITICAL UPDATE FORM (Visible only when route is set) */}
          {route && (
            <div className="p-5 border-b-1.5 border-sand-border bg-s3-light/15 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-s3">
                <TriangleAlert className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-s3">
                  Nueva información o Crisis
                </span>
              </div>
              <textarea
                value={crisisInput}
                onChange={(e) => setCrisisInput(e.target.value)}
                placeholder={mode === "lid" ? "Añade nuevos factores de riesgo, caídas graves o actitudes de rebeldía para reestructurar pastoralmente..." : "Añade nueva información emergente, empeoramiento o resistencia del aconsejado para adaptar la ruta interactiva..."}
                className="w-full text-xs min-h-[70px] resize-none border border-s3-medium/30 bg-white rounded-lg p-2 focus:border-s3 outline-none text-ink placeholder:text-ink-muted/50"
              />
              <button
                type="button"
                onClick={() => handleGenerateRoute(true)}
                className="w-full py-2 bg-s3 text-white rounded-lg text-xs font-semibold hover:bg-s3-medium transition-all cursor-pointer"
              >
                Actualizar con esta información
              </button>
            </div>
          )}

          {/* USER SESSION NOTES FORM (Visible only when route is set) */}
          {route && (
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="notes-textarea" className="text-[10px] font-bold text-ink-muted tracking-wider uppercase">
                  {mode === "lid" ? "Notas de Acompañamiento del Ministro" : "Notas del Consejero"}
                </label>
                <textarea
                  id="notes-textarea"
                  value={notaInput}
                  onChange={(e) => setNotaInput(e.target.value)}
                  placeholder={mode === "lid" ? "Anota observaciones particulares, confesiones confidenciales, pactos de rendición de cuentas..." : "Anota observaciones particulares, reacciones, compromisos o confesiones para registrar en el historial..."}
                  className="w-full text-xs min-h-[70px] resize-none border border-sand-border bg-white rounded-lg p-2 focus:border-gold outline-none text-ink placeholder:text-ink-muted/50"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="w-full mt-1.5 py-1.5 border border-sand-border hover:border-ink hover:bg-sand-dark text-xs font-semibold text-ink-soft rounded-lg transition-all cursor-pointer"
                >
                  + Agregar Nota
                </button>
              </div>

              {/* Dynamic Note History listing last 3 items */}
              {notas.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-ink-muted tracking-wider uppercase">
                      {mode === "lid" ? "Notas registradas confidenciales" : "Historial de anotaciones"}
                    </span>
                    <button
                      type="button"
                      onClick={handleExportNotesAsTxt}
                      className="text-[10px] text-gold hover:text-gold/80 hover:underline transition-all flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                      title="Exportar todas las notas de la sesión como archivo de texto plano (.txt)"
                    >
                      <Download className="w-3 h-3" />
                      <span>Exportar .txt</span>
                    </button>
                  </div>
                  <div className="flex flex-col divide-y divide-sand-border bg-white rounded-lg border border-sand-border px-3 py-1">
                    {notas.map((n, index) => {
                      const stagesList = mode === "lid"
                        ? ["Diagnóstico", "Redefinir (01)", "Reenfocar (02)", "Rendir (03)", "Reestructurar (04)", "Prevención"]
                        : ["", "Redefinir", "Reenfocar", "Rendir", "Reestructurar"];
                      return (
                        <div key={index} className="py-2.5 flex justify-between gap-2 text-left">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-ink-soft leading-relaxed break-words">{n.txt}</p>
                            <span className="text-[9px] text-ink-muted mt-1 block">
                              {n.hora} • Fase: {stagesList[n.etapa] || `Fase ${n.etapa}`}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(index)}
                            className="text-ink-muted hover:text-s3 p-1 rounded transition-colors self-start shrink-0 cursor-pointer"
                            title="Eliminar nota"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="flex flex-col overflow-hidden">
          
          {/* Stage Tabs (Static but interactive if active route is loaded) */}
          {mode === "gen" ? (
            <div className="bg-[#EBE5DB] border-b-1.5 border-sand-border select-none shrink-0 flex overflow-x-auto">
              {[1, 2, 3, 4].map((num) => {
                const names = ["", "Redefinir", "Reenfocar", "Rendir", "Reestructurar"];
                const isLocked = !route;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setActiveStage(num)}
                    className={getStageClassMap(num, activeStage)}
                    title={isLocked ? "Introduce los datos y pulsa Generar ruta para desbloquear las etapas" : undefined}
                  >
                    <span className="font-serif text-lg font-bold line-height-1">
                      0{num}
                    </span>
                    <span className="text-[9px] tracking-widest leading-none truncate max-w-full block">
                      {names[num]}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#EBE5DB] border-b-1.5 border-sand-border select-none shrink-0 flex overflow-x-auto">
              {[
                { id: "base", numStr: "Dx", name: "Diagnóstico", stageVal: 0 },
                { id: "r1", numStr: "01", name: "Redefinir", stageVal: 1 },
                { id: "r2", numStr: "02", name: "Reenfocar", stageVal: 2 },
                { id: "r3", numStr: "03", name: "Rendir", stageVal: 3 },
                { id: "r4", numStr: "04", name: "Reestructurar", stageVal: 4 },
                { id: "prev", numStr: "Px", name: "Prevención", stageVal: 5 }
              ].map((tabConfig) => {
                const isLocked = !route;
                const isSelected = liderTab === tabConfig.id;
                
                let baseClass = "flex-1 min-w-[100px] sm:min-w-0 py-3.5 px-4 text-center transition-all flex flex-col items-center justify-center gap-1 border-r border-[#D2CABA] text-xs font-sans ";
                if (isLocked) {
                  baseClass += "opacity-50 cursor-not-allowed text-ink-soft bg-transparent";
                } else if (isSelected) {
                  baseClass += "bg-[#FDF3DF] text-[#6B4C11] font-bold border-b-3 border-[#C49A3C]";
                } else {
                  baseClass += "text-ink hover:text-[#6B4C11] hover:bg-[#FAF7F1] cursor-pointer";
                }

                return (
                  <button
                    key={tabConfig.id}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      setLiderTab(tabConfig.id);
                      if (tabConfig.stageVal >= 1 && tabConfig.stageVal <= 4) {
                        setActiveStage(tabConfig.stageVal);
                      }
                    }}
                    className={baseClass}
                    title={isLocked ? "Introduce los datos para desbloquear el expediente ministerial del líder" : undefined}
                  >
                    <span className="font-serif text-base font-bold line-height-1">
                      {tabConfig.numStr}
                    </span>
                    <span className="text-[9px] tracking-widest leading-none truncate max-w-full block font-medium">
                      {tabConfig.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content Scroll Shell */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            
            {/* Loading Indicator screen */}
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-10">
                <div className="w-10 h-10 border-3 border-sand-border border-t-gold rounded-full animate-spin-loader shrink-0" />
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-ink-soft italic font-medium">
                    {loadingText}
                  </p>
                  <p className="text-xs text-ink-muted max-w-xs">
                    El sistema está formulando la intervención bíblica, asociando pasajes de la Escritura y adaptando el diagnóstico. Esto puede tomar unos segundos...
                  </p>
                </div>
              </div>
            )}

            {/* Empty State Instructions & Saved Cases Manager screen */}
            {!route && !isLoading && !error && (
              <div className="space-y-10 py-6 max-w-5xl mx-auto">
                
                {/* Intro Panel dynamic based on counselling mode */}
                {mode === "gen" ? (
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto px-4">
                    <div className="w-14 h-14 bg-white border border-sand-border rounded-full flex items-center justify-center mb-4 shadow-xs">
                      <svg className="w-6 h-6 text-gold" viewBox="0 0 52 52" fill="none">
                        <rect x="22" y="2" width="8" height="48" rx="4" fill="currentColor"/>
                        <rect x="2" y="18" width="48" height="8" rx="4" fill="currentColor"/>
                      </svg>
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-ink leading-tight mb-2">
                      Ruta Teológica de Restauración
                    </h2>
                    <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                      El <strong>Método de Consejería Bíblica de las 4R</strong> redefine la situación desde una mirada del soberano obrar de Dios, examina los deseos raíces del corazón, llama al arrepentimiento ante la Cruz y estructura un sendero de obediencia cotidiana.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center max-w-2xl mx-auto px-4">
                    <div className="w-14 h-14 bg-white border border-[#C49A3C]/40 rounded-full flex items-center justify-center mb-4 shadow-xs">
                      <HeartHandshake className="w-6 h-6 text-[#6B4C11]" />
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-ink leading-tight mb-2">
                      Acompañamiento de Liderazgo y Salud del Ministro
                    </h2>
                    <p className="text-sm text-ink-muted leading-relaxed max-w-xl">
                      Diseñado para el cuidado pastoral y confidencial de obreros de la iglesia que experimentan <strong>agotamiento profundo (burnout), dobles vidas espirituales o presiones extremas del ministerio</strong>. Sigue un plan guiado de restauración de la gracia, límites saludables y rendición de cuentas.
                    </p>
                  </div>
                )}

                {/* Saved Cases Manager Block */}
                <div className="space-y-4">
                  <div className="border-t border-sand-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-gold" />
                        Historial de Expedientes Guardados
                        <span className="text-xs font-sans font-normal px-2 py-0.5 rounded-full bg-sand-dark text-ink-muted">
                          {savedCases.length} {savedCases.length === 1 ? "caso" : "casos"}
                        </span>
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Continúa sesiones previas, visualiza diagnósticos pastorales y notas de tratamiento de manera segura.
                      </p>
                    </div>

                    {/* Import backup action */}
                    <label className="sm:self-center flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border-1.5 border-sand-border bg-white text-ink-soft hover:bg-sand-dark hover:border-gold hover:text-gold text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0 select-none">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Importar Respaldo (.json)</span>
                      <input type="file" accept=".json" onChange={handleImportCase} className="hidden" />
                    </label>
                  </div>

                  {savedCases.length === 0 ? (
                    <div className="bg-white/50 border border-dashed border-sand-border rounded-xl p-8 text-center text-xs text-ink-soft max-w-lg mx-auto">
                      <HelpCircle className="w-8 h-8 text-gold/60 mx-auto mb-2" />
                      <p className="font-bold mb-1">No hay expedientes guardados en este navegador todavía</p>
                      <p className="text-ink-muted max-w-xs mx-auto leading-relaxed">
                        Selecciona la modalidad de consulta, describe la crisis en la ficha izquierda y presiona Generar. Tu avance quedará protegido automáticamente de forma local.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedCases.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleLoadCase(item)}
                          className="text-left bg-white border border-sand-border rounded-xl p-5 hover:border-gold hover:shadow-sm hover:-translate-y-[1px] transition-all cursor-pointer flex flex-col justify-between gap-4 group relative"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2 border-b border-sand-border/30 pb-2">
                              <h4 className="font-serif text-sm font-bold text-ink group-hover:text-gold transition-colors line-clamp-1">
                                {item.title}
                              </h4>
                              <span className="text-[10px] text-ink-muted shrink-0 font-medium font-mono">
                                {item.date}
                              </span>
                            </div>
                            <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed italic pr-2">
                              "{item.problema}"
                            </p>
                            
                            {/* Tags showing the specific life areas or ministry types */}
                            <div className="flex flex-wrap gap-1 items-center pt-1">
                              {item.isLiderCase ? (
                                <span className="text-[9px] bg-amber-100/70 text-amber-850 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                                  <HeartHandshake className="w-2.5 h-2.5 text-[#6B4C11]" />
                                  <span>Liderazgo / Pastoral</span>
                                </span>
                              ) : (
                                <span className="text-[9px] bg-sky-100/70 text-sky-850 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-sky-200">
                                  <Activity className="w-2.5 h-2.5 text-sky-700" />
                                  <span>General / 4R</span>
                                </span>
                              )}
                              
                              {item.selectedAreas && item.selectedAreas.slice(0, 3).map(area => (
                                <span key={area} className="text-[9px] bg-sand-dark px-1.5 py-0.5 rounded text-ink-soft font-semibold">
                                  {area}
                                </span>
                              ))}
                              {item.selectedAreas && item.selectedAreas.length > 3 && (
                                <span className="text-[9px] bg-sand-dark px-1.5 py-0.5 rounded text-ink-muted font-bold">
                                  +{item.selectedAreas.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-sand-border/60 pt-3 text-[11px] text-ink-muted">
                            <span className="flex items-center gap-1.5 font-medium">
                              <FileText className="w-3.5 h-3.5" />
                              <span>{item.notas ? item.notas.length : 0} {item.notas?.length === 1 ? "nota" : "notas"}</span>
                              <span className="text-[#E0E0E0]">•</span>
                              <span className="bg-gold-pale/60 text-gold px-1.5 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
                                {item.isLiderCase ? "Caso Lider" : `Etapa ${item.activeStage || 1}`}
                              </span>
                            </span>
                            
                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleExportCase(item, e)}
                                title="Exportar copia de respaldo"
                                className="p-1 px-1.5 border border-sand-border hover:border-gold rounded bg-white text-ink-muted hover:text-gold transition-all cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteCase(item.id, e)}
                                title="Eliminar expediente"
                                className="p-1 px-1.5 border border-sand-border hover:border-s3 rounded bg-white text-ink-muted hover:text-s3 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Error screen */}
            {error && !isLoading && (
              <div className="max-w-xl mx-auto py-10">
                <div className="bg-white border-1.5 border-s3-medium rounded-xl p-6 shadow-sm flex gap-4">
                  <AlertOctagon className="w-10 h-10 text-s3 shrink-0" />
                  <div className="flex-1 text-left">
                    <h3 className="font-serif text-lg font-bold text-s3 mb-2">
                      Error de Generación
                    </h3>
                    <p className="text-xs text-ink-soft leading-relaxed mb-4">
                      {error}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateRoute(false)}
                        className="px-4 py-2 bg-s3 hover:bg-s3-medium text-white text-xs font-semibold rounded-lg cursor-pointer transition-all"
                      >
                        Reintentar Generar
                      </button>
                      <button
                        onClick={() => setError(null)}
                        className="px-4 py-2 bg-white text-ink border border-sand-border text-xs font-semibold rounded-lg cursor-pointer transition-all"
                      >
                        Limpiar Error
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTE LOADED DISPLAY GRID */}
            {route && !isLoading && !error && (
              mode === "gen" ? (
                /* STANDARD GENERAL COUNSELING DISPATCHER */
                <div className="space-y-6">
                  
                  {/* Hero Header stage banner */}
                  <div className={`p-6 md:p-8 rounded-2xl border-1.5 transition-colors relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 text-left ${
                    activeStage === 1 ? "bg-s1-light border-s1-medium/30" :
                    activeStage === 2 ? "bg-s2-light border-s2-medium/30" :
                    activeStage === 3 ? "bg-s3-light border-s3-medium/30" :
                    "bg-s4-light border-s4-medium/30"
                  }`}>
                    {/* Backdrop subtle cross */}
                    <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-white opacity-25 select-none pointer-events-none">
                      <svg className="w-64 h-64" viewBox="0 0 52 52" fill="none">
                        <rect x="22" y="2" width="8" height="48" rx="4" fill="currentColor"/>
                        <rect x="2" y="18" width="48" height="8" rx="4" fill="currentColor"/>
                      </svg>
                    </div>

                    <div className="relative z-10 space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
                          activeStage === 1 ? "bg-s1 text-white" :
                          activeStage === 2 ? "bg-s2 text-white" :
                          activeStage === 3 ? "bg-s3 text-white" :
                          "bg-s4 text-white"
                        }`}>
                          Etapa 0{activeStage} — {route.etapas[activeStage - 1].nombre}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-ink leading-snug max-w-2xl">
                        {route.etapas[activeStage - 1].enfoque}
                      </h2>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded border border-ink/5 text-ink-soft">
                          Caso: {route.titulo}
                        </span>
                        <span className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded border border-ink/5 text-ink-soft">
                          Etapa Inicial Recomendada: 0{route.etapaInicial}
                        </span>
                        <button
                          onClick={() => setIsShareModalOpen(true)}
                          className="text-[10px] font-bold bg-white/80 hover:bg-white text-gold hover:text-gold/80 px-2.5 py-1 rounded border border-gold-light/45 hover:border-gold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs font-sans"
                          title="Compartir resumen y enlace del expediente de consejería"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Compartir</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end text-right">
                      <span className={`font-serif text-7xl md:text-8xl font-black leading-none ${
                        activeStage === 1 ? "text-s1" :
                        activeStage === 2 ? "text-s2" :
                        activeStage === 3 ? "text-s3" :
                        "text-s4"
                      }`}>
                        0{activeStage}
                      </span>
                    </div>
                  </div>

                  {/* THEOLOGICAL DIAGNOSIS */}
                  <div className="bg-ink text-white rounded-2xl p-6 relative overflow-hidden shadow-md text-left">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gold" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-gold-light">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-bold tracking-widest uppercase pl-0.5">
                          Diagnóstico Teológico del Corazón
                        </span>
                      </div>
                      <p className="font-serif text-sm md:text-base leading-relaxed text-white/90 italic pl-1">
                        "{route.diagnostico}"
                      </p>
                    </div>
                  </div>

                  {/* LIE VS EVANGELICAL TRUTH BLOCK */}
                  <div className="bg-white border border-sand-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm text-left border-neutral-200">
                    <div className="flex items-center gap-1.5 text-ink-soft">
                      <ClipboardList className="w-4 h-4" />
                      <h3 className="text-xs font-bold tracking-wider uppercase">
                        Deconstrucción Espiritual del Conflicto
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* The Lie */}
                      <div className="bg-[#FFF6F3] border-l-4 border-s3 rounded-r-xl p-4 md:p-5 space-y-1.5">
                        <span className="text-[9px] font-bold text-s3 tracking-wider uppercase">
                          La mentira autosuficiente instalada
                        </span>
                        <p className="text-sm text-ink font-serif leading-relaxed">
                          {route.etapas[activeStage - 1].mentira}
                        </p>
                      </div>

                      {/* The Truth */}
                      <div className="bg-[#F3FAF6] border-l-4 border-s2 rounded-r-xl p-4 md:p-5 space-y-1.5">
                        <span className="text-[9px] font-bold text-s2 tracking-wider uppercase">
                          La Verdad de la Gracia del Evangelio
                        </span>
                        <p className="text-sm text-ink font-serif leading-relaxed">
                          {route.etapas[activeStage - 1].verdad}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* IN-SESSION GRID: CORE QUESTIONS AND COUNSEE TOOLS */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
                    
                    {/* Guided introspective questions */}
                    <div className="bg-white border border-sand-border rounded-2xl p-6 space-y-4 shadow-sm border-neutral-205">
                      <div className="flex items-center gap-1.5 text-ink-soft border-b border-sand-border pb-3">
                        <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                        <h3 className="text-xs font-bold tracking-wider uppercase">
                          Preguntas Diagnósticas en Sesión
                        </h3>
                      </div>
                      
                      <div className="space-y-2.5">
                        {route.etapas[activeStage - 1].preguntas.map((q, idx) => (
                          <div key={idx} className="flex gap-3 bg-sand/35 hover:bg-sand/65 transition-colors rounded-xl p-3 items-start border border-sand-border/40">
                            <span className="font-serif text-base font-bold text-gold shrink-0 leading-none mt-0.5">
                              0{idx + 1}
                            </span>
                            <p className="text-xs text-ink h-auto flex-1 font-medium leading-relaxed">
                              {q}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational practical tools */}
                    <div className="bg-white border border-sand-border rounded-2xl p-6 space-y-4 shadow-sm border-neutral-205">
                      <div className="flex items-center gap-1.5 text-ink-soft border-b border-sand-border pb-3">
                        <Wrench className="w-4 h-4 text-gold shrink-0" />
                        <h3 className="text-xs font-bold tracking-wider uppercase">
                          Herramientas y Dinámicas Clínicas
                        </h3>
                      </div>

                      <div className="space-y-2.5">
                        {route.etapas[activeStage - 1].herramientas.map((h, idx) => {
                          const tool = getToolDetails(h, idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedTool(tool);
                                setIsToolModalOpen(true);
                              }}
                              className="group w-full text-left flex gap-3 border-1.5 border-sand-border hover:border-gold/40 rounded-xl p-3 items-start bg-white hover:bg-gold-pale/25 transition-all duration-250 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-gold-light"
                            >
                              <div className={`w-2 h-2 rounded-full mt-2.5 shrink-0 ${
                                activeStage === 1 ? "bg-s1 bg-opacity-80 group-hover:scale-125" :
                                activeStage === 2 ? "bg-s2 bg-opacity-80 group-hover:scale-125" :
                                activeStage === 3 ? "bg-s3 bg-opacity-80 group-hover:scale-125" :
                                "bg-s4 bg-opacity-80 group-hover:scale-125"
                              } transition-transform`} />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
                                    Recurso {idx + 1}
                                  </span>
                                  <span className="text-[10px] text-gold font-semibold opacity-0 group-hover:opacity-100 transition-opacity font-sans flex items-center gap-1 select-none">
                                    <span>Ver guía</span>
                                    <span>→</span>
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-ink group-hover:text-gold transition-colors truncate">
                                  {tool.nombre}
                                </h4>
                                <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                                  {tool.concepto}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* THE PRACTICAL PARCHMENT HOMEWORK */}
                  <div className="bg-gold-pale border border-gold-light rounded-2xl p-6 md:p-8 space-y-3.5 shadow-sm text-left">
                    <div className="flex items-center gap-2 text-gold">
                      <BookMarked className="w-5 h-5 shrink-0" />
                      <h3 className="text-xs font-bold tracking-wider uppercase">
                        Tarea Espiritual y Práctica para el Hogar
                      </h3>
                    </div>
                    <div className="border-t border-gold-light/40 pt-3">
                      <p className="font-serif text-sm md:text-base leading-relaxed text-ink-soft italic">
                        "{route.etapas[activeStage - 1].tarea}"
                      </p>
                    </div>
                  </div>

                  {/* SCRIPTURE CITATIONS ACCORDION */}
                  <div className="bg-white border border-sand-border rounded-2xl p-6 space-y-4 shadow-sm text-left border-neutral-205">
                    <div className="flex items-center gap-1.5 text-ink-soft border-b border-sand-border pb-3">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <h3 className="text-xs font-bold tracking-wider uppercase">
                        Respaldos Bíblicos de la Etapa
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {route.etapas[activeStage - 1].pasajes.map((p, idx) => (
                        <div key={idx} className="bg-gold-pale/30 border border-gold-light/35 rounded-xl p-4 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="font-serif text-sm font-bold text-gold mb-1">
                              {p.ref}
                            </div>
                            <p className="text-xs text-ink-soft leading-relaxed">
                              {p.razon}
                            </p>
                          </div>
                          <div className="pt-2 text-right">
                            <span className="text-[9px] text-ink-muted italic select-none">
                              Lectura Recomendada
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DANGER/ALERT SIGNALS FOR PASTORAL SAFE-GUARDING */}
                  {route.senalesAlerta && route.senalesAlerta.length > 0 && activeStage === route.etapaInicial && (
                    <div className="bg-[#FFF3F0] border-1.5 border-s3-medium/35 rounded-2xl p-6 space-y-3 shadow-xs text-left">
                      <div className="flex items-center gap-2 text-s3">
                        <AlertOctagon className="w-5 h-5 shrink-0" />
                        <h4 className="text-xs font-bold tracking-wider uppercase">
                          Señales de Alerta Críticas Evaluadas
                        </h4>
                      </div>
                      
                      <div className="divide-y divide-s3-medium/10">
                        {route.senalesAlerta.map((sig, idx) => (
                          <div key={idx} className="py-2.5 flex gap-2.5 items-start text-xs text-s3 leading-relaxed font-medium">
                            <span className="text-s3 shrink-0 select-none">→</span>
                            <span>{sig}</span>
                          </div>
                        ))}
                      </div>

                      {route.derivar && (
                        <div className="mt-3 p-3.5 bg-s3 text-white border border-s3-medium rounded-xl flex gap-3 text-xs font-semibold items-center shadow-sm">
                          <TriangleAlert className="w-5 h-5 shrink-0 animate-bounce" />
                          <div>
                            <span className="block font-bold">ALERTA PROFESIONAL ACTIVADA</span>
                            <p className="font-normal text-[11px] mt-0.5 text-white/90">
                              Por la severidad y los indicadores revelados, se aconseja priorizar la derivación a profesionales competentes en salud mental de manera inmediata o activar los mecanismos de protección correspondientes para salvaguardar la vida del aconsejado.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FOOTER NAV BUTTONS */}
                  <div className="flex items-center justify-between pt-4 border-t border-sand-border gap-4">
                    <button
                      onClick={() => handleNavigateStage("prev")}
                      disabled={activeStage === 1}
                      className="px-4 py-2.5 rounded-lg border-1.5 border-sand-border bg-white text-ink-soft hover:bg-sand-dark transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Etapa anterior
                    </button>
                    
                    <span className="text-[11px] font-bold text-ink-muted tracking-widest uppercase">
                      Etapa {activeStage} de 4
                    </span>

                    <button
                      onClick={() => handleNavigateStage("next")}
                      disabled={activeStage === 4}
                      className="px-4 py-2.5 rounded-lg border-none bg-ink text-gold-light hover:bg-[#2E2A1E] transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                    >
                      Siguiente etapa
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ) : (
                /* LEADERSHIP/MINISTRY PREVENTIVE RESTORATORY DISPATCHER */
                <div className="space-y-6 text-left">
                  
                  {liderTab === "base" && (
                    /* LEADERSHIP ASSESSMENT TAB (DIAGNÓSTICO) */
                    <div className="space-y-6">
                      
                      {/* Premium Lider Header */}
                      <div className="p-6 md:p-8 rounded-2xl border-1.5 bg-[#FDF3DF] border-[#D8C6A5] relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
                        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-[#6B4C11]/5 opacity-15 select-none pointer-events-none">
                          <HeartHandshake className="w-72 h-72" />
                        </div>

                        <div className="relative z-10 space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#6B4C11] text-gold-light">
                              VALORACIÓN MINISTERIAL DE ENTRADA
                            </span>
                          </div>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#6B4C11] leading-snug max-w-2xl">
                            Diagnóstico Pastoral Confidencial del Ministro
                          </h2>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded border border-amber-900/10 text-[#6B4C11]">
                              Dossier: {route.titulo}
                            </span>
                            <span className="text-[10px] font-bold bg-[#6B4C11]/10 px-2.5 py-1 rounded border border-amber-950/20 text-[#6B4C11]">
                              Estado del Ministerio: Acompañamiento Crítico
                            </span>
                            <button
                              onClick={() => setIsShareModalOpen(true)}
                              className="text-[10px] font-bold bg-white hover:bg-neutral-50 text-[#6B4C11] px-2.5 py-1 rounded border border-amber-900/20 cursor-pointer transition-all flex items-center gap-1.5 shadow-xs font-sans"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Compartir Expediente</span>
                            </button>
                          </div>
                        </div>

                        <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end text-right">
                          <HeartHandshake className="w-16 h-16 text-[#C49A3C]/70 pb-1" />
                        </div>
                      </div>

                      {/* DIAGNÓSTICO DEL DILEMA DEL LÍDER */}
                      <div className="bg-ink text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C49A3C]" />
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-gold-light">
                            <ClipboardList className="w-4 h-4 text-gold-light" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">
                              Evaluación de la Crisis y el Alma del Ministro
                            </span>
                          </div>
                          <p className="font-serif text-sm md:text-base leading-relaxed text-white/95 italic">
                            "{route.diagnosticoLider || route.diagnostico}"
                          </p>
                        </div>
                      </div>

                      {/* PECADO MINISTERIAL PATTERNS */}
                      {route.pecadoMinisterial && (
                        <div className="bg-white border border-rose-100 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                          <div className="flex items-center gap-1.5 text-rose-800">
                            <TriangleAlert className="w-4 h-4" />
                            <h3 className="text-xs font-bold tracking-wider uppercase text-rose-800">
                              Identificación del Patrón de Pecado u Orgullo Espiritual
                            </h3>
                          </div>
                          <div className="bg-rose-50/70 border-l-4 border-rose-500 rounded-lg p-5">
                            <p className="text-sm text-ink font-serif leading-relaxed italic">
                              "{route.pecadoMinisterial}"
                            </p>
                          </div>
                          <p className="text-xs text-ink-soft leading-relaxed">
                            <strong>Nota del aconsejador:</strong> Muchos líderes construyen una doble vida debido al aislamiento y al temor de no cumplir las expectativas humanas. Expón el evangelio del perdón gratuito y saca este patrón a la luz de Cristo de forma pastoral y tierna.
                          </p>
                        </div>
                      )}

                      {/* RIESGO MINISTERIAL AND EXHAUSTION (BURNOUT) */}
                      {route.riesgoMinisterio && (
                        <div className="bg-white border border-amber-100 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                          <div className="flex items-center gap-1.5 text-amber-800">
                            <AlertOctagon className="w-4 h-4" />
                            <h3 className="text-xs font-bold tracking-wider uppercase">
                              Evaluación de Riesgo Psico-Espiritual y Continuidad en la Obra
                            </h3>
                          </div>
                          <div className="bg-amber-50/50 border-l-4 border-amber-500 rounded-lg p-5">
                            <p className="text-sm text-ink font-sans leading-relaxed">
                              {route.riesgoMinisterio}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ALERTA CRITICA Y DERIVACION */}
                      {route.senalesAlerta && route.senalesAlerta.length > 0 && (
                        <div className="bg-rose-900 text-[#FFF2F0] rounded-2xl p-6 space-y-3 shadow-md">
                          <div className="flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5 text-[#FFE2DC] shrink-0" />
                            <h4 className="text-xs font-bold tracking-wider uppercase text-[#FFE2DC]">
                              Flasheadores de Riesgo / Red Flags del Acompañamiento
                            </h4>
                          </div>
                          
                          <div className="divide-y divide-white/10">
                            {route.senalesAlerta.map((sig, idx) => (
                              <div key={idx} className="py-2.5 flex gap-2.5 items-start text-xs text-white/95 leading-relaxed font-serif">
                                <span className="text-gold shrink-0">❖</span>
                                <span>{sig}</span>
                              </div>
                            ))}
                          </div>

                          {route.derivar && (
                            <div className="mt-2 p-3.5 bg-rose-950 text-white border border-rose-700 rounded-xl flex gap-3 text-xs font-semibold items-center">
                              <TriangleAlert className="w-5 h-5 text-rose-500 shrink-0 animate-pulse" />
                              <div>
                                <span className="block font-bold">ACCION RECOMENDADA DE PROTECCIÓN</span>
                                <p className="font-normal text-[11px] mt-0.5 text-white/85">
                                  Este caso de liderazgo requiere un alto nivel de cuidado. Si se evidencia auto-lesión, depresión severa clínica o colapso conductual, activa el círculo de consejería profesional y mentores institucionales prioritariamente.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {liderTab === "prev" && (
                    /* LEADERSHIP PREVENTION TAB */
                    <div className="space-y-6">
                      
                      {/* Premium Prevention Header */}
                      <div className="p-6 md:p-8 rounded-2xl border-1.5 bg-[#F2FAF6] border-emerald-200 relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
                        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-emerald-800/5 opacity-15 select-none pointer-events-none">
                          <BookMarked className="w-72 h-72" />
                        </div>

                        <div className="relative z-10 space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-700 text-white">
                              HOJA DE PREVENCIÓN Y LÍMITES
                            </span>
                          </div>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-emerald-850 leading-snug max-w-2xl">
                            Plan de Prevención, Limites y Líneas de Alianza
                          </h2>
                          <p className="text-xs text-ink-muted">
                            Protocolo estructurado para erradicar el aislamiento ministerial dominical y fortalecer la fidelidad del líder en la gracia.
                          </p>
                        </div>

                        <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end text-right">
                          <CheckCircle2 className="w-16 h-16 text-emerald-700/60" />
                        </div>
                      </div>

                      {/* PLAN PREVENTIVO DETAIL */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-emerald-800 pb-3 border-b border-sand-border">
                          <BookMarked className="w-5 h-5" />
                          <h3 className="text-xs font-bold tracking-wider uppercase">
                            Directrices de Prevención para la Vida del Obrero
                          </h3>
                        </div>
                        <div className="bg-[#FAFDFB] border-l-4 border-emerald-600 rounded-lg p-5">
                          <p className="text-[13px] text-ink-soft leading-relaxed whitespace-pre-line font-medium">
                            {route.prevencion || "Establecer límites estrictos con redes sociales y tecnología. Crear un pacto de transparencia total con el cónyuge y establecer de 1 a 2 consejeros externos inmediatos con quienes confesarse mensualmente."}
                          </p>
                        </div>
                      </div>

                      {/* CONVENIO DE ALIANZA Y LÍMITES */}
                      <div className="bg-amber-50/40 border border-[#FAF3E5] rounded-2xl p-6 space-y-4 text-left">
                        <div className="flex items-center gap-2 text-gold">
                          <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
                          <h4 className="text-xs font-bold tracking-wider uppercase">
                            Convenio de Alianza de Cuidado
                          </h4>
                        </div>
                        <ul className="space-y-2.5 text-xs text-ink-soft leading-relaxed list-disc list-inside">
                          <li><strong>Fin del aislamiento:</strong> El líder se compromete a no camuflar de manera dominical su salud interior detrás del podio.</li>
                          <li><strong>Mentores protectores:</strong> Un panel de 2 ancianos/pastores externos con derecho a preguntar todo con transparencia radical.</li>
                          <li><strong>Protección familiar:</strong> Tiempos sagrados de descanso y diálogo con el cónyuge, evitando que la obra sepulte al matrimonio.</li>
                        </ul>
                      </div>

                    </div>
                  )}

                  {liderTab.startsWith("r") && (
                    /* DYNAMIC RESTORATORIES STAGES FOR THE LEADER (R1-R4) */
                    <div className="space-y-6">
                      
                      {/* Stage header banner */}
                      <div className={`p-6 md:p-8 rounded-2xl border-1.5 transition-colors relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 ${
                        activeStage === 1 ? "bg-s1-light border-s1-medium/30" :
                        activeStage === 2 ? "bg-s2-light border-s2-medium/30" :
                        activeStage === 3 ? "bg-s3-light border-s3-medium/30" :
                        "bg-s4-light border-s4-medium/30"
                      }`}>
                        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 text-white opacity-25 select-none pointer-events-none">
                          <svg className="w-64 h-64" viewBox="0 0 52 52" fill="none">
                            <rect x="22" y="2" width="8" height="48" rx="4" fill="currentColor"/>
                            <rect x="2" y="18" width="48" height="8" rx="4" fill="currentColor"/>
                          </svg>
                        </div>

                        <div className="relative z-10 space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${
                              activeStage === 1 ? "bg-s1 text-white" :
                              activeStage === 2 ? "bg-s2 text-white" :
                              activeStage === 3 ? "bg-s3 text-white" :
                              "bg-s4 text-white"
                            }`}>
                              Fase 0{activeStage} Restauradora — {route.etapas[activeStage - 1].nombre}
                            </span>
                          </div>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-ink leading-snug max-w-2xl">
                            {route.etapas[activeStage - 1].enfoque}
                          </h2>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded border border-ink/5 text-ink-soft">
                              Expediente del Líder: {route.titulo}
                            </span>
                            <span className="text-[10px] font-bold bg-white/70 px-2.5 py-1 rounded border border-ink/5 text-ink-soft">
                              Punto de Partida Recomendado: 0{route.etapaInicial}
                            </span>
                          </div>
                        </div>

                        <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end text-right">
                          <span className={`font-serif text-7xl md:text-8xl font-black leading-none ${
                            activeStage === 1 ? "text-s1" :
                            activeStage === 2 ? "text-s2" :
                            activeStage === 3 ? "text-s3" :
                            "text-s4"
                          }`}>
                            0{activeStage}
                          </span>
                        </div>
                      </div>

                      {/* DECONSTRUCTION BLOCK (LIE VS TRUTH) */}
                      <div className="bg-white border border-sand-border rounded-2xl p-6 md:p-8 space-y-4 shadow-sm border-neutral-205">
                        <div className="flex items-center gap-1.5 text-neutral-500 pb-2 border-b border-neutral-100">
                          <ClipboardList className="w-4 h-4" />
                          <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                            Deconstrucción de Mentiras y Estructuras de Orgullo en el Líder
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* The Lie */}
                          <div className="bg-[#FFF6F3] border-l-4 border-s3 rounded-r-xl p-4 md:p-5 space-y-1.5">
                            <span className="text-[9px] font-bold text-s3 tracking-wider uppercase">
                              La mentira de autosuficiencia / El rol como identidad
                            </span>
                            <p className="text-sm text-ink font-serif leading-relaxed">
                              {route.etapas[activeStage - 1].mentira}
                            </p>
                          </div>

                          {/* The Truth */}
                          <div className="bg-[#F3FAF6] border-l-4 border-s2 rounded-r-xl p-4 md:p-5 space-y-1.5">
                            <span className="text-[9px] font-bold text-s2 tracking-wider uppercase">
                              La verdad protectora y sanadora del evangelio
                            </span>
                            <p className="text-sm text-ink font-serif leading-relaxed">
                              {route.etapas[activeStage - 1].verdad}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QUESTIONS AND TOOLS */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        
                        {/* Preguntas */}
                        <div className="bg-white border border-sand-border rounded-xl p-5 space-y-3 shadow-xs border-neutral-205">
                          <div className="flex items-center gap-1.5 text-neutral-500 border-b border-neutral-150 pb-2.5">
                            <HelpCircle className="w-4 h-4 text-gold shrink-0" />
                            <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                              Preguntas de Reflexión del Ministerio
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {route.etapas[activeStage - 1].preguntas.map((q, idx) => (
                              <div key={idx} className="flex gap-3 bg-sand/30 hover:bg-sand/60 transition-colors rounded-xl p-3 items-start border border-sand-border/30">
                                <span className="font-serif text-sm font-bold text-gold shrink-0 leading-none mt-0.5">
                                  0{idx + 1}
                                </span>
                                <p className="text-xs text-ink flex-1 leading-relaxed font-medium">
                                  {q}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Herramientas */}
                        <div className="bg-white border border-sand-border rounded-xl p-5 space-y-3 shadow-xs border-neutral-205">
                          <div className="flex items-center gap-1.5 text-neutral-500 border-b border-neutral-150 pb-2.5">
                            <Wrench className="w-4 h-4 text-gold shrink-0" />
                            <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                              Ejercicios Pastorales de Restauración
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {route.etapas[activeStage - 1].herramientas.map((h, idx) => {
                              const tool = getToolDetails(h, idx);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTool(tool);
                                    setIsToolModalOpen(true);
                                  }}
                                  className="group w-full text-left flex gap-2.5 border border-sand-border hover:border-[#C49A3C]/50 rounded-xl p-3 items-start bg-neutral-50/40 hover:bg-[#FDF3DF]/45 transition-all duration-250 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C49A3C]"
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 ${
                                    activeStage === 1 ? "bg-s1 bg-opacity-80 group-hover:scale-125" :
                                    activeStage === 2 ? "bg-s2 bg-opacity-80 group-hover:scale-125" :
                                    activeStage === 3 ? "bg-s3 bg-opacity-80 group-hover:scale-125" :
                                    "bg-s4 bg-opacity-80 group-hover:scale-125"
                                  } transition-transform`} />
                                  <div className="space-y-0.5 text-left flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[9px] font-bold text-ink-muted uppercase tracking-wider block">
                                        Dinámica pastoral {idx + 1}
                                      </span>
                                      <span className="text-[9px] text-[#6B4C11] font-semibold opacity-0 group-hover:opacity-100 transition-opacity font-sans flex items-center gap-1 select-none">
                                        <span>Ver guía</span>
                                        <span>→</span>
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-[#6B4C11] group-hover:text-amber-800 transition-colors truncate">
                                      {tool.nombre}
                                    </h4>
                                    <p className="text-[11px] text-ink-muted line-clamp-2 leading-relaxed">
                                      {tool.concepto}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* HOMEWORK */}
                      <div className="bg-gold-pale border border-[#EDDCBA] rounded-2xl p-6 md:p-8 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 text-[#6B4C11]">
                          <BookMarked className="w-5 h-5 shrink-0" />
                          <h3 className="text-xs font-bold tracking-wider uppercase text-[#6B4C11]">
                            Tarea de Arrepentimiento o Alianza en Familia
                          </h3>
                        </div>
                        <div className="border-t border-[#EDDCBA]/60 pt-3">
                          <p className="font-serif text-sm md:text-base leading-relaxed text-[#5C4210] italic">
                            "{route.etapas[activeStage - 1].tarea}"
                          </p>
                        </div>
                      </div>

                      {/* SCRIPTURAL CITATIONS ACCORDION */}
                      <div className="bg-white border border-sand-border rounded-2xl p-6 space-y-4 shadow-sm border-neutral-205">
                        <div className="flex items-center gap-1.5 text-neutral-500 border-b border-sand-border pb-3">
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                            Pasajes Consuelo del Obrero Afligido
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {route.etapas[activeStage - 1].pasajes.map((p, idx) => (
                            <div key={idx} className="bg-gold-pale/35 border border-gold-light/40 rounded-xl p-4 flex flex-col justify-between space-y-2">
                              <div>
                                <div className="font-serif text-sm font-bold text-amber-900 mb-1">
                                  {p.ref}
                                </div>
                                <p className="text-xs text-ink-soft leading-relaxed">
                                  {p.razon}
                                </p>
                              </div>
                              <div className="pt-2 text-right">
                                <span className="text-[9px] text-[#6B4C11] font-bold italic select-none">
                                  Paz e Identidad en Gracia
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* PREMIUM LEADERSHIP FOOTER NAV BUTTONS */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#DECFA9] gap-4">
                    <button
                      onClick={() => handleNavigateLiderTab("prev")}
                      disabled={liderTab === "base"}
                      className="px-4 py-2.5 rounded-lg border-1.5 border-sand-border bg-white text-ink-soft hover:bg-sand-dark transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Fase anterior
                    </button>
                    
                    <span className="text-[10px] font-bold text-[#6B4C11] tracking-widest uppercase font-mono bg-[#FAF3DF] px-3 py-1 rounded-full border border-orange-900/10">
                      Viendo: {
                        liderTab === "base" ? "DIAGNÓSTICO INICIAL" :
                        liderTab === "r1" ? "ETAPA 01 - REDEFINIR" :
                        liderTab === "r2" ? "ETAPA 02 - REENFOCAR" :
                        liderTab === "r3" ? "ETAPA 03 - RENDIR" :
                        liderTab === "r4" ? "ETAPA 04 - REESTRUCTURAR" :
                        "PLAN DE PREVENCIÓN"
                      }
                    </span>

                    <button
                      onClick={() => handleNavigateLiderTab("next")}
                      disabled={liderTab === "prev"}
                      className="px-4 py-2.5 rounded-lg border-none bg-[#6B4C11] text-gold-light hover:bg-[#523A0C] transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      Siguiente fase
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )
            )}

          </div>
        </main>

      </div>

      {/* SHARING MODAL DESIGN */}
      {isShareModalOpen && route && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs select-none">
          <div className="bg-white border border-sand-border rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-xl relative animate-fade-in">
            
            {/* Title / Close button */}
            <div className="flex items-center justify-between border-b border-sand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gold shrink-0" />
                <h3 className="font-serif text-base font-bold text-ink">
                  Compartir Expediente de Consejería
                </h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="text-ink-muted hover:text-ink hover:bg-sand-dark px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-ink-muted leading-relaxed">
                Utiliza las siguientes opciones para transferir o archivar los resultados pastorales de este análisis con tu equipo de consejeros o con el propio aconsejado.
              </p>

              {/* URL sharing block */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase block">
                  Enlace Directo de Restauración (Interactivo)
                </span>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={getShareableUrl()} 
                    className="flex-1 bg-sand/35 border-1.5 border-sand-border rounded-lg px-3 py-2 text-xs font-mono text-ink-muted select-all outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                      copySuccess 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-300" 
                        : "bg-ink text-gold-light hover:bg-[#2E2A1E] border border-transparent"
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-ink-soft">
                  Cualquier consejero que abra este enlace podrá importar y navegar interactivamente el expediente del aconsejado con sus 4 etapas y anotaciones.
                </p>
              </div>

              {/* Text / Social summary card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-ink-muted tracking-wider uppercase block">
                  Vista Previa del Resumen
                </span>
                <div className="bg-sand/20 border border-sand-border p-3.5 rounded-xl text-[11px] font-sans text-ink-soft space-y-1.5 max-h-[140px] overflow-y-auto italic whitespace-pre-line leading-relaxed">
                  {getTemplateSummary()}
                </div>
              </div>

              {/* Sharing platforms */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getTemplateSummary() + "\n\n🌐 Ver expediente en vivo: " + getShareableUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-1.5 border-sand-border bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-center transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.71 9.71 0 0 0-6.938-2.883C5.877 1.96 1.452 6.33 1.448 11.758c-.001 1.748.474 3.455 1.378 4.969l-.913 3.33 3.425-.898c1.554.85 3.013 1.258 4.719 1.259z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent("Expediente 4R: " + route.titulo)}&body=${encodeURIComponent(getTemplateSummary() + "\n\nConsúltalo interactivamente en:\n" + getShareableUrl())}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-1.5 border-sand-border bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-center transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Enviar por Correo</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DETAILED TOOL/DYNAMIC MODAL */}
      {isToolModalOpen && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs select-none">
          <div className="bg-white border-2 border-gold/30 rounded-2xl w-full max-w-xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-fade-in text-left">
            
            {/* Header Section */}
            <div className="p-5 border-b border-sand-border/60 bg-gradient-to-r from-gold-pale/35 to-transparent flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-pale flex items-center justify-center text-gold shrink-0 border border-gold-light/40 mt-0.5">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-gold uppercase block">
                    {mode === "gen" ? `Herramienta de la Etapa 0${activeStage}` : `Dinámica de Acompañamiento`}
                  </span>
                  <h3 className="font-serif text-lg md:text-xl font-bold text-ink leading-snug animate-fade-in">
                    {selectedTool.nombre}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsToolModalOpen(false);
                  setSelectedTool(null);
                }}
                className="text-ink-muted hover:text-ink hover:bg-sand-dark px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0"
              >
                Cerrar
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Concept Section ("Qué es") */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black tracking-widest text-[#6B4C11] uppercase flex items-center gap-1.5 font-sans">
                  <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>¿Qué es y cuál es su objetivo?</span>
                </h4>
                <div className="bg-[#FAF7F1] border-l-4 border-[#C49A3C]/85 rounded-r-xl p-4">
                  <p className="font-serif text-sm md:text-base leading-relaxed text-ink-soft italic">
                    "{selectedTool.concepto}"
                  </p>
                </div>
              </div>

              {/* Instructions Section ("Cómo se realiza") */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black tracking-widest text-[#2E6B4E] uppercase flex items-center gap-1.5 font-sans">
                  <ClipboardList className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>¿Cómo se realiza la dinámica?</span>
                </h4>
                <div className="bg-[#F3FAF6] border-l-4 border-emerald-500 rounded-r-xl p-4">
                  <p className="text-xs md:text-sm text-ink-soft leading-relaxed space-y-2.5 font-sans whitespace-pre-line">
                    {selectedTool.instrucciones}
                  </p>
                </div>
              </div>

              {/* Bibliographic / Spiritual Context Advice */}
              <div className="border border-gold-light/40 bg-gold-pale/20 rounded-xl p-4 flex gap-3 text-xs text-ink-muted/90 items-start leading-relaxed shadow-xs">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <p>
                  <strong className="text-ink-soft font-bold block mb-1">Guía para el Consejero o Líder:</strong>
                  Adapte esta herramienta al ritmo emocional del aconsejado. Asegúrese de que no se convierta en una exigencia legalista, sino en un canal para contemplar la gracia trasformadora de Cristo en su debilidad.
                </p>
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-sand/35 border-t border-sand-border/40 flex justify-end">
              <button 
                onClick={() => {
                  setIsToolModalOpen(false);
                  setSelectedTool(null);
                }}
                className="px-5 py-2.5 bg-ink text-gold-light hover:bg-[#2A261A] font-semibold text-xs rounded-xl cursor-pointer transition-all shadow-sm"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
