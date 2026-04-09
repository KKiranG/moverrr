import Link from "next/link";

import { LogoutButton } from "@/components/layout/logout-button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { getOptionalSessionUser, isAdminUser } from "@/lib/auth";
import { getCarrierByUserId } from "@/lib/data/carriers";

type NavItem = {
  href: string;
  label: string;
};

export async function SiteHeader() {
  const user = await getOptionalSessionUser();
  const carrier = user ? await getCarrierByUserId(user.id) : null;
  const isAdmin = user ? await isAdminUser(user.id, user.email) : false;
  const carrierNavItem: NavItem = carrier
    ? {
        href: "/carrier/dashboard",
        label: carrier.isVerified ? "My dashboard" : "Carrier onboarding",
      }
    : {
        href: "/become-a-carrier",
        label: "Become a carrier",
      };
  const postTripHref = user ? (carrier ? "/carrier/post" : "/carrier/onboarding") : "/carrier/signup";

  const navItems: NavItem[] = [
    { href: "/search", label: "Browse trips" },
    ...(user ? [{ href: "/saved-searches", label: "Saved searches" }] : []),
    carrierNavItem,
    ...(isAdmin ? [{ href: "/admin/dashboard", label: "Admin" }] : []),
  ];

  const authCopy = user ? user.email ?? "Signed in" : "Log in";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-content flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex min-h-[44px] min-w-0 flex-col justify-center">
            <span className="font-heading text-xl tracking-[-0.04em] text-text">
              moverrr
            </span>
            <span className="hidden text-xs text-text-secondary sm:block">
              Spare capacity for big stuff
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-text-secondary sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-1 transition-colors hover:text-text active:bg-black/[0.04] active:text-text dark:hover:text-text dark:active:bg-white/[0.08]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <span className="hidden max-w-[220px] truncate rounded-full border border-border bg-surface px-3 py-2 text-xs text-text-secondary sm:inline-flex">
                  {authCopy}
                </span>
              ) : (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
              )}

              {user ? <LogoutButton /> : null}
            </div>

            <Button asChild size="sm">
              <Link href={postTripHref}>Post a trip</Link>
            </Button>
          </div>
        </div>

        <MobileNav
          navItems={navItems}
          authCopy={authCopy}
          isLoggedIn={Boolean(user)}
          postTripHref={postTripHref}
        />
      </div>
    </header>
  );
}
