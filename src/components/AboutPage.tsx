// app/about/page.tsx

export default function AboutPage() {
  return (
    <section className="relative flex flex-col items-center justify-center py-12 mt-0 w-full max-w-[1260px] max-md:py-8 max-md:max-w-full bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      <h2 className="text-4xl font-bold text-indigo-100 mb-6 max-md:text-3xl max-sm:text-2xl">
        О проекте
      </h2>
      <div className="flex flex-col items-center space-y-6 max-w-[800px] text-center px-8">
        <p className="text-lg text-gray-300 leading-relaxed">
        Этот сайт создан для игроков{' '}
          <span className="font-bold text-violet-300">EVE Online</span>, предоставляя комплексные инструменты и утилиты для более эффективной игры.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
        Мы собрали данные о всех кораблях в EVE Online и представили их в удобочитаемом формате. Также здесь можно найти полезную информацию о механике игры и окружающем мире.
        </p>

        <p className="text-lg text-gray-300 leading-relaxed">
        Если у вас есть вопросы или нужна помощь, присоединяйтесь к корпорации <span className="font-bold text-violet-300">EVE-OK</span> или пишите в игре.
        </p>

        <p className="text-2xl font-bold text-gray-300 leading-relaxed">
        Возможности сайта:
        </p>
        <ul className="grid grid-cols-1 gap-4 max-w-[800px] text-left text-base text-gray-300 leading-relaxed">
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
            <p><strong className="text-violet-300 font-semibold">Оценка лута: </strong> мгновенное определение стоимости найденных предметов.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p> <strong className="text-violet-300 font-semibold">Поиск на рынке: </strong> подбор лучших цен на товары в галактике и регионах.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p><strong className="text-violet-300 font-semibold">D-Scan анализ: </strong> оперативный тактический анализ окружающей обстановки в системе.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p><strong className="text-violet-300 font-semibold">База кораблей: </strong> полная информация о всех судах EVE Online, включая их характеристики и описание.</p>
          </li>
        </ul>
        {/* <p className="text-lg text-gray-300 leading-relaxed">
          Мы стремимся сделать игру в{' '}
          <span className="font-bold text-violet-300">EVE Online</span>{' '}
          еще более захватывающей, информативной и легкой в восприятии! 
        </p> */}
        <p className="text-lg text-gray-300 leading-relaxed">Мы постоянно работаем над улучшением дизайна, расширением функционала и добавлением новых утилит. Ваше мнение важно – делитесь рекомендациями и пожеланиями в игре или через нашу корпорацию <span className="font-bold text-violet-300">EVE-OK</span>.</p>
        <p className="text-lg text-gray-300 leading-relaxed"><span className="font-bold text-violet-300">EVE Online</span> станет еще интереснее, понятнее и доступнее!</p>
        
        {/* <button className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#1F243C] to-[#161A31] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#161A31] hover:to-[#1F243C] shadow-md hover:shadow-lg">
          Узнать больше
        </button> */}
      </div>
    </section>
  );
}