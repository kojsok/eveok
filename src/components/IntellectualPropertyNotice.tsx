import React from 'react';
import Image from 'next/image';

const IntellectualPropertyNotice: React.FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-12 mt-0 w-full max-w-[1260px] max-md:py-8 max-md:max-w-full">
      {/* Background Image */}
      {/* <Image
        src="/background.svg"
        alt="Фон"
        width={1920} // Укажите реальные размеры изображения
        height={1080}
        className="object-cover absolute inset-0 w-full h-full z-10"
        style={{ objectPosition: 'top', position: 'absolute', width: '100%', height: '100%' }}
        priority
      /> */}
      {/* Content */}
      <div className="relative z-20 text-center text-sm leading-relaxed text-indigo-100 max-md:text-xs max-sm:text-[10px]">
        <p>
          EVE Online, логотип EVE, EVE и все ассоциированные логотипы и дизайны являются интеллектуальной собственностью компании CCP ehf.
          Вся графика и скриншоты, персонажи, транспортные средства, сюжеты, внутриигровые факты и прочие распознаваемые особенности,
          относящиеся к этим товарным знакам, также являются интеллектуальной собственностью компании CCP ehf. EVE Online и логотип EVE
          являются зарегистрированными товарными знаками компании CCP ehf. Все права защищены по всему миру. Все прочие товарные знаки
          являются собственностью их владельцев. Компания CCP ehf. никаким способом не аффилирована с сайтом eveok.ru. Компания CCP ehf. не
          несёт ответственности за контент и функционирование данного сайта, как и не несёт ответственности за любой ущерб, понесённый от
          использования данного сайта.
        </p>
        <p className="mt-4">Данный сайт носит исключительно информационный характер и не является официальным ресурсом CCP ehf. Администрация сайта не несет 
  ответственности за возможные потери, включая финансовые или игровые, возникшие в результате использования информации с данного сайта. 
  Перед принятием решений, связанных с игрой, рекомендуется ознакомиться с официальными источниками CCP ehf. Любое использование материалов 
  сайта осуществляется на свой страх и риск.</p>
      </div>
    </section>
  );
};

export default IntellectualPropertyNotice;