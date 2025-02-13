"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Home", href: "/" },
  { name: "Randomiser", href: "/randomiser" },
  { name: "Stats", href: "/stats" },
  { name: "Series", href: "/series" },
];

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex mt-2 h-[36px] grow items-center rounded-md bg-black-50 text-sm font-medium hover:bg-emerald-100 hover:text-green-600 p-2 md:px-3",
              {
                "mt-2 p-2 bg-emerald-100 text-green-600":
                  pathname === link.href,
              },
            )}
          >
            <p className="block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

export default function TopNav() {
  return (
    <div className="flex flex-row gap-x-2 md:flex-row md:space-x-0 md:py-2 ml-2">
      <NavLinks />
    </div>
  );
}
