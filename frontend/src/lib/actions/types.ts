import type { FieldErrors } from "@/lib/api/errors";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  /** يتغير مع كل استجابة حتى تظهر نفس الرسالة مرة أخرى عند التكرار */
  at?: number;
};

export const idleState: ActionState = { status: "idle" };
