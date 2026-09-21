"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { createProfileAction } from "../actions";
import { idleState } from "../formState";

/**
 * The approved screen collects first name, last name, email and zip.
 *
 * Only the name reaches the domain: CreateAccountSchema takes a single
 * `displayName`, so the two name boxes are joined into the hidden field the
 * action parses. Email and zip are rendered but NOT stored - persisting them
 * needs a column, a migration and a schema change, which is outside this UI
 * pass. Wire them up before this flow goes in front of real users.
 */
export function ProfileForm() {
  const [state, action, pending] = useActionState(createProfileAction, idleState);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");
  const [nameError, setNameError] = useState("");

  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!firstName.trim()) {
      event.preventDefault();
      setNameError("Please enter your first name!");
      return;
    }
    setNameError("");
  };

  const currentStatus = nameError ? "error" : state.status;
  const currentMessage = nameError || state.message;

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="w-full space-y-4">
      <input type="hidden" name="displayName" value={displayName} />

      <div className="space-y-3.5">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Field
              id="firstName"
              label="First Name"
              placeholder="e.g. Claire"
              autoComplete="given-name"
              maxLength={30}
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                setNameError("");
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Field
              id="lastName"
              label="Last Name"
              placeholder="e.g. Henderson"
              autoComplete="family-name"
              maxLength={30}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
        </div>

        <Field
          id="email"
          type="email"
          label="Email Address"
          placeholder="e.g. claire@example.com"
          autoComplete="email"
        />

        <Field
          id="zip"
          name="zip"
          label="Zip Code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="e.g. 60601"
          autoComplete="postal-code"
          value={zip}
          onChange={(event) => setZip(event.target.value.replace(/\D/g, ""))}
        />
      </div>

      <FormMessage status={currentStatus} message={currentMessage} />

      <div className="mt-2 w-full">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Next Step"}
        </Button>
      </div>
    </form>
  );
}
