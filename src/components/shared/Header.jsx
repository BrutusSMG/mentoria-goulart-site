// src/components/shared/Header.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  // Na página de mentoria, a logo permanece sem link, como no comportamento atual.
  const isMentoriaPage = pathname === "/mentoria";

  const logoContent = (
    <Image
      src="/logo_fundoTransparentered.png"
      alt="Logo Garimpo Urbano"
      width={120}
      height={80}
      priority
      className="max-w-full h-auto object-contain"
      style={{ width: "auto", height: "auto" }}
    />
  );

  return (
    <header className="border-b border-zinc-900 bg-black py-6">
      <div className="container relative mx-auto flex justify-center px-4">
        {isMentoriaPage ? (
          <div>{logoContent}</div>
        ) : (
          <Link href="/" aria-label="Ir para a página inicial">
            {logoContent}
          </Link>
        )}

        <Link
          href="/admin-login"
          prefetch={false}
          aria-label="Acesso administrativo"
          title="Acesso administrativo"
          className="group absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-xs font-bold text-zinc-300 transition-all duration-300 hover:w-48 hover:border-[#d89900] hover:text-[#d89900] focus-visible:w-48 focus-visible:border-[#d89900] focus-visible:text-[#d89900] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d89900]"
        >
          <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-36 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-36 group-focus-visible:opacity-100">
            Acesso administrativo
          </span>
        </Link>

      </div>
    </header>
  );
};

export default Header;