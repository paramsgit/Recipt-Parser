import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";

export type ReceiptParseRow = {
  id: string;
  filename: string;
  modelResponse: unknown;
  createdAt: string;
  updatedAt: string | null;
};

type SqlState = {
  db: SqlJsDatabase;
  dbFilePath: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __receiptSqlState: SqlState | undefined;
  // eslint-disable-next-line no-var
  var __receiptSqlWriteChain: Promise<unknown> | undefined;
  // eslint-disable-next-line no-var
  var __receiptSqlInit: Promise<SqlState> | undefined;
}

function getDbFilePath() {
  return path.join(process.cwd(), "data", "receipts.sqlite");
}

async function ensureDirExists(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function loadOrCreateDb(): Promise<SqlState> {
  if (globalThis.__receiptSqlState) return globalThis.__receiptSqlState;
  if (globalThis.__receiptSqlInit) return globalThis.__receiptSqlInit;

  globalThis.__receiptSqlInit = (async () => {
    const dbFilePath = getDbFilePath();
    await ensureDirExists(dbFilePath);

    const SQL = await initSqlJs({
      locateFile: (file) =>
        path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });

    let db: SqlJsDatabase;
    try {
      const file = await fs.readFile(dbFilePath);
      db = new SQL.Database(file);
    } catch {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS receipt_parses (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        model_response TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);

    // Backwards-compatible migration for older DBs.
    try {
      db.run(`ALTER TABLE receipt_parses ADD COLUMN updated_at TEXT;`);
    } catch {
      // Column already exists (or SQLite doesn't need migration).
    }

    const state: SqlState = { db, dbFilePath };
    globalThis.__receiptSqlState = state;
    globalThis.__receiptSqlWriteChain ??= Promise.resolve();
    return state;
  })();

  return globalThis.__receiptSqlInit;
}

async function persistDb(state: SqlState) {
  const exported = state.db.export();
  await fs.writeFile(state.dbFilePath, Buffer.from(exported));
}

function rowFromSelect(res: ReturnType<SqlJsDatabase["exec"]>): ReceiptParseRow | null {
  const first = res[0];
  if (!first) return null;
  const idx = new Map(first.columns.map((c, i) => [c, i]));
  const v = first.values[0];
  if (!v) return null;

  const modelResponseRaw = v[idx.get("model_response") ?? -1];
  const modelResponse =
    typeof modelResponseRaw === "string" ? safeJsonParse(modelResponseRaw) : null;

  return {
    id: String(v[idx.get("id") ?? -1]),
    filename: String(v[idx.get("filename") ?? -1]),
    modelResponse,
    createdAt: String(v[idx.get("created_at") ?? -1]),
    updatedAt:
      v[idx.get("updated_at") ?? -1] === null ||
      typeof v[idx.get("updated_at") ?? -1] === "undefined"
        ? null
        : String(v[idx.get("updated_at") ?? -1]),
  };
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function storeReceiptParse(args: {
  id: string;
  filename: string;
  modelResponse: unknown;
  createdAt: string;
}): Promise<ReceiptParseRow> {
  const state = await loadOrCreateDb();

  const run = async () => {
    const modelResponseJson = JSON.stringify(args.modelResponse);
    state.db.run(
      `INSERT INTO receipt_parses (id, filename, model_response, created_at)
       VALUES (?, ?, ?, ?)`,
      [args.id, args.filename, modelResponseJson, args.createdAt],
    );

    await persistDb(state);

    return {
      id: args.id,
      filename: args.filename,
      modelResponse: args.modelResponse,
      createdAt: args.createdAt,
      updatedAt: null,
    };
  };

  globalThis.__receiptSqlWriteChain ??= Promise.resolve();
  globalThis.__receiptSqlWriteChain = globalThis.__receiptSqlWriteChain.then(
    run,
    run,
  );

  return globalThis.__receiptSqlWriteChain as Promise<ReceiptParseRow>;
}

export async function updateReceiptParse(args: {
  id: string;
  modelResponse: unknown;
  updatedAt: string;
}): Promise<ReceiptParseRow | null> {
  const state = await loadOrCreateDb();

  const run = async () => {
    const modelResponseJson = JSON.stringify(args.modelResponse);
    state.db.run(
      `UPDATE receipt_parses
       SET model_response = ?, updated_at = ?
       WHERE id = ?`,
      [modelResponseJson, args.updatedAt, args.id],
    );

    const selected = state.db.exec(
      `SELECT id, filename, model_response, created_at, updated_at
       FROM receipt_parses
       WHERE id = ?
       LIMIT 1`,
      [args.id],
    );

    await persistDb(state);
    return rowFromSelect(selected);
  };

  globalThis.__receiptSqlWriteChain ??= Promise.resolve();
  globalThis.__receiptSqlWriteChain = globalThis.__receiptSqlWriteChain.then(
    run,
    run,
  );

  return globalThis.__receiptSqlWriteChain as Promise<ReceiptParseRow | null>;
}
