"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

// Aceita imagens locais (pasta public) ou URLs HTTPS cadastradas no MGU.
// Imagens externas não passam pelo otimizador da Vercel, evitando falhas
// com domínios que não fazem parte do next.config.mjs.
function normalizarUrlImagem(valor) {
  if (typeof valor !== "string") return null;

  const endereco = valor.trim();
  if (!endereco) return null;

  if (endereco.startsWith("public/")) {
    return `/${endereco.slice(7)}`;
  }

  if (endereco.startsWith("/") && !endereco.startsWith("//")) {
    return endereco;
  }

  try {
    const url = new URL(endereco);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ImagemSucata({ imagemUrl, nome }) {
  const url = normalizarUrlImagem(imagemUrl);
  const [urlComErro, setUrlComErro] = useState(null);
  const podeMostrar = url && url !== urlComErro;

  return (
    <div className="relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900">
      {podeMostrar ? (
        <Image
          src={url}
          alt={`Foto ilustrativa: ${nome}`}
          fill
          sizes="80px"
          loading="lazy"
          unoptimized={url.startsWith("https://")}
          className="object-cover"
          onError={() => setUrlComErro(url)}
        />
      ) : (
        <div className="flex flex-col items-center gap-1 text-zinc-500" aria-label="Imagem não disponível">
          <ImageOff aria-hidden="true" className="h-5 w-5" />
          <span className="text-[10px]">Sem foto</span>
        </div>
      )}
    </div>
  );
}
