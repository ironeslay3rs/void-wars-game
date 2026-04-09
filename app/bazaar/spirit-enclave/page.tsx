import { redirect } from "next/navigation";

/** Legacy URL — production id is `pure-enclave`. */
export default function SpiritEnclaveRedirectPage() {
  redirect("/bazaar/pure-enclave");
}
