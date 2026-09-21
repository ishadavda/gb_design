import { z } from "zod";

export const AgeGateSchema = z.object({
  // The controlled age-gate field submits the normalized YYYY-MM-DD value.
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth as MM/DD/YYYY.")
    .refine((value) => {
      const [yearText, monthText, dayText] = value.split("-");
      if (!yearText || !monthText || !dayText) return false;

      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      const date = new Date(year, month - 1, day);
      return (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "Enter a valid calendar date.")
    .transform((value) => {
      const [yearText, monthText, dayText] = value.split("-");
      const year = Number(yearText);
      const month = Number(monthText);
      const day = Number(dayText);
      return new Date(year, month - 1, day);
    }),
});

export type AgeGateInput = z.infer<typeof AgeGateSchema>;
