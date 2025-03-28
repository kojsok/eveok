import Image from 'next/image';
import Link from 'next/link';

const BannerCard = ({ 
  href, 
  src, 
  alt, 
  description 
}: { 
  href: string; 
  src: string; 
  alt: string;
  description: string;
}) => {
  return (
    <div className="space-y-3">
      <Link href={href} className="block transition-transform duration-300 hover:scale-[1.02]">
        <div className="relative h-52 w-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (min-width: 768px) 50vw"
            priority
          />
        </div>
      </Link>
      <p className="text-sm font-bold text-violet-300 text-center px-2">{description}</p>
    </div>
  );
};

export const BannersGrid = () => {
  const banners = [
    {
      href: '/shiplist',
      src: '/ships_banner.png',
      alt: 'Ship List',
      description: 'Полный список кораблей EVE Online'
    },
    {
      href: '/dscan',
      src: '/dscan_banner.png',
      alt: 'D-Scan',
      description: 'Анализ данных Directional Scanner'
    },
    {
      href: '/market',
      src: '/market_banner.png',
      alt: 'Market',
      description: 'Актуальные рыночные данные'
    },
    {
      href: '/wh',
      src: '/wh_banner.png',
      alt: 'Wormholes',
      description: 'Инструменты для работы с червоточинами'
    },
    {
      href: '/courier',
      src: '/courier_banner.png',
      alt: 'Courier',
      description: 'Система организации грузоперевозок'
    },
  ];

  return (
    <div className="mx-auto p-4 w-full max-w-screen-xl bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg text-slate-300">
      <h2 className="text-xl font-bold mb-6 text-center text-violet-200">EVE Online Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => (
          <div 
            key={index} 
            className={index === banners.length - 1 ? 'md:col-span-2' : ''}
          >
            <BannerCard 
              href={banner.href} 
              src={banner.src} 
              alt={banner.alt}
              description={banner.description}
            />
          </div>
        ))}
      </div>
    </div>
  );
};