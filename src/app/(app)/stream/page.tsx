import { redirect } from "next/navigation";

// The old /stream route is retired in favor of /streams (library) +
// /stream/new (focused broadcast experience). Send legacy hits home.
export default function StreamRedirect() {
  redirect("/streams");
}
