/** Contact is always the user's login email. */
export type LoginEmailContact = {
  email: string;
};

export function buildLoginEmailContact(email: string): LoginEmailContact {
  return { email: email.trim().toLowerCase() };
}

export function buildSharePayload(email: string): Record<string, string> {
  return { email: email.trim().toLowerCase() };
}
