import { drizzle } from "drizzle-orm/mysql2";
import { serviceCategories, neighborhoods } from "./drizzle/schema.js";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Seeding database...");

  // Categories with synonyms for NLP search
  const categoriesData = [
    {
      name: "Eletricista",
      description: "Serviços de instalação e manutenção elétrica",
      icon: "Zap",
      synonyms: JSON.stringify(["eletricidade", "fiação", "luz", "energia"]),
    },
    {
      name: "Encanador",
      description: "Serviços de encanamento e hidráulica",
      icon: "Droplet",
      synonyms: JSON.stringify(["bombeiro", "hidráulica", "cano", "água"]),
    },
    {
      name: "Pedreiro",
      description: "Serviços de alvenaria e construção",
      icon: "Hammer",
      synonyms: JSON.stringify(["construção", "alvenaria", "obra", "reforma"]),
    },
    {
      name: "Pintor",
      description: "Serviços de pintura e acabamento",
      icon: "Palette",
      synonyms: JSON.stringify(["pintura", "tinta", "acabamento"]),
    },
    {
      name: "Carpinteiro",
      description: "Serviços de carpintaria e marcenaria",
      icon: "Hammer2",
      synonyms: JSON.stringify(["marcenaria", "madeira", "móvel", "porta"]),
    },
    {
      name: "Diarista",
      description: "Serviços de limpeza e faxina",
      icon: "Broom",
      synonyms: JSON.stringify(["limpeza", "faxina", "limpador", "faxineira"]),
    },
    {
      name: "Professor Particular",
      description: "Aulas particulares e reforço escolar",
      icon: "BookOpen",
      synonyms: JSON.stringify(["aula", "professor", "reforço", "educação"]),
    },
    {
      name: "Motoboy",
      description: "Serviços de entrega e transporte",
      icon: "Bike",
      synonyms: JSON.stringify(["entrega", "transporte", "moto", "courier"]),
    },
    {
      name: "Mecânico",
      description: "Serviços de manutenção e reparo de veículos",
      icon: "Wrench",
      synonyms: JSON.stringify(["carro", "moto", "reparo", "manutenção"]),
    },
    {
      name: "Cabeleireiro",
      description: "Serviços de corte e tratamento capilar",
      icon: "Scissors",
      synonyms: JSON.stringify(["cabelo", "corte", "cabelereiro", "salão"]),
    },
  ];

  // Neighborhoods in Alenquer
  const neighborhoodsData = [
    "Centro",
    "Bairro da Paz",
    "Bairro do Rosário",
    "Bairro Novo",
    "Igarapé Mirim",
    "Igarapé Preto",
    "Jauari",
    "Paricatuba",
    "Prainha",
    "Ramal do Pau d'Arco",
  ];

  try {
    // Insert categories
    console.log("Inserting categories...");
    for (const cat of categoriesData) {
      await db.insert(serviceCategories).values(cat).catch((err) => {
        if (err.code !== "ER_DUP_ENTRY") throw err;
      });
    }
    console.log(`✓ ${categoriesData.length} categories inserted`);

    // Insert neighborhoods
    console.log("Inserting neighborhoods...");
    for (const neighborhood of neighborhoodsData) {
      await db
        .insert(neighborhoods)
        .values({ name: neighborhood })
        .catch((err) => {
          if (err.code !== "ER_DUP_ENTRY") throw err;
        });
    }
    console.log(`✓ ${neighborhoodsData.length} neighborhoods inserted`);

    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
