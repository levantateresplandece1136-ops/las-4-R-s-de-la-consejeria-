export interface CaseExample {
  title: string;
  problema: string;
  context: string[];
  etapa: string;
}

export const CASE_EXAMPLES: CaseExample[] = [
  {
    title: "Ejemplo: Crisis Matrimonial",
    problema: "Mi cónyuge y yo estamos en una crisis muy grave. Ya no nos hablamos de forma civilizada, cada conversación explota en reproches sobre cosas de hace diez años. Nos dormimos en habitaciones separadas y sentimos que el amor 'murió' del todo. La desconfianza espiritual y laboral es total.",
    context: ["Matrimonio", "Ira", "Crisis aguda"],
    etapa: "1"
  },
  {
    title: "Ejemplo: Ansiedad y Control",
    problema: "Experimento una ansiedad que me consume y asaltos de temor casi diarios por el futuro financiero y laboral. No puedo consiliar el sueño pensando constantemente en qué pasará si cometo un error grave y pierdo mi empleo, lo cual considero que destruiría a mi familia.",
    context: ["Ansiedad", "Temor", "Laboral"],
    etapa: "2"
  },
  {
    title: "Ejemplo: Escape Oculto",
    problema: "Llevo meses refugiado en la pornografía y compras compulsivas como vía de escape al estrés diario. Trato de actuar bien en la iglesia, pero me ahoga la culpa, la vergüenza y el miedo de ser descubierto. Me cuesta creer que la gracia de Dios pueda restaurarme.",
    context: ["Pornografía", "Adicción", "Identidad"],
    etapa: "3"
  }
];
