"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { sendCodeAction } from "../actions";
import { idleState } from "../formState";
import { US_NUMBER_LENGTH, formatUsNumber, toSubscriberDigits } from "./phoneFormat";

/**
 * The screen shows a US number the way people write it - "(312) 555-0192" behind
 * a fixed +1 - while modules/auth/schema.ts requires E.164. The hidden field is
 * the join: what the person reads and what the domain parses, from one value.
 */
export function PhoneForm() {
  const [state, action, pending] = useActionState(sendCodeAction, idleState);
  const [digits, setDigits] = useState("");

  const complete = digits.length === US_NUMBER_LENGTH;

  return (
    <form action={action} noValidate className="w-full space-y-5">
      <input type="hidden" name="phone" value={`+1${digits}`} />

      <div className="space-y-3.5">
        <Field
          id="phone-display"
          type="tel"
          inputMode="numeric"
          label="Mobile Number"
          prefix="+1"
          placeholder="(555) 000-0000"
          autoComplete="tel-national"
          value={formatUsNumber(digits)}
          onChange={(event) => setDigits(toSubscriberDigits(event.target.value))}
          required
        />
      </div>

      <FormMessage status={state.status} message={state.message} />

      <div className="mt-4 w-full">
        <Button type="submit" disabled={pending || !complete}>
          {pending ? "Sending…" : "Request Access Passcode"}
        </Button>
      </div>
    </form>
  );
}
