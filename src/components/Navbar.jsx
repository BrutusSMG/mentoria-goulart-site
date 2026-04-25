// src/components/Navbar.jsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react'; // Ícones de Hambúrguer e Fechar

// Itens do menu em um array para facilitar a manutenção
const navItems = [
  { label: 'Início', href: '/' },
  { 
    label: 'Cursos',
    href: '/Cursos',
    children: [
      { label: 'Garimpo Urbano - Mentoria Individual', href: '/mentoria' },
      { label: 'Garimpo Urbano - Mentoria em Grupo', href: '/#' },
      { label: 'Curso Empreendedor 4.0', href: '/#' },
    ],
  },

  { 
    label: 'E-books',
    href: '/ebooks',
    children: [
      { label: 'Extração e Refino de Ouro e Prata', href: '/ebooks/trafego-pago' },
      { label: 'E-book Garimpo Urbano', href: '/ebooks/copywriting' },
    ],
  },

  { label: 'Contato', href: '/contato' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Novo estado para controlar qual submenu está aberto no mobile
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleSubMenuToggle = (label) => {
    // Se o submenu clicado já estiver aberto, fecha. Senão, abre.
    setOpenSubMenu(openSubMenu === label ? null : label);
  };


  return (
    <nav className="bg-black-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. NAVEGAÇÃO PARA DESKTOP */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {/* Item principal do menu */}
                <Link
                  href={item.href}
                  className="text-gray-300 hover:text-[#d89900] transition-colors duration-300 font-medium flex items-center"
                >
                  {item.label}
                  {/* Adiciona uma seta se houver sub-itens */}
                  {item.children && <ChevronDown className="ml-1 h-4 w-4" />}
                </Link>

                {/* Submenu Dropdown para Desktop */}
                {item.children && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="py-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-400"
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

          {/* 2. BOTÃO HAMBÚRGUER PARA MOBILE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu de navegação"
              className="text-gray-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. MENU DROPDOWN PARA MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-1 px-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {/* Se não tiver submenu, é um link simples */}
                {!item.children ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-300 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  // Se tiver submenu, é um botão que abre o submenu
                  <div>
                    <button
                      onClick={() => handleSubMenuToggle(item.label)}
                      className="w-full flex justify-between items-center text-gray-300 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${openSubMenu === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Submenu Mobile (condicional) */}
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;