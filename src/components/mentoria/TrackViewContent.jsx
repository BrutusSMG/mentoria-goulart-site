// src/components/mentoria/TrackViewContent.jsx
"use client";
import { useEffect } from 'react';
import { trackViewContent } from '@/utils/tracking';

const TrackViewContent = ({ preco, moeda = 'BRL' }) => {
  useEffect(() => {
    if (
      preco === null
      || preco === undefined
      || String(preco).trim() === ''
    ) {
      return;
    }

    const valor = Number(preco);

    if (Number.isFinite(valor)) {
      trackViewContent(
        'Mentoria Garimpo Urbano',
        valor,
        moeda,
      );
    }
  }, [preco, moeda]);

  return null;
};

export default TrackViewContent;