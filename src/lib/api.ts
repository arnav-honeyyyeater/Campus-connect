import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode = "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "INTERNAL_SERVER_ERROR";

export class ApiException extends Error {
  constructor(public readonly status: number, public readonly code: ErrorCode, message: string, public readonly fieldErrors?: Record<string, string[]>) {
    super(message);
  }
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid request.", fieldErrors: error.flatten().fieldErrors } }, { status: 400 });
  }
  if (error instanceof ApiException) {
    return NextResponse.json({ error: { code: error.code, message: error.message, fieldErrors: error.fieldErrors } }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred." } }, { status: 500 });
}

export function noStoreJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...init?.headers, "Cache-Control": "no-store" } });
}
