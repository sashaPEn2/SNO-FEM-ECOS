import React, { useState } from 'react';
import { HelpCircle, Terminal, CheckCircle, RefreshCw, Key, Shield, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpDeskSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mt-6 border border-amber-250 bg-amber-50/40 rounded-2xl overflow-hidden shadow-sm transition-all text-slate-800">
      {/* Header section toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-amber-50 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
            <HelpCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-amber-900 leading-snug">
              Нужна помощь в настройке? Раздел «HelpDesk СНО»
            </h3>
            <p className="text-[10px] sm:text-xs text-amber-700/80 mt-0.5">
              Инструкция для Актива СНО: Устранение ошибки <code className="bg-amber-100 px-1 py-0.2 rounded font-mono text-[9px] text-amber-950 font-bold">auth/operation-not-allowed</code>
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-amber-700 font-bold shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-amber-700 font-bold shrink-0" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-amber-200/50 bg-white/75 text-xs text-slate-700 space-y-4 font-sans select-text">
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-semibold text-[11px] text-indigo-900">
            💡 <b className="uppercase">Причина ошибки:</b> Если при входе или регистрации вы видите ошибку <code className="bg-red-50 text-red-700 font-mono text-[10px] px-1 rounded border border-red-200">auth/operation-not-allowed</code>, это означает, что выбранный метод авторизации (Email/Пароль или Google) отключен в вашей панели управления Firebase.
          </div>

          <div className="space-y-3">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span>Пошаговое руководство для исправления:</span>
            </p>

            <ol className="space-y-3 pl-1 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-[10px] mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-[11.5px]">Перейдите в консоль Firebase</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Откройте панель вашего облачного проекта в консоли Google:{' '}
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-900 font-bold hover:underline"
                    >
                      console.firebase.google.com
                    </a>
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-[10px] mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-[11.5px]">Откройте раздел Authentication</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    В левом боковом меню перейдите по пути: <b>Сборка (Build) &rarr; Authentication</b>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-[10px] mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-[11.5px]">Вкладка «Метод входа» (Sign-in method)</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Нажмите на верхнюю вкладку <b>«Sign-in method»</b> (Метод аутентификации пользователей).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-[10px] mt-0.5">
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-[11.5px]">Включите Email/Password и Google</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                    Найдите нужного провайдера в списке:
                    <br />
                    • Для входа по зачетке: нажмите на <b>Email/Password</b>, переведите ползунок <b>Enable (Включить)</b> в активное положение и нажмите <b>«Сохранить»</b>.
                    <br />
                    • Для входа в 1 клик: аналогично откройте <b>Google</b>, нажмите <b>Enable</b>, выберите почту технической поддержки вашего проекта из выпадающего списка и сохраните изменения.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold flex items-center justify-center text-[10px] mt-0.5">
                  5
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-[11.5px]">Обновите приложение СНО ФЭМ</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Перезагрузите текущую страницу во вкладке вашего браузера и попробуйте авторизоваться снова. Ошибка исчезнет!
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-50/60 p-3 rounded-xl border border-emerald-250 text-slate-700 leading-normal font-sans">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0" />
            <div>
              <p className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wide">Режим Песочницы всегда доступен!</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Если у вас нет доступа к консоли Firebase проекта, вы можете просто включить внизу страницы тумблер <b>«Интерактивная песочница»</b> для мгновенного тестирования всех функций в локальной СНО ФЭМ!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
