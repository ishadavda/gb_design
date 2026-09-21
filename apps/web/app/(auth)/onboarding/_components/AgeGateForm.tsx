"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { FormMessage } from "@/shared/ui/FormMessage";
import { Icon } from "@/shared/ui/Icon";
import { confirmAgeAction } from "../actions";
import { idleState } from "../formState";

/**
 * A CLIENT COMPONENT - it needs "use client" because it has an input and pending
 * state, neither of which exists on the server.
 *
 * What it does NOT do: fetch anything, import Supabase, or decide anything. It
 * calls a Server Action and renders what comes back. There is no useEffect and no
 * API call in this file.
 *
 * useActionState gives you three things:
 *   state   - whatever the action returned last time
 *   action  - hand this straight to <form action={...}>
 *   pending - true while it is in flight
 */
export function AgeGateForm() {
  const [state, action, pending] = useActionState(confirmAgeAction, idleState);
  const [dobError, setDobError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const validationMessage = getDateValidationMessage(dateOfBirth);
    if (validationMessage) {
      event.preventDefault();
      setDobError(validationMessage);
      return;
    }

    setDobError("");
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(event.target.value);
    setDateOfBirth(formatted);
    if (dobError) setDobError("");
  };


  const currentStatus = dobError ? "error" : state.status;
  const currentMessage = dobError || state.message;

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="w-full space-y-4">
      <input type="hidden" name="dateOfBirth" value={toIsoDate(dateOfBirth)} />
      <div className="space-y-1.5">
        <label
          htmlFor="dateOfBirth"
          className="block text-[11px] font-bold uppercase tracking-wider text-slate"
        >
          Date of Birth
        </label>
        <div className="relative">
          <DateInputMask value={dateOfBirth} />
          <input
            id="dateOfBirth"
            name="dateOfBirthDisplay"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            placeholder=""
            value={dateOfBirth}
            onChange={handleChange}
            maxLength={10}
            aria-invalid={Boolean(dobError)}
            required
            className="relative z-10 w-full rounded-xl border border-border-light bg-transparent px-4 py-3.5 pr-11 text-sm font-semibold text-transparent caret-navy transition focus:border-cta-green focus:outline-none"
          />
          <Icon
            name="calendar"
            className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-navy"
          />
        </div>
      </div>

      <FormMessage status={currentStatus} message={currentMessage} />

      <div className="mt-2 w-full">
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Confirm Age & Proceed"}
        </Button>
      </div>
    </form>
  );
}

function DateInputMask({ value }: { value: string }) {
  const digits = value.replace(/\D/g, "");
  const segments = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  const separators = ["/", "/"];
  const placeholders = ["mm", "dd", "yyyy"];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center px-4 pr-11 text-sm font-semibold">
      {placeholders.map((placeholder, index) => (
        <span key={placeholder} className={segments[index] ? "text-navy" : "text-slate/60"}>
          {segments[index] || placeholder}
          {index < separators.length && <span className="text-slate/60">{separators[index]}</span>}
        </span>
      ))}
    </div>
  );
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isCompleteDate(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function getDateValidationMessage(value: string): string {
  if (!value) return "Please enter your date of birth.";
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return "Enter your date of birth in MM/DD/YYYY format.";
  }
  if (!isCompleteDate(value)) return "Enter a valid date of birth.";
  return "";
}

function toIsoDate(value: string): string {
  if (!isCompleteDate(value)) return "";
  const [month, day, year] = value.split("/");
  return `${year}-${month}-${day}`;
}
