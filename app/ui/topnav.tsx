"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Home", href: "/" },
  { name: "Randomiser", href: "/randomiser" },
  { name: "Timeline", href: "/timeline" },
  { name: "Stats", href: "/stats" },
  { name: "Series", href: "/series" },
  { name: "Settings", href: "/settings"},
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
              "flex mt-2 h-[36px] shrink-0 items-center rounded-md bg-black-50 text-sm font-medium hover:bg-emerald-100 hover:text-green-600 p-2 md:px-3",
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
    <div className="ml-2 overflow-x-auto">
      <div className="flex flex-row gap-x-2 py-2 w-max min-w-full">
        <NavLinks />
      </div>
    </div>
  );
}
