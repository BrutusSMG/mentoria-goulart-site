"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { captureUtms, getUtms } from "@/utils/utm";
import { trackEvent } from "@/utils/tracking";

export default function LinkOfertaSucata({ origem = "brevo", campanha = "ebook_nutricao" }) {
  useEffect(() => { captureUtms(); }, []);
  const href = "/mentoria?" + new URLSearchParams({
    utm_source: origem,
    utm_medium: "email",
    utm_campaign: campanha,
    utm_content: "pagina_valores_sucata_cta",
  }).toString();

  function aoClicar() {
    const originais = getUtms();
    trackEvent("ViewContent", {
      content_name: "Clique CTA pagina valores sucata",
      content_category: "interesse_mentoria",
    });
    // Marca a origem da etapa para a oferta sem transportar o e-mail do lead.
    try {
      sessionStorage.setItem("gu_utm_params", JSON.stringify({
        ...originais,
        utm_source: origem,
        utm_medium: "email",
        utm_campaign: campanha,
        utm_content: "pagina_valores_sucata_cta",
      }));
    } catch {}
  }

  return (
    <Link href={href} onClick={aoClicar}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d89900] px-6 py-4 text-center text-base font-extrabold text-black transition-colors hover:bg-[#F7FA83] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7FA83] sm:text-lg">
      Conhecer o método e a formação <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0" />
    </Link>
  );
}
