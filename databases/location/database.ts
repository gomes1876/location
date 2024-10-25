import * as SQLite from "expo-sqlite";

// Definição do tipo para a localização
export type Location = {
  latitude: number;
  longitude: number;
  timestamp?: string;
};

// Inicializa o banco de dados
let db: any; // Podemos usar 'any' aqui para evitar erros de tipagem

export const initializeDatabase = async (): Promise<void> => {
  db = await SQLite.openDatabaseAsync("locations.db");
};

// Função para criar a tabela que vai armazenar uma única localização
export const createTable = async (): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS location (
      id INTEGER PRIMARY KEY, 
      latitude REAL, 
      longitude REAL, 
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// Função para salvar ou atualizar a localização
export const saveLocation = async (
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    const result = await db.runAsync(
      "REPLACE INTO location (id, latitude, longitude, timestamp) values (1, ?, ?, CURRENT_TIMESTAMP);",
      [latitude, longitude]
    );
    console.log("Localização salva/atualizada:", result);
  } catch (error) {
    console.log("Erro ao salvar localização:", error);
  }
};

// Função para buscar a última localização salva
export const getSavedLocation = async (
  callback: (location: Location | null) => void
): Promise<void> => {
  try {
    const rows = await db.getAllAsync(
      "SELECT latitude, longitude, timestamp FROM location WHERE id = 1;"
    );
    if (rows.length > 0) {
      const location: Location = rows[0];
      console.log("Última localização salva:", location);
      callback(location);
    } else {
      console.log("Nenhuma localização salva.");
      callback(null);
    }
  } catch (error) {
    console.log("Erro ao buscar última localização:", error);
    callback(null);
  }
};
