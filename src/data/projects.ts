export type ProjectCategory = "fullstack" | "homelab" | "ci-cd";

export interface Project {
  title: string;
  summary: string;
  category: ProjectCategory;
  tags: string[];
  repo?: string;
  demo?: string;
  status?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: "Isótopos",
    summary:
      "Sistema de anotações em nuvem com arquitetura MVC. Back-end em Node.js com middlewares de autenticação, front em Astro + Tailwind e dados no Supabase (PostgreSQL). Front na Netlify e back-end no meu homelab.",
    category: "fullstack",
    tags: ["Node.js", "Astro", "Tailwind", "Supabase", "MVC"],
    repo: "https://github.com/KalilPock/Isotopos",
    demo: "https://isotopo.netlify.app/login/",
    status: "no ar",
    featured: true,
  },
  {
    title: "Homelab",
    summary:
      "Servidor local onde rodo o Pi-hole, em Docker, e hospedo o back-end dos meus projetos.",
    category: "homelab",
    tags: ["Linux", "Docker", "Pi-hole"],
    featured: true,
  },
  {
    title: "Pipeline CI/CD",
    summary: "Pipeline com GitHub Actions para build e deploy automáticos.",
    category: "ci-cd",
    tags: ["GitHub Actions", "Docker", "Git"],
    status: "em andamento",
  },
];
