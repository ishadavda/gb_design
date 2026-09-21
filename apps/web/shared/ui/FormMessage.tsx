/**
 * Renders the message a Server Action returned. Nothing else.
 *
 * The box is always in the layout and fades its contents in, which is how the
 * approved screens behave - an error appearing must not push the button down.
 */
export function FormMessage({
  status,
  message,
}: {
  status: "idle" | "success" | "error";
  message?: string;
}) {
  const visible = status !== "idle" && Boolean(message);

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`min-h-[20px] text-center text-xs font-extrabold transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      } ${status === "error" ? "text-red-500" : "text-claire"}`}
    >
      {message}
    </p>
  );
}
