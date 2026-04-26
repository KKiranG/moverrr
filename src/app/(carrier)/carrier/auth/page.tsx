import { redirect } from "next/navigation";

export default function CarrierAuthRedirect() {
  redirect("/login?next=/carrier");
}
