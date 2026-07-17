// src/components/Shared/WhatsAppButton.jsx
"use client";

const WhatsAppButton = () => {
  // Substitua pelo número real do suporte (com DDI 55 e o DDD)
  const numeroWhatsApp = "5541996207316"; 
  
  // Mensagem padrão que já vem escrita quando o cliente clica
  const mensagem = "Olá! Estava no site do Garimpo Urbano e gostaria de tirar uma dúvida sobre a Mentoria.";  
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem )}`;

  const handleTrackClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead');
    }
  };

  return (
    <a
      href={linkWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleTrackClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:bg-[#20ba56] hover:scale-110 transition-all duration-300 group"
      aria-label="Fale conosco no WhatsApp"
    >
      {/* Efeito de "Pulsar" atrás do botão para chamar atenção */}
      <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping -z-10"></span>
      
      {/* Ícone Oficial do WhatsApp */}
      <svg className="w-8 h-8 z-10" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.123.552 4.195 1.606 6.015L.106 24l6.105-1.602a11.96 11.96 0 005.82 1.514h.005c6.646 0 12.028-5.383 12.028-12.031S18.677 0 12.031 0zm0 21.912c-1.796 0-3.555-.483-5.097-1.397l-.366-.217-3.787.993.993-3.787-.217-.366a9.98 9.98 0 01-1.397-5.097c0-5.542 4.51-10.052 10.052-10.052s10.052 4.51 10.052 10.052-4.51 10.052-10.052 10.052zm5.51-7.53c-.302-.151-1.788-.882-2.065-.983-.276-.101-.478-.151-.679.151-.201.302-.78 .983-.956 1.184-.176.201-.352.226-.654.075-1.726-.867-2.946-1.714-4.088-3.664-.176-.302.176-.276.478-.882.101-.201.05-.377-.025-.528-.075-.151-.679-1.635-.93-2.238-.245-.59-.494-.51-.679-.52-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.804.377-.276.302-1.056 1.031-1.056 2.515 0 1.484 1.081 2.918 1.232 3.12.151.201 2.126 3.245 5.148 4.548 2.035.879 2.785.754 3.313.628.628-.151 1.788-.73 2.04-1.434.251-.704.251-1.308.176-1.434-.075-.126-.276-.201-.578-.352z"/>
      </svg>

      {/* Balão de Texto (Oculto no mobile com 'hidden md:flex', aparece no hover no PC) */}
      <div className="hidden md:flex absolute right-16 bg-white text-zinc-800 px-4 py-2 rounded-xl shadow-lg border border-zinc-200 whitespace-nowrap flex-col items-end mr-2 opacity-0 invisible translate-x-2 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
        <span className="text-xs text-zinc-500 font-medium mb-0.5">Dúvida sobre a Mentoria?</span>
        <span className="text-sm font-bold text-[#25D366]">Fale com o Prof. Goulart</span>
        
        {/* Triângulo (setinha) do balão apontando para o botão do WhatsApp */}
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white drop-shadow-sm"></div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
