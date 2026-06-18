import { requireApiSession } from "@/lib/auth/api-session";
import { jsonOk, logRequest } from "@/lib/api/response";
import { getLoginEmailContact } from "@/lib/user/contact-store";

export async function GET() {
  logRequest("GET", "/api/user/contact");

  const auth = await requireApiSession();
  if ("error" in auth) return auth.error;

  const contact = await getLoginEmailContact(auth.session.sub);
  return jsonOk({ contact });
}
