import { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Award, 
  Calendar, 
  ShoppingBag, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  Plus, 
  CheckCircle, 
  MessageSquare, 
  GraduationCap, 
  FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'points' | 'exemption' | 'science';
  tags: string[];
}

export default function FAQSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Interactive calculator state
  const [calcSpeakerEvents, setCalcSpeakerEvents] = useState(0);
  const [calcListenerEvents, setCalcListenerEvents] = useState(0);
  const [calcQuizzes, setCalcQuizzes] = useState(0);
  const [calcPublications, setCalcPublications] = useState(0);

  const faqData: FAQItem[] = [
    {
      category: 'general',
      question: 'Что такое СНО ФЭМ БГЭУ и как в него вступить?',
      answer: 'Студенческое научное общество Факультета Экономики и Менеджмента (СНО ФЭМ БГЭУ) — это объединение амбициозных студентов, занимающихся научными исследованиями, аналитическими проектами и организацией научных конференций. Чтобы стать активным участником СНО, достаточно зарегистрироваться на нашем портале, принимать участие в мероприятиях в роли докладчика или слушателя, а также проходить экономические викторины для подтверждения эрудиции.',
      tags: ['СНО', 'вступить', 'ФЭМ', 'регистрация'],
    },
    {
      category: 'points',
      question: 'Как начисляются научные баллы в приложении?',
      answer: 'Баллы начисляются автоматически или утверждаются Модератором СНО за высокую активность:\n\n• Выступление с докладом на конференции: до +50 баллов.\n• Посещение научного лектория в роли слушателя: +10...15 баллов.\n• Успешное выполнение викторины (финансы, макроэкономика, ИИ): до +15...30 баллов.\n• Публикация научной статьи, рецензируемой в РИНЦ: +100 баллов.\n\nВсе заработанные баллы формируют ваш академический рейтинг и отображаются в Личном кабинете.',
      tags: ['баллы', 'начисление', 'рейтинг', 'викторина'],
    },
    {
      category: 'exemption',
      question: 'Как получить официальную справку-освобождение от занятий за баллы?',
      answer: 'Для получения освобождения зайдите в свой «Профиль», перейдите в Магазин научных привилегий и выберите пункт «Освобождение от учебных занятий». Проверьте, что на вашем балансе есть необходимые 100 баллов, укажите причину пропуска (например, подготовка доклада) и выберите желаемые даты. Из облачного хранилища сформируется PDF-справа с верификационным QR-кодом и подписями ответственных лиц СНО и деканата ФЭМ.',
      tags: ['освобождение', 'справка', 'пропуск', 'проверить', 'деканат'],
    },
    {
      category: 'exemption',
      question: 'Законно ли освобождение от занятий через СНО?',
      answer: 'Да, абсолютно легитимно. Механизм переноса учебного времени и поощрения согласован непосредственно с деканатом Факультета Экономики и Менеджмента БГЭУ. Справка-обоснование выдается студентам за высокую научно-исследовательскую деятельность, компенсирующую академические часы самостоятельной подготовкой. Каждый документ содержит уникальный верификационный код, который деканат или куратор группы может проверить в реестре.',
      tags: ['законность', 'легитимность', 'деканат', 'купон', 'проверка'],
    },
    {
      category: 'science',
      question: 'Что дает публикация статьи в РИНЦ и как её ускорить?',
      answer: 'Публикация в РИНЦ (Российский индекс научного цитирования) подтверждает статус вашего исследования на межгосударственном уровне, повышает шансы на поступление в магистратуру и получение повышенных стипендий БГЭУ. Стандартный срок рецензирования может занять до полугода, но СНО ФЭМ предлагает ускоренный трек. За 250 баллов активности в Магазине Привилегий вы можете получить опцию «Ускоренная публикация», гарантирующую двойное слепое рецензирование и внесение статьи в очередной сборник «FEM Research» без очереди.',
      tags: ['РИНЦ', 'публикация', 'статья', 'FEM Research', 'рецензия'],
    },
    {
      category: 'points',
      question: 'Сгорают ли баллы по завершении семестра?',
      answer: 'Баллы активности НЕ сгорают по завершении семестра. Они накапливаются на протяжении всего периода вашего обучения на факультете. Вы можете тратить баллы на мерч, освобождения или коучинг в любое удобное время. Однако ваш рейтинг СНО рассчитывается по скользящему показателю за текущий год, что мотивирует оставаться в научном тонусе.',
      tags: ['срок действия', 'сгорание', 'семестр', 'накопление'],
    },
    {
      category: 'science',
      question: 'Какие требования предъявляются к научным статьям в сборники БГЭУ?',
      answer: 'Основные требования КАТЕГОРИЧЕСКИ включают оригинальность текста не менее 70% (проверяется по системе Антиплагиат.ВУЗ), наличие актуального списка источников БГЭУ/ВБ в конце работы, подпись научного руководителя (профессора или доцента кафедры ФЭМ) и структурированность (введение, методология, экономические результаты, выводы). Шаблон оформления и список рекомендуемых тем всегда доступны на кафедре вашей специальности и продублированы в разделе Информации.',
      tags: ['статьи', 'требования', 'Антиплагиат', 'кафедра', 'шаблон'],
    },
    {
      category: 'general',
      question: 'Кто может стать Администратором или Модератором СНО?',
      answer: 'Позиция Модератора и Активиста СНО доступна студентам 2-4 курсов ФЭМ БГЭУ, показавшим выдающиеся исследовательские и организаторские качества. Кандидатуру утверждает Совет СНО и зам. декана по научной работе. Модераторы получают доступ к специальному интерфейсу «Актив СНО» для ручного начисления баллов за физические доклады, управления тестами-викторинами и утверждения заявок участников.',
      tags: ['роль', 'модератор', 'администратор', 'актив', 'БГЭУ'],
    }
  ];

  const categories = [
    { id: 'all', label: 'Все вопросы', icon: HelpCircle },
    { id: 'general', label: 'О СНО ФЭМ', icon: GraduationCap },
    { id: 'points', label: 'Начисление баллов', icon: Award },
    { id: 'exemption', label: 'Освобождения от пар', icon: FileText },
    { id: 'science', label: 'Наука и РИНЦ', icon: BookOpen }
  ];

  // Filters FAQ array based on query & category
  const filteredFaq = faqData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  // Helper calculation for point predictor
  const predictedPoints = (calcSpeakerEvents * 50) + (calcListenerEvents * 10) + (calcQuizzes * 15) + (calcPublications * 100);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800" id="faq-section-container">
      {/* Visual Title Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-505/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative space-y-3 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-white/10 rounded-full border border-white/15 uppercase tracking-widest">
              Справка Базы Знаний
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            Часто Задаваемые Вопросы (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-indigo-150 leading-relaxed max-w-3xl">
            Узнайте всё об академическом рейтинге, получении справок для пропуска учебных пар на законных основаниях, подготовке научных статей с индексацией РИНЦ и о том, как устроен цифровой актив СНО ФЭМ БГЭУ.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: FAQ category selector & Interactive prediction tool */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Scientific Privilege Calculator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Калькулятор Привилегий</h3>
                <p className="text-[10px] text-slate-400">Спланируйте свои баллы и обменяйте их в магазине</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-1.5">
              {/* Speaker activity counter */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Доклады на СНО (+50 баллов)</p>
                  <p className="text-[10px] text-slate-405 leading-snug">Количество выступлений с презентацией</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCalcSpeakerEvents(Math.max(0, calcSpeakerEvents - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-slate-800 text-sm">{calcSpeakerEvents}</span>
                  <button 
                    onClick={() => setCalcSpeakerEvents(calcSpeakerEvents + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Listener activity counter */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Слушатель на лекциях (+10 баллов)</p>
                  <p className="text-[10px] text-slate-405 leading-snug">Посещение научных семинаров, вебинаров</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCalcListenerEvents(Math.max(0, calcListenerEvents - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-slate-800 text-sm">{calcListenerEvents}</span>
                  <button 
                    onClick={() => setCalcListenerEvents(calcListenerEvents + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Completed quizzes counter */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Викторины на отлично (+15 баллов)</p>
                  <p className="text-[10px] text-slate-405 leading-snug">Прохождение экономических тестов в приложении</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCalcQuizzes(Math.max(0, calcQuizzes - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-slate-800 text-sm">{calcQuizzes}</span>
                  <button 
                    onClick={() => setCalcQuizzes(calcQuizzes + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Publications counter */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Публикация в РИНЦ (+100 баллов)</p>
                  <p className="text-[10px] text-slate-405 leading-snug">Научные статьи в РИНЦ, ВАК или материалы БГЭУ</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCalcPublications(Math.max(0, calcPublications - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-slate-800 text-sm">{calcPublications}</span>
                  <button 
                    onClick={() => setCalcPublications(calcPublications + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold font-mono transition-colors cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total projection bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ваш Прогноз Баллов:</span>
                <span className="flex items-center text-amber-600 font-mono font-black text-lg gap-1">
                  <Sparkles className="h-4 w-4 animate-pulse shrink-0" />
                  {predictedPoints}
                </span>
              </div>

              {/* Privilege unlocking alert */}
              <div className="text-[11px] leading-relaxed pt-1 border-t border-slate-200/50">
                {predictedPoints === 0 ? (
                  <p className="text-slate-400">Выберите планируемые действия выше, чтобы узнать, какие научные поощрения станут доступны.</p>
                ) : predictedPoints < 75 ? (
                  <p className="text-slate-500">До первой привилегии (Абонемент библиотеки - <b>75 баллов</b>) осталось накопить: <b className="text-blue-900 font-mono">{75 - predictedPoints}</b></p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Вам ОГРАНИЧЕННО доступны к обмену:</span>
                    </p>
                    <ul className="list-disc list-inside text-indigo-950 space-y-0.5 text-[10px] font-semibold pl-1">
                      {predictedPoints >= 75 && <li>VIP-абонемент коворкингов БГЭУ ({75} б.)</li>}
                      {predictedPoints >= 100 && <li className="text-emerald-800">Освобождение от занятий ФЭМ ({100} б.) ⭐</li>}
                      {predictedPoints >= 150 && <li>Рекомендательное письмо декана ({150} б.)</li>}
                      {predictedPoints >= 185 && <li>Фирменное оверсайз-худи СНО ({185} б.)</li>}
                      {predictedPoints >= 250 && <li className="text-blue-800">Ускоренная публикация РИНЦ ({250} б.)</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Need help advice card */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/20 border border-indigo-100/50 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-indigo-900 font-bold text-sm">
              <MessageSquare className="h-4.5 w-4.5 text-blue-900" />
              <span>Остались вопросы?</span>
            </div>
            <p className="text-xs text-slate-550 leading-relaxed leading-normal">
              Если в данном списке нет ответа на интересующий вас вопрос о деятельности СНО, свяжитесь напрямую с председателем СНО ФЭМ в Telegram или напишите обращение на официальную научно-техническую почту СНО.
            </p>
            <div className="pt-1">
              <a 
                href="mailto:sno_fem_bseu@mail.ru" 
                className="inline-block w-full py-2 bg-white text-indigo-950 font-bold border border-indigo-200 hover:bg-slate-50 rounded-xl text-center text-xs transition-colors shrink-0 cursor-pointer"
              >
                Написать научное обращение
              </a>
            </div>
          </div>

        </div>

        {/* Right column: FAQ category filter system & actual Q&A lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search bar inside key indices */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по вопросам, ответам или хэштегам (например, РИНЦ, справка...)"
              className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200/85 shadow-sm rounded-2xl text-xs sm:text-sm placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Очистить
              </button>
            )}
          </div>

          {/* SNO Category Tabs selectors list */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setExpandedIndex(null); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Q&A Accordion component section */}
          <div className="space-y-3.5 select-text">
            {filteredFaq.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Ничего не найдено по запросу</h4>
                <p className="text-slate-455 text-xs max-w-md mx-auto">
                  Попробуйте ввести другие ключевые слова или выберите категорию «Все вопросы», чтобы просмотреть доступную информацию.
                </p>
              </div>
            ) : (
              filteredFaq.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all duration-250 hover:border-slate-300"
                  >
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="w-full text-left px-5 py-4 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-55/10 focus:outline-none"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-black text-xs">
                          ?
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm leading-normal">
                            {item.question}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-1.5">
                            <span className="text-[8px] font-bold text-blue-700 bg-blue-50 uppercase px-1.5 py-0.2 rounded border border-blue-105">
                              {categories.find(c => c.id === item.category)?.label || item.category}
                            </span>
                            {item.tags.slice(0, 3).map((tag, tIdx) => (
                              <span 
                                key={tIdx} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSearchQuery(tag); 
                                }}
                                className="text-[8.5px] font-medium text-slate-400 font-mono hover:text-blue-900 transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 text-slate-400 mt-1 sm:mt-0 font-bold">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-blue-900" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-100 bg-slate-50/40"
                        >
                          <div className="px-5 py-4 text-xs sm:text-sm text-slate-650 leading-relaxed font-sans whitespace-pre-wrap">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-3 bg-[#e0e7ff]/30 p-4 rounded-2xl border border-[#c7d2fe]/40 text-xs sm:text-sm text-indigo-950 font-sans leading-normal">
            <Sparkles className="h-5 w-5 text-indigo-700 shrink-0 animate-pulse" />
            <div>
              <p className="font-extrabold uppercase tracking-wide text-[10.5px] text-indigo-900">Вы знали о системе верификации?</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Каждая заказанная справка-освобождение в деканате БГЭУ получает зашифрованные метаданные и встраивается в PDF в виде QR-кода. Старосты групп или кураторы могут сканировать этот QR-код для моментального подтверждения статуса на нашей официальной платформе!
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
