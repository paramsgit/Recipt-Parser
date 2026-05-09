import { createClient, type Client } from "@libsql/client";

export type ReceiptParseRow = {
  id: string;
  filename: string;
  modelResponse: unknown;
  createdAt: string;
  updatedAt: string | null;
};

type SqlState = { client: Client };

declare global {
  // eslint-disable-next-line no-var
  var __receiptSqlState: SqlState | undefined;
  // eslint-disable-next-line no-var
  var __receiptSqlWriteChain: Promise<unknown> | undefined;
  // eslint-disable-next-line no-var
  var __receiptSqlInit: Promise<SqlState> | undefined;
}

function getDbUrl(): string {
  return (
    process.env.TURSO_DATABASE_URL ??
    process.env.LIBSQL_DATABASE_URL ??
    "libsql://receipt-afsarbande002.aws-ap-south-1.turso.io"
  );
}

function getAuthToken(): string | undefined {
  return process.env.TURSO_AUTH_TOKEN ?? process.env.LIBSQL_AUTH_TOKEN;
}

async function loadOrCreateDb(): Promise<SqlState> {
  if (globalThis.__receiptSqlState) return globalThis.__receiptSqlState;
  if (globalThis.__receiptSqlInit) return globalThis.__receiptSqlInit;

  globalThis.__receiptSqlInit = (async () => {
    const client = createClient({
      url: getDbUrl(),
      authToken: getAuthToken(),
    });

    await client.execute(`
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
      await client.execute(`ALTER TABLE receipt_parses ADD COLUMN updated_at TEXT;`);
    } catch {
      // Column already exists.
    }

    const state: SqlState = { client };
    globalThis.__receiptSqlState = state;
    globalThis.__receiptSqlWriteChain ??= Promise.resolve();
    return state;
  })();

  return globalThis.__receiptSqlInit;
}

function getRowValue(row: unknown, key: string): unknown {
  if (!row || typeof row !== "object") return undefined;
  return (row as Record<string, unknown>)[key];
}

function rowFromSelect(rows: Array<Record<string, unknown>>): ReceiptParseRow | null {
  const row = rows[0];
  if (!row) return null;

  const modelResponseRaw = getRowValue(row, "model_response");
  const modelResponse =
    typeof modelResponseRaw === "string" ? safeJsonParse(modelResponseRaw) : null;

  const updatedAtRaw = getRowValue(row, "updated_at");
  const updatedAt =
    updatedAtRaw === null || typeof updatedAtRaw === "undefined"
      ? null
      : String(updatedAtRaw);

  return {
    id: String(getRowValue(row, "id")),
    filename: String(getRowValue(row, "filename")),
    modelResponse,
    createdAt: String(getRowValue(row, "created_at")),
    updatedAt,
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
    await state.client.execute({
      sql: `INSERT INTO receipt_parses (id, filename, model_response, created_at)
            VALUES (?, ?, ?, ?)`,
      args: [args.id, args.filename, modelResponseJson, args.createdAt],
    });

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
    await state.client.execute({
      sql: `UPDATE receipt_parses
            SET model_response = ?, updated_at = ?
            WHERE id = ?`,
      args: [modelResponseJson, args.updatedAt, args.id],
    });

    const selected = await state.client.execute({
      sql: `SELECT id, filename, model_response, created_at, updated_at
            FROM receipt_parses
            WHERE id = ?
            LIMIT 1`,
      args: [args.id],
    });

    return rowFromSelect(selected.rows as Array<Record<string, unknown>>);
  };

  globalThis.__receiptSqlWriteChain ??= Promise.resolve();
  globalThis.__receiptSqlWriteChain = globalThis.__receiptSqlWriteChain.then(
    run,
    run,
  );

  return globalThis.__receiptSqlWriteChain as Promise<ReceiptParseRow | null>;
}
