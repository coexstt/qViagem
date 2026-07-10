import * as SQLite from "expo-sqlite";

export type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
};

type TripRow = {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

const db = SQLite.openDatabaseSync("qviagem.db");

function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  };
}

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getAllTrips(): Trip[] {
  const rows = db.getAllSync<TripRow>(
    "SELECT * FROM trips ORDER BY start_date ASC"
  );
  return rows.map(toTrip);
}

export function getTripById(id: number): Trip | null {
  const row = db.getFirstSync<TripRow>(
    "SELECT * FROM trips WHERE id = ?",
    id
  );
  return row ? toTrip(row) : null;
}

export function insertTrip(
  destination: string,
  startDate: string,
  endDate: string
): number {
  const result = db.runSync(
    "INSERT INTO trips (destination, start_date, end_date) VALUES (?, ?, ?)",
    destination,
    startDate,
    endDate
  );
  return result.lastInsertRowId;
}
