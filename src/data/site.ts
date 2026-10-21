export const site = {
  name: "Kalil Maciel Pock",
  handle: "KalilPock",
  title: "Kalil Maciel Pock — Desenvolvedor Full Stack",
  description:
    "Portfólio de Kalil Maciel Pock, desenvolvedor full stack em Curitiba. Node.js, Astro, Java e Supabase; professor de back-end e banco de dados na SEED-PR.",
  url: "https://kalilpock.github.io",
  locale: "pt-BR",
  location: "Curitiba, PR",
  email: "kalilpock54@gmail.com",
  links: {
    github: "https://github.com/KalilPock",
    linkedin: "https://www.linkedin.com/in/kalilpock",
  },
  hero: {
    kicker: "desenvolvedor full stack · curitiba",
    tagline:
      "Desenvolvo aplicações web de ponta a ponta — do back-end em Node.js e Java à interface em Astro.",
    secondary:
      "Sou autônomo, professor no ensino técnico e mantenho um homelab com Pi-hole e o back-end dos meus projetos.",
    chips: [
      "java · node.js · astro",
      "react native · kotlin · supabase",
      "linux · docker · homelab",
    ],
  },
  about: {
    paragraphs: [
      "Sou Kalil Maciel Pock, desenvolvedor full stack em Curitiba. Trabalho de forma autônoma construindo aplicações com Node.js, Astro, Java, Kotlin, React Native e Supabase.",
      "Também sou professor no Ensino Médio Técnico em Sistemas, ofertado pela SEED-PR, com as disciplinas de back-end e banco de dados. Ensinar me obriga a explicar o porquê das escolhas técnicas — e isso melhora o que eu construo.",
      "Tenho um homelab onde rodo o Pi-hole em Docker e hospedo o back-end dos meus projetos. É onde testo infraestrutura e venho estudando cloud e DevOps.",
    ],
    facts: [
      { label: "Atuação", value: "Desenvolvedor full stack autônomo" },
      {
        label: "Formação",
        value:
          "Análise e Desenvolvimento de Sistemas — Universidade Positivo",
      },
      { label: "Ensino", value: "Ensino Médio Técnico em Sistemas — SEED-PR" },
      { label: "Local", value: "Curitiba, PR" },
      { label: "Interesses", value: "Infraestrutura, cloud e DevOps" },
    ],
  },
  nav: [
    { label: "Sobre", href: "#sobre" },
    { label: "Stack", href: "#stack" },
    { label: "Projetos", href: "#projetos" },
    { label: "Ensino", href: "#ensino" },
    { label: "Contato", href: "#contato" },
  ],
} as const;

export type Site = typeof site;
