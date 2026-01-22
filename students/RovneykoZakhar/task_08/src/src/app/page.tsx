import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Заголовок */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
          Образовательные курсы
          <br />
          <span className="text-indigo-600">мирового уровня</span>
        </h1>

        {/* Подзаголовок */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Изучайте программирование, философию, статистику, предпринимательство и многое другое
          по материалам лучших университетов.
        </p>

        {/* Кнопка */}
        <Link
          href="/courses"
          className="inline-block bg-indigo-600 text-white font-semibold text-lg px-10 py-5 rounded-full hover:bg-indigo-700 transition transform hover:scale-105 shadow-lg"
        >
          Начать обучение →
        </Link>

        {/* Дополнительная информация (минимально) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-600">
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">100+</div>
            <div className="text-lg">Доступных курсов</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">Без оплаты</div>
            <div className="text-lg">Полностью бесплатно</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">Самостоятельно</div>
            <div className="text-lg">В удобном темпе</div>
          </div>
        </div>
      </div>
    </div>
  );
}