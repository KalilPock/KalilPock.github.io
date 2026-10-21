export interface TeachingInfo {
  title: string;
  description: string;
  paragraphs: string[];
  topics: string[];
}

export const teaching: TeachingInfo = {
  title: "Ensino back-end e banco de dados",
  description: "Aulas no Ensino Médio Técnico em Sistemas, pela SEED-PR.",
  paragraphs: [
    "Sou professor no Ensino Médio Técnico em Sistemas, ofertado pela SEED-PR, com as disciplinas de back-end e banco de dados.",
    "Ensinar me obriga a explicar o porquê das escolhas técnicas — e isso melhora o que eu construo.",
  ],
  topics: ["Back-end", "Banco de dados", "Node.js"],
};
