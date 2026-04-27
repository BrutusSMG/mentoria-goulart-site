// src/components/Navbar.jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'Início', href: '/' },
  { 
    label: 'Cursos',
    children: [
      { label: 'Garimpo Urbano - Mentoria Individual', href: '/mentoria' },
      { label: 'Garimpo Urbano - Mentoria em Grupo', href: '/em-breve' },
      { label: 'Curso Empreendedor 4.0', href: '/em-breve' },
    ],
  },
  { 
    label: 'E-books',
    children: [
      { label: 'Extração e Refino de Ouro e Prata', href: '/em-breve' },
      { label: 'E-book Garimpo Urbano', href: '/em-breve' },
    ],
  },
  { label: 'Contato', href: '/#contato' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleSubMenuToggle = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 w-full">
          
          {/* 1. LADO ESQUERDO: NAVEGAÇÃO PARA DESKTOP */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <span className="text-gray-300 hover:text-[#d89900] transition-colors duration-300 font-medium flex items-center cursor-pointer py-2">
                    {item.label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-[#d89900] transition-colors duration-300 font-medium flex items-center py-2"
                  >
                    {item.label}
                  </Link>
                )}

                {item.children && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-[#d89900]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2. LADO DIREITO: BOTÃO ÁREA DE MEMBROS + HAMBÚRGUER */}
          <div className="flex items-center gap-4 ml-auto">
            
            {/* Botão Área de Membros (Aparece só no Desktop) */}
            <Link 
              href="https://hotmart.com/pt-br/club/curso-garimpo-urbano" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block border border-[#d89900] text-[#d89900] hover:bg-[#d89900] hover:text-black font-bold py-2 px-5 rounded-lg transition-all duration-300 text-sm"
            >
              Área do Aluno
            </Link>

            {/* Botão Hambúrguer para Mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={( ) => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir menu de navegação"
                className="text-gray-300 hover:text-[#d89900] transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MENU DROPDOWN PARA MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden pb-4 bg-black/95 border-b border-gray-700 shadow-xl absolute w-full left-0">
          <div className="flex flex-col space-y-1 px-4 pt-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {!item.children ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => handleSubMenuToggle(item.label)}
                      className="w-full flex justify-between items-center text-gray-300 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSubMenu === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openSubMenu === item.label && (
                      <div className="pl-4 pt-2 flex flex-col space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-gray-400 hover:bg-gray-700 block px-3 py-2 rounded-md text-sm font-medium"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Botão Área de Membros no Mobile (Fica no final da lista) */}
            <div className="pt-4 pb-2 border-t border-gray-800 mt-2">
              <Link 
                href="https://hotmart.com/pt-br/club/curso-garimpo-urbano"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#d89900] text-black font-bold py-3 rounded-lg hover:bg-[#F7FA83] transition-colors"
              >
                Área de Membros
              </Link>
            </div>

          </div>
        </div>
       )}
    </nav>
  );
};

export default Navbar;
