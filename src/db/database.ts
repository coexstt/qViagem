import * as SQLite from "expo-sqlite";

export type Budget = "Econômico" | "Médio" | "Luxo";
export type TravelStyle = "Aventura" | "Cultural" | "Relaxar" | "Família";
export type Period = "manha" | "tarde" | "noite";
export type ItinerarySource = "ai" | "user";

export type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  budget: Budget | null;
  style: TravelStyle | null;
};

export type ItineraryItem = {
  id: number;
  tripId: number;
  dayIndex: number;
  period: Period;
  position: number;
  title: string;
  description: string;
  source: ItinerarySource;
};

type TripRow = {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
  budget: Budget | null;
  style: TravelStyle | null;
};

type ItineraryItemRow = {
  id: number;
  trip_id: number;
  day_index: number;
  period: Period;
  position: number;
  title: string;
  description: string;
  source: ItinerarySource;
};

const db = SQLite.openDatabaseSync("qviagem.db");

function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    budget: row.budget,
    style: row.style,
  };
}

function toItineraryItem(row: ItineraryItemRow): ItineraryItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    dayIndex: row.day_index,
    period: row.period,
    position: row.position,
    title: row.title,
    description: row.description,
    source: row.source,
  };
}

function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`);
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
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
  addColumnIfMissing("trips", "budget", "TEXT");
  addColumnIfMissing("trips", "style", "TEXT");

  db.execSync(`
    CREATE TABLE IF NOT EXISTS itinerary_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      day_index INTEGER NOT NULL,
      period TEXT NOT NULL CHECK (period IN ('manha', 'tarde', 'noite')),
      position INTEGER NOT NULL DEFAULT 0,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'user')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS place_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      narrative TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(lang, title)
    );
  `);
}

// Cache de narrativas do Guia Local: evita chamar o Gemini de novo para um
// lugar que já foi "transformado" antes, para economizar a cota gratuita.
export function getCachedNarrative(lang: string, title: string): string | null {
  const row = db.getFirstSync<{ narrative: string }>(
    "SELECT narrative FROM place_stories WHERE lang = ? AND title = ?",
    lang,
    title
  );
  return row?.narrative ?? null;
}

export function saveNarrative(lang: string, title: string, narrative: string): void {
  db.runSync(
    `INSERT INTO place_stories (lang, title, narrative) VALUES (?, ?, ?)
     ON CONFLICT(lang, title) DO UPDATE SET narrative = excluded.narrative`,
    lang,
    title,
    narrative
  );
}

export function getAllTrips(): Trip[] {
  const rows = db.getAllSync<TripRow>(
    "SELECT * FROM trips ORDER BY start_date ASC"
  );
  return rows.map(toTrip);
}

export function getTripById(id: number): Trip | null {
  const row = db.getFirstSync<TripRow>("SELECT * FROM trips WHERE id = ?", id);
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

export function updateTripPreferences(
  tripId: number,
  budget: Budget,
  style: TravelStyle
): void {
  db.runSync(
    "UPDATE trips SET budget = ?, style = ? WHERE id = ?",
    budget,
    style,
    tripId
  );
}

const PERIOD_ORDER: Record<Period, number> = { manha: 0, tarde: 1, noite: 2 };

export function getItineraryForTrip(tripId: number): ItineraryItem[] {
  const rows = db.getAllSync<ItineraryItemRow>(
    "SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day_index ASC, position ASC",
    tripId
  );
  return rows
    .map(toItineraryItem)
    .sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      if (a.period !== b.period) return PERIOD_ORDER[a.period] - PERIOD_ORDER[b.period];
      return a.position - b.position;
    });
}

function nextPosition(tripId: number, dayIndex: number, period: Period): number {
  const row = db.getFirstSync<{ maxPosition: number | null }>(
    "SELECT MAX(position) as maxPosition FROM itinerary_items WHERE trip_id = ? AND day_index = ? AND period = ?",
    tripId,
    dayIndex,
    period
  );
  const max = row?.maxPosition;
  return max === null || max === undefined ? 0 : max + 1;
}

export type NewItineraryItem = {
  dayIndex: number;
  period: Period;
  title: string;
  description: string;
};

export function insertGeneratedItems(
  tripId: number,
  items: NewItineraryItem[]
): void {
  for (const item of items) {
    const position = nextPosition(tripId, item.dayIndex, item.period);
    db.runSync(
      "INSERT INTO itinerary_items (trip_id, day_index, period, position, title, description, source) VALUES (?, ?, ?, ?, ?, ?, 'ai')",
      tripId,
      item.dayIndex,
      item.period,
      position,
      item.title,
      item.description
    );
  }
}

export function insertManualItem(
  tripId: number,
  dayIndex: number,
  period: Period,
  title: string,
  description: string
): void {
  const position = nextPosition(tripId, dayIndex, period);
  db.runSync(
    "INSERT INTO itinerary_items (trip_id, day_index, period, position, title, description, source) VALUES (?, ?, ?, ?, ?, ?, 'user')",
    tripId,
    dayIndex,
    period,
    position,
    title,
    description
  );
}

export function updateItemContent(
  id: number,
  title: string,
  description: string
): void {
  db.runSync(
    "UPDATE itinerary_items SET title = ?, description = ? WHERE id = ?",
    title,
    description,
    id
  );
}

export function deleteItem(id: number): void {
  db.runSync("DELETE FROM itinerary_items WHERE id = ?", id);
}

export function moveItem(item: ItineraryItem, direction: "up" | "down"): void {
  const comparator = direction === "up" ? "<" : ">";
  const order = direction === "up" ? "DESC" : "ASC";
  const neighbor = db.getFirstSync<ItineraryItemRow>(
    `SELECT * FROM itinerary_items
     WHERE trip_id = ? AND day_index = ? AND period = ? AND position ${comparator} ?
     ORDER BY position ${order} LIMIT 1`,
    item.tripId,
    item.dayIndex,
    item.period,
    item.position
  );
  if (!neighbor) return;

  db.runSync("UPDATE itinerary_items SET position = ? WHERE id = ?", neighbor.position, item.id);
  db.runSync("UPDATE itinerary_items SET position = ? WHERE id = ?", item.position, neighbor.id);
}
