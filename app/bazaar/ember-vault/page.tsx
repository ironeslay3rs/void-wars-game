import { redirect } from "next/navigation";

/**
 * Canonical route alias — "Ember Vault" is the Book 4 canonical name
 * for the Pure school's market location. Internal routing uses "pure-enclave"
 * for backwards compatibility.
 */
export default function EmberVaultRedirect() {
  redirect("/bazaar/pure-enclave");
}
