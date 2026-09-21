import { errorResponse, successResponse } from "@/lib/auth";

export const runtime = "nodejs";

type MenuItem = {
  id: string;
  label: string;
  path: string;
};

const CONSUMER_MENUS: MenuItem[] = [
  { id: "home", label: "Home", path: "/" },
  { id: "account", label: "Account", path: "/account" },
  { id: "consents", label: "Consents", path: "/account/consents" },
];

const STAFF_MENUS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/staff" },
  { id: "customers", label: "Customers", path: "/staff/customers" },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = (url.searchParams.get("context") ?? "consumer").trim();

  if (context !== "consumer" && context !== "staff") {
    return errorResponse("INVALID_REQUEST", 422);
  }

  const menus = context === "staff" ? STAFF_MENUS : CONSUMER_MENUS;
  return successResponse({ menus });
}

