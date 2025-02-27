
"use client"
import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // Используем Lucide иконки

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex items-center justify-between z-20 px-6 py-4 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md rounded-lg max-w-full text-slate-300">
      {/* Контейнер для кнопки бургера (выравниваем справа) */}
      <div className="md:hidden ml-auto">
        <button onClick={toggleMenu} className="text-slate-300">
          {isMenuOpen ? (
            <X size={24} strokeWidth={2} className="text-slate-300" />
          ) : (
            <Menu size={24} strokeWidth={2} className="text-slate-300" />
          )}
        </button>
      </div>

      {/* Контейнер для основного меню (размещаем по центру) */}
      <div
        className={`flex flex-col items-center justify-center gap-4 mt-4 md:flex-row md:gap-8 md:mt-0 ${
          isMenuOpen ? 'block' : 'hidden'
        } md:block`}
      >
        {/* Список навигации (центрируем элементы) */}
        <ul className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
          <li className="group relative">
            <Link
              href="/"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu} // Закрываем меню при клике на ссылку в мобильной версии
            >
              EVEOK
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/shiplist"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              SHIPS
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/dscan"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              DSCAN
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/market"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              MARKET
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/price"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              LOOT PRICE
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/wh"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              WH
            </Link>
          </li>
          <li className="group relative">
            <Link
              href="/about"
              className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full"
              onClick={toggleMenu}
            >
              ABOUT
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;






// import Link from 'next/link';
// import React from 'react';

// const Navigation: React.FC = () => {
//   return (
//     <nav className="flex items-center z-20 flex-col justify-center px-12 py-6 max-w-full text-base font-medium tracking-tight leading-none whitespace-nowrap rounded-[13px] text-slate-300  max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300">
//       <ul className="flex gap-8 items-center justify-center">
//         <li className="group relative">
//           <Link href="/" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             EVEOK
//           </Link>
//         </li>
//         <li className="group relative">
//           <Link href="/shiplist" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             SHIPS
//           </Link>
//         </li>
//         <li className="group relative">
//           <Link href="/dscan" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             DSCAN
//           </Link>
//         </li>
//         <li className="group relative">
//           <Link href="/market" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             MARKET
//           </Link>
//         </li>
//         <li className="group relative">
//           <Link href="/price" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             LOOT PRICE
//           </Link>
//         </li>
//         <li className="group relative">
//           <Link href="/wh" className="text-slate-300 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-red-500 after:transition-all after:duration-300 group-hover:after:w-full">
//             WH
//           </Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

// export default Navigation;