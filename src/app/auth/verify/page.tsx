import { redirect } from "next/navigation";

export default function AuthVerifyRedirect() {
  redirect("/verify");
}
