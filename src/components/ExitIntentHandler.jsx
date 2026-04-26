// src/components/ExitIntentHandler.jsx
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import DownsellPopup from './DownsellPopup';

const EXIT_INTENT_KEY = 'garimpo_urbano_exit_intent_shown';

const ExitIntentHandler = () => {
  const [showPopup, setShowPopup] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/mentoria') {
      return;
    }

    if (window.innerWidth < 768) {
      return;
    }

    // Função que será chamada quando o mouse sair da tela
    const handleMouseOut = (event) => {
      // 1. Verifica se o popup já foi mostrado nesta sessão
      const hasBeenShown = sessionStorage.getItem(EXIT_INTENT_KEY);

      // Se o mouse sair pelo topo E o popup ainda não foi mostrado
      if (event.clientY <= 0 && !hasBeenShown) {
        setShowPopup(true);
        
        // 2. Marca no sessionStorage que o popup foi mostrado
        sessionStorage.setItem(EXIT_INTENT_KEY, 'true');
        
        document.removeEventListener('mouseout', handleMouseOut);
      }
    };    

    // Adiciona o ouvinte de evento ao documento
    document.addEventListener('mouseout', handleMouseOut);

    // Função de limpeza do useEffect
    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
    
  }, [pathname]);
  
  if (pathname !== '/mentoria') {
    return null;
  }

  // Passamos a função setShowPopup para o componente filho poder alterar o estado
  return (
    <DownsellPopup 
      show={showPopup} 
      onClose={() => setShowPopup(false)} 
    />
  );
};

export default ExitIntentHandler;
