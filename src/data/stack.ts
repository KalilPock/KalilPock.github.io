export interface StackGroup {
  title: string;
  blurb: string;
  items: string[];
}

export const stack: StackGroup[] = [
  {
    title: "Linguagens & back-end",
    blurb: "O que uso para construir serviços.",
    items: ["Java", "Node.js", "JavaScript", "PostgreSQL", "Supabase"],
  },
  {
    title: "Front-end & mobile",
    blurb: "Interfaces web e aplicativos.",
    items: ["Astro", "Tailwind", "HTML", "CSS", "React Native", "Kotlin"],
  },
  {
    title: "Infra & ferramentas",
    blurb: "O ambiente onde tudo roda.",
    items: ["Linux", "Docker", "Git"],
  },
  {
    title: "Estudando",
    blurb: "O que estou aprendendo agora.",
    items: ["GitHub Actions", "Infraestrutura & cloud", "DevOps"],
  },
];
