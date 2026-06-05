import React from 'react';
import { Trophy, Award, Users, BookOpen, Star, HelpCircle, ArrowRight, Compass, ShieldCheck, Heart, Sparkles, Zap } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface SnoAboutSectionProps {
  onNavigateToTab: (tab: string) => void;
}

export default function SnoAboutSection({ onNavigateToTab }: SnoAboutSectionProps) {
  const { isSandboxActive } = useFirebase();

  const stats = [
    { label: 'Активных исследователей', value: '180+', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Статей в журналах ВАК и РИНЦ', value: '320+', icon: Award, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Кафедральных секций исследований', value: '14', icon: Compass, color: 'text-amber-700 bg-amber-50' },
    { label: 'Ежегодных грантов', value: '10+', icon: Trophy, color: 'text-rose-600 bg-rose-50' },
  ];

  const directions = [
    {
      title: 'Цифровая экономика & Эконометрика',
      desc: 'Анализ макроэкономических показателей, прогнозирование ВВП и моделирование рынков с помощью систем искусственного интеллекта и Big Data.',
      icon: Zap,
    },
    {
      title: 'Финансовый инжиниринг & Банкинг',
      desc: 'Создание инновационных методов оценки кредитного скоринга, анализ децентрализованных систем и банковских продуктов в Республике Беларусь.',
      icon: Star,
    },
    {
      title: 'Экологический менеждмент',
      desc: 'Исследование циркулярной ("зеленой") экономики, расчеты карбонового следа и устойчивого развития промышленных гигантов страны.',
      icon: Heart,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 pb-16">
      {/* Dynamic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] opacity-35 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>Официальное сообщество • ФЭМ БГЭУ</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
            СТУДЕНЧЕСКОЕ НАУЧНОЕ ОБЩЕСТВО
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Добро пожаловать в СНО Факультета Экономики и Менеджмента БГЭУ! Мы объединяем талантливых будущих аналитиков, ученых и предпринимателей, готовых развивать экономическую мысль XXI века.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigateToTab('news')}
              className="px-5 py-3 bg-white text-indigo-950 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Посмотреть Ленту новостей</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-indigo-900" />
            </button>
            <button
              onClick={() => onNavigateToTab('faq')}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-indigo-300" />
              <span>Частые вопросы студентов (FAQ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Desk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow transition-shadow">
              <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <span>Направления наших исследований</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Наши участники регулярно проводят индивидуальные и групповые исследования на базе кафедр факультета, кооперируясь с ведущими докторами экономических наук Беларуси.
          </p>

          <div className="space-y-4">
            {directions.map((dir, idx) => {
              const Icon = dir.icon;
              return (
                <div key={idx} className="p-4 bg-slate-50 hover:bg-slate-100/60 rounded-2xl border border-slate-200/60 transition-all flex gap-3.5">
                  <div className="h-9 w-9 bg-white border border-slate-200 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850">{dir.title}</h4>
                    <p className="text-xs text-slate-550 leading-relaxed mt-1">{dir.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-b from-indigo-50/40 to-blue-50/20 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="p-1 px-2.5 bg-amber-50 text-amber-900 font-bold text-[10px] rounded-full uppercase border border-amber-100">Гайд участника</span>
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">Как вступить в ряды СНО ФЭМ?</h3>
            
            <div className="space-y-3 font-sans text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-md bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-800 shrink-0 font-mono mt-0.5">1</span>
                <span className="text-slate-655 font-medium leading-relaxed">Зарегистрируйте Ваш личный студенческий кабинет СНО по номеру зачетки.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-md bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-800 shrink-0 font-mono mt-0.5">2</span>
                <span className="text-slate-655 font-medium leading-relaxed">Подавайте заявки на грядущие конференции, круглые столы или олимпиады БГЭУ.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-md bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-800 shrink-0 font-mono mt-0.5">3</span>
                <span className="text-slate-655 font-medium leading-relaxed">Набирайте баллы рейтинга за научную работу и публикации в ВАК журналах.</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-sm space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Кабинет СНО ФЭМ БГЭУ</p>
            <p className="text-[11px] font-bold text-slate-800">Пр-т Партизанский, 26, корпус 4, каб. 9</p>
            <p className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors">sno.fem.bseu@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
