import { Link, useLocation } from "react-router";
import { isNavActive, resolveNavbarHref } from "../../lib/navbar";
import type { NavbarItem } from "../../lib/api";

interface NavbarLinkProps {
  item: NavbarItem;
  className: string;
  activeClassName?: string;
  onClick?: () => void;
}

export function NavbarLink({ item, className, activeClassName, onClick }: NavbarLinkProps) {
  const { pathname } = useLocation();
  const resolved = resolveNavbarHref(item.slug);
  const active = isNavActive(pathname, item.slug);
  const cls = active && activeClassName ? activeClassName : className;

  if (resolved.kind === "external") {
    return (
      <a href={resolved.href} className={cls} onClick={onClick} style={{ fontFamily: "Cairo, sans-serif" }}>
        {item.label}
      </a>
    );
  }

  return (
    <Link to={resolved.href} className={cls} onClick={onClick} style={{ fontFamily: "Cairo, sans-serif" }}>
      {item.label}
    </Link>
  );
}
