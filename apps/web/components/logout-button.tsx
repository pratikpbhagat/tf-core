import { SignOut } from "@phosphor-icons/react/dist/ssr";

import { signOut } from "@/actions/auth";
import { buttonVariants } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <SignOut weight="bold" className="h-4 w-4" />
        Sign out
      </button>
    </form>
  );
}
