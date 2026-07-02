import { signOut } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm font-medium underline">
        Sign out
      </button>
    </form>
  );
}
