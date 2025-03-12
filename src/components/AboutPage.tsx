// app/about/page.tsx

export default function AboutPage() {
  return (
    <section className="relative flex flex-col items-center justify-center py-12 mt-0 w-full max-w-[1260px] max-md:py-8 max-md:max-w-full bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      <h2 className="text-4xl font-bold text-indigo-100 mb-6 max-md:text-3xl max-sm:text-2xl">
        О проекте
      </h2>
      <div className="flex flex-col items-center space-y-6 max-w-[800px] text-center px-8">
        <p className="text-lg text-gray-300 leading-relaxed">
          Этот сайт создан специально для игроков в{' '}
          <span className="font-bold text-violet-300">EVE Online</span>, чтобы предоставить им комплексные инструменты и утилиты для более эффективной игры.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          Мы собрали данные о всех кораблях, которые находятся в сети EVE Online, и предоставляем пользователям эту информацию в удобном для чтения виде.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          Мы стараемся предоставлять игрокам Eve Online максимально полезную и информативную информацию о механнике игры и окружении.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          Мы всегда рады ответить на ваши вопросы и помочь вам. Вступай в нашу корпорацию <span className="font-bold text-violet-300">EVE-OK</span> или пиши в in game.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          На нашем сайте вы найдете следующие функции:
        </p>
        <ul className="grid grid-cols-1 gap-4 max-w-[800px] text-left text-base text-gray-300 leading-relaxed">
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
            <p><strong className="text-violet-300 font-semibold">Оценка лута: </strong> Быстро определите стоимость найденных предметов.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p> <strong className="text-violet-300 font-semibold">Поиск на рынке: </strong> Найдите лучшие цены на товары в галактике.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p><strong className="text-violet-300 font-semibold">D-Scan анализ: </strong> Получайте оперативно-тактическую информацию о вашем окружении.</p>
          </li>
          <li className="flex items-center space-x-4 p-4 bg-[#1F243C] rounded-lg shadow-md">
          <p><strong className="text-violet-300 font-semibold">База кораблей: </strong> Исчерпывающие данные о всех кораблях EVE Online, включая их характеристики и описание.</p>
          </li>
        </ul>
        <p className="text-lg text-gray-300 leading-relaxed">
          Мы стремимся сделать игру в{' '}
          <span className="font-bold text-violet-300">EVE Online</span>{' '}
          еще более захватывающей, информативной и легкой в восприятии! 
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">Мы будем улучшать дизайн и наращивать функционал, а также увеличивать набор утилит. Нам важно ваше мнение, делитесь с нами вашими рекомендациями и пожеланиями в игре, Наша корпорация <span className="font-bold text-violet-300">EVE-OK</span>.</p>
        {/* <button className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#1F243C] to-[#161A31] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#161A31] hover:to-[#1F243C] shadow-md hover:shadow-lg">
          Узнать больше
        </button> */}
      </div>
    </section>
  );
}