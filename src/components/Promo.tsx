import React from 'react';
import Link from "next/link";
import Image from 'next/image';


const Promo: React.FC = () => {
    return (
        <section className="relative flex flex-col items-center justify-center py-4 mt-0 w-full max-w-[1260px] max-md:py-8 max-md:max-w-full">
            {/* Content */}
            <Link
                href="https://www.eveonline.com/ru/signup?invc=8abbe447-a486-4e16-864e-57dc1e680f3a"
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-screen-xl w-full p-4 bg-slate-950 text-slate-300  bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg flex flex-col items-center justify-center "
            >
                <div className="flex flex-col items-center text-center">
                    <Image
                        src="/eve_partner3.png"
                        alt="EVE Online Logo"
                        width={180}
                        height={80}
                        // className="mb-6 w-full h-auto" // или "w-auto h-full" в зависимости от потребностей
                    />
                    <h3 className="text-2xl font-bold mt-2 mb-2 leading-tight text-indigo-100 max-md:text-xl max-sm:text-lg max-sm:leading-7">Присоединяйтесь к нам в <span className="text-violet-300">EVE Online</span>!</h3>
                    <p className="text-base text-center mb-2">
                        Получите <span className="font-bold text-violet-300">1 000 000 очков навыков</span> при регистрации по нашей партнерской ссылке.
                    </p>
                    <button className="inline-flex gap-2 justify-center items-center w-full sm:w-48 px-4 py-3 text-base font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg">
                        Получить очки
                    </button>
                </div>
            </Link>

        </section>
    );
};

export default Promo;