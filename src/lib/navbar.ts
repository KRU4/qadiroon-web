export type NavbarHref =
  | { kind: "external"; href: string }
  | { kind: "route"; href: string };

/** Normalize admin navbar slug → router path or external URL */
export function resolveNavbarHref(slug: string): NavbarHref {
  const trimmed = slug.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { kind: "external", href: trimmed };
  }
  if (trimmed === "/" || trimmed === "") {
    return { kind: "route", href: "/" };
  }
  if (trimmed === "/blogs" || trimmed === "blogs") {
    return { kind: "route", href: "/blogs" };
  }
  if (trimmed.startsWith("/pages/")) {
    return { kind: "route", href: trimmed };
  }
  if (trimmed.startsWith("pages/")) {
    return { kind: "route", href: `/${trimmed}` };
  }
  if (trimmed.startsWith("/")) {
    return { kind: "route", href: trimmed };
  }
  return { kind: "route", href: `/pages/${trimmed}` };
}

export function isNavActive(pathname: string, slug: string): boolean {
  const { kind, href } = resolveNavbarHref(slug);
  if (kind === "external") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
