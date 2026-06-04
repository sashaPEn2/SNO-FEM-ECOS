import { useState, FormEvent } from 'react';
import { ShoppingBag, Calendar, CheckSquare, Sparkles, AlertTriangle, Printer, FileText, Check, ArrowRight } from 'lucide-react';
import { StudentProfile, ExemptionCertificate } from '../types';

interface StoreSectionProps {
  profile: StudentProfile;
  certificates: ExemptionCertificate[];
  onExchangeExemption: (certificate: Omit<ExemptionCertificate, 'id' | 'dateRequested' | 'verificationCode' | 'status'>) => void;
  onNavigateToTab: (tab: string) => void;
}

export const EXEMPTION_COST = 150;

export default function StoreSection({
  profile,
  certificates,
  onExchangeExemption,
  onNavigateToTab,
}: StoreSectionProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');

  // Exemption Form states
  const [targetDate, setTargetDate] = useState<string>('2026-06-08');
  const [endDate, setEndDate] = useState<string>('2026-06-08');
  const [course, setCourse] = useState<number>(profile.course || 3);
  const [isBudget, setIsBudget] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>('+375 (29) 111-22-33');
  const [supportingDocs, setSupportingDocs] = useState<string>('Официальная рекомендация-выписка СНО ФЭМ БГЭУ');
  const [reason, setReason] = useState<string>('Подготовка научного доклада к Международной конференции БГЭУ');
  const [customReason, setCustomReason] = useState<string>('');
  const [studentName, setStudentName] = useState<string>(profile.name);
  const [studentGroup, setStudentGroup] = useState<string>(profile.group);
  const [department, setDepartment] = useState<string>('Деканат факультета экономики и менеджмента БГЭУ');
  const [formError, setFormError] = useState<string>('');
  const [generatedCertificate, setGeneratedCertificate] = useState<ExemptionCertificate | null>(null);

  const reasonsList = [
    'Подготовка научного доклада к Международной конференции БГЭУ',
    'Оформление пакета тезисов для Республиканского конкурса научных работ студентов РБ',
    'Участие во всебелорусском экономическом форуме молодых ученых на базе ФЭМ',
    'Проведение прикладного исследования и сбор статистики в архиве НАН РБ',
    'Другая научно-исследовательская причина (укажите ниже)'
  ];

  const handleExchangeSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (profile.points < EXEMPTION_COST) {
      setFormError(`Недостаточно баллов. Стоимость освобождения — ${EXEMPTION_COST} баллов. У вас на балансе: ${profile.points} баллов.`);
      return;
    }

    if (!targetDate) {
      setFormError('Укажите конкретную дату начала освобождения');
      return;
    }

    if (!studentName.trim() || !studentGroup.trim()) {
      setFormError('Заполните ФИО и группу');
      return;
    }

    const finalReason = reason === 'Другая научно-исследовательская причина (укажите ниже)'
      ? (customReason.trim() || 'Проведение авторского научного исследования')
      : reason;

    const mockCertId = `CERT-BSEU-FEM-${Math.floor(Math.random() * 90000 + 10000)}`;
    const mockCode = `BSEU-EXEMPT-FEM-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${targetDate.replace(/-/g, '')}`;

    const finalDocs = supportingDocs.trim() || `Удостоверение научного актива СНО №${mockCertId}`;

    // Call callback to deduct points and add certificate to history
    onExchangeExemption({
      studentName,
      studentGroup,
      targetExemptionDate: targetDate,
      endDate: endDate || targetDate,
      course,
      isBudget,
      phone,
      supportingDocs: finalDocs,
      reason: finalReason,
      pointsDeducted: EXEMPTION_COST,
    });

    const newCert: ExemptionCertificate = {
      id: mockCertId,
      studentName,
      studentGroup,
      dateRequested: new Date().toLocaleDateString('ru-RU'),
      targetExemptionDate: targetDate,
      endDate: endDate || targetDate,
      course,
      isBudget,
      phone,
      supportingDocs: finalDocs,
      status: 'active',
      reason: finalReason,
      verificationCode: mockCode,
      pointsDeducted: EXEMPTION_COST,
    };

    setGeneratedCertificate(newCert);
    setFormError('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:bg-white print:text-black">
      {/* Tab toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight">
            Магазин СНО: Обмен Баллов
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans">
            Обменяй накопленные научные баллы на официальное освобождение от занятий за подписью деканата ФЭМ БГЭУ.
          </p>
        </div>

        <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl self-start">
          <button
            onClick={() => { setActiveTab('buy'); setGeneratedCertificate(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all ${
              activeTab === 'buy'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Оформить освобождение
          </button>
          <button
            onClick={() => { setActiveTab('history'); setGeneratedCertificate(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all relative ${
              activeTab === 'history'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Мои освобождения ({certificates.length})
          </button>
        </div>
      </div>

      {activeTab === 'buy' && !generatedCertificate && (
        <div className="grid gap-6 lg:grid-cols-3 print:hidden">
          {/* Price information card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-205 bg-gradient-to-br from-blue-900 to-indigo-900 p-6 text-white shadow-lg relative overflow-hidden">
              {/* Decorative nodes */}
              <div className="absolute top-0 right-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
              <div className="relative z-10 space-y-4">
                <ShoppingBag className="h-8 w-8 text-amber-400" />
                <div>
                  <h4 className="font-sans text-sm font-bold text-blue-200 uppercase tracking-widest leading-none">Стоимость privilege</h4>
                  <div className="flex items-baseline space-x-1.5 mt-2">
                    <span className="text-3xl font-mono font-extrabold tracking-tight text-white">{EXEMPTION_COST}</span>
                    <span className="text-xs font-semibold text-blue-200">баллов СНО</span>
                  </div>
                </div>

                <div className="h-px bg-white/10 my-3"></div>

                <div className="space-y-1">
                  <span className="text-[10px] text-blue-200 font-bold block uppercase leading-none">Ваш текущий баланс:</span>
                  <div className="flex items-center text-amber-300 font-bold text-sm">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    <span className="font-mono text-base">{profile.points} баллов</span>
                  </div>
                </div>

                {profile.points < EXEMPTION_COST ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Не хватает баллов</span>
                    </div>
                    <p className="text-[10px] text-amber-100/90 leading-normal">
                      Вам требуется еще <b>{EXEMPTION_COST - profile.points} баллов</b>. Проходите экономические викторины СНО или записывайтесь докладчиком на конференции БГЭУ!
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-400 mt-2 font-bold flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                    <span>Баллов достаточно для обмена!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty rules manual */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">Как это работает?</h4>
              <ul className="text-xs text-slate-600 space-y-2 pl-3 list-decimal font-sans">
                <li>Вы формируете заявку на освобождение на любой выбранный учебный день текущего семестра.</li>
                <li>Обязательно выбирается обоснование научной работы (подготовка к событию БГЭУ).</li>
                <li>Система вычитает 150 баллов СНО и генерирует уникальный бланк документа с QR-кодом верификации.</li>
                <li>Распечатанный или цифровой документ предъявляется в старостат/деканат ФЭМ БГЭУ. СНО гарантирует согласование.</li>
              </ul>
            </div>
          </div>

          {/* Builder form */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="font-display text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
              Параметры справки-освобождения
            </h4>

            <form onSubmit={handleExchangeSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    ФИО Студента (Родительный падеж):
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="Парфенович Дарьи Андреевны"
                  />
                  <span className="text-[10px] text-slate-400 block font-medium leading-none">
                    Например: заявление студент(а)ки ... [кого]
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Академическая группа:
                  </label>
                  <input
                    type="text"
                    required
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="ДНЗ-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Курс обучения:
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                  >
                    <option value={1}>1 курс</option>
                    <option value={2}>2 курс</option>
                    <option value={3}>3 курс</option>
                    <option value={4}>4 курс</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Финансирование обучения:
                  </label>
                  <div className="flex gap-4 p-2">
                    <label className="inline-flex items-center text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="isBudget"
                        checked={isBudget === true}
                        onChange={() => setIsBudget(true)}
                        className="mr-2 text-blue-900 focus:ring-0"
                      />
                      на бюджетной основе
                    </label>
                    <label className="inline-flex items-center text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="isBudget"
                        checked={isBudget === false}
                        onChange={() => setIsBudget(false)}
                        className="mr-2 text-blue-900 focus:ring-0"
                      />
                      на платной основе
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Дата начала освобождения (С):
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => {
                      setTargetDate(e.target.value);
                      if (endDate < e.target.value) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Дата окончания освобождения (ПО):
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={targetDate}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Номер мобильного телефона:
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="+375 (29) 111-22-33"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Орган согласования (Деканат):
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-600 p-2.5 text-xs sm:text-sm cursor-not-allowed outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Научно-исследовательское обоснование:
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setCustomReason(''); }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                  >
                    {reasonsList.map((item, i) => (
                      <option key={i} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Подтверждающие документы:
                  </label>
                  <input
                    type="text"
                    required
                    value={supportingDocs}
                    onChange={(e) => setSupportingDocs(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs sm:text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="Например: Справка-рекомендация СНО ФЭМ БГЭУ №12-А"
                  />
                </div>
              </div>

              {reason === 'Другая научно-исследовательская причина (укажите ниже)' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                    Уточните научно-исследовательскую причину:
                  </label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs lg:text-sm focus:border-blue-900 focus:outline-none"
                    placeholder="Например: Проведение библиотечного обзора для дипломной работы"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={profile.points < EXEMPTION_COST}
                  className="w-full sm:w-auto rounded-xl bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-amber-500 text-white font-extrabold text-xs sm:text-sm py-3 px-6 transition-all shadow-md shadow-amber-600/10 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  <span>Обменять на Справку (150 баллов)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exemption formal certificate rendering sheet */}
      {generatedCertificate && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 print:hidden justify-center font-bold font-sans">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Сделка проведена! 150 баллов списано. Ниже представлен готовый документ.</span>
          </div>

          <div className="bg-[#fcfbf9]/95 text-black border border-amber-900/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden font-serif max-w-full print:bg-white print:border-none print:shadow-none print:p-0 rounded-2xl">
            {/* Subtle grid paper pattern only visible on screen */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] print:hidden"></div>

            {/* Right-aligned Header block (Shapka) */}
            <div className="ml-auto w-full sm:w-[65%] text-left text-xs sm:text-sm leading-relaxed text-black font-serif mb-12 space-y-1">
              <div>Декану факультета</div>
              <div>экономики и менеджмента</div>
              <div className="font-bold pb-1">Петриченко Е. В.</div>
              <div className="pt-1">
                студент(а)ки <span className="inline-block border-b border-black font-sans font-semibold text-blue-900 px-2 min-w-[30px] text-center">{generatedCertificate.course || 3}</span> курса ФЭМ
              </div>
              <div className="pt-1">
                группы <span className="inline-block border-b border-black font-sans font-semibold text-blue-900 px-3 min-w-[100px] text-center">{generatedCertificate.studentGroup}</span>
              </div>
              <div className="text-xs text-zinc-600 pt-1">дневной формы получения высшего</div>
              <div className="text-xs text-zinc-600">образования I ступени</div>
              <div className="py-1">
                на{' '}
                <span className={generatedCertificate.isBudget !== false ? 'underline decoration-black decoration-2 font-semibold text-blue-900 px-1' : 'line-through text-slate-400 px-1'}>
                  бюджетной основе
                </span>
                {' '}/{' '}
                <span className={generatedCertificate.isBudget === false ? 'underline decoration-black decoration-2 font-semibold text-blue-900 px-1' : 'line-through text-slate-400 px-1'}>
                  на платной основе
                </span>
              </div>
              <div className="pt-2">
                <div className="border-b border-black font-sans font-bold text-blue-950 px-2 pb-0.5 text-center leading-tight">
                  {generatedCertificate.studentName}
                </div>
                <div className="text-[9px] text-slate-500 text-center font-sans mt-0.5">
                  (фамилия, инициалы в родительном падеже)
                </div>
              </div>
              <div className="pt-1.5 flex items-baseline">
                <span className="shrink-0">моб. тел.</span>
                <span className="w-full border-b border-black font-sans font-medium text-blue-900 px-2">
                  {generatedCertificate.phone || '+375 (__) ___-__-__'}
                </span>
              </div>
            </div>

            {/* Document Title "заявление." */}
            <div className="text-center my-8 text-black font-serif text-lg tracking-wide lowercase italic font-bold">
              заявление.
            </div>

            {/* Body text */}
            <div className="text-slate-900 leading-[2.2] text-sm sm:text-base space-y-6 font-serif text-justify">
              <p style={{ textIndent: '2rem' }}>
                Прошу пропуски занятий с{' '}
                <span className="inline-block border-b border-black font-sans font-bold px-2 text-blue-900 min-w-[100px] text-center">
                  {new Date(generatedCertificate.targetExemptionDate).toLocaleDateString('ru-RU')}
                </span>{' '}
                по{' '}
                <span className="inline-block border-b border-black font-sans font-bold px-2 text-blue-900 min-w-[100px] text-center">
                  {new Date(generatedCertificate.endDate || generatedCertificate.targetExemptionDate).toLocaleDateString('ru-RU')}
                </span>{' '}
                считать по уважительной причине в связи с{' '}
                <span className="inline-block border-b border-black font-sans font-medium text-blue-950 px-1 min-w-[150px] leading-tight select-all text-center">
                  {generatedCertificate.reason}
                </span>
                .
              </p>

              <div className="pt-4 space-y-1">
                <div>Подтверждающие документы прилагаю:</div>
                <div className="border-b border-black font-sans text-xs text-blue-900 pb-1 min-h-[24px]">
                  {generatedCertificate.supportingDocs || 'Справка-рекомендация СНО ФЭМ БГЭУ №' + generatedCertificate.id}
                </div>
                <div className="border-b border-black h-6"></div>
              </div>
            </div>

            {/* Bottom fields (date and signature) */}
            <div className="flex justify-between items-end pt-14 font-serif text-xs sm:text-sm">
              <div className="text-center w-[40%]">
                <div className="border-b border-black pb-1 font-sans text-blue-900 font-semibold min-h-[22px]">
                  {generatedCertificate.dateRequested || new Date().toLocaleDateString('ru-RU')} г.
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">(дата)</div>
              </div>

              <div className="text-center w-[40%]">
                <div className="border-b border-black pb-1 font-mono italic text-blue-900 font-bold min-h-[22px]">
                  /подпись заявителя/
                </div>
                <div className="text-[10px] text-slate-500 font-sans mt-1">(подпись заявителя)</div>
              </div>
            </div>

            {/* Verified Digital Seal with Divider representing SNO authentication */}
            <div className="mt-12 pt-8 border-t border-dashed border-slate-300 print:border-slate-400">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Digital Signature seal representation */}
                <div className="space-y-2 max-w-sm text-center sm:text-left">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider inline-block">
                    ✓ Верифицировано СНО ФЭМ
                  </span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Накопленный академический рейтинг студента верифицирован СНО ФЭМ БГЭУ.
                    Списано <b className="font-mono text-slate-800">{generatedCertificate.pointsDeducted} баллов СНО</b>.
                  </p>
                </div>

                {/* Stamp and QR code */}
                <div className="flex items-center gap-6 shrink-0 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  {/* Simulated round official Stamp */}
                  <div className="relative h-20 w-20 rounded-full border-2 border-dashed border-blue-900/40 flex items-center justify-center p-1 text-center font-sans tracking-tight opacity-80 shrink-0 select-none">
                    <div className="absolute inset-0.5 rounded-full border border-blue-900/10"></div>
                    <div className="text-[6px] text-blue-900 font-extrabold leading-normal uppercase">
                      БГЭУ СНО ФЭМ <br />
                      * ДЛЯ * <br />
                      СПРАВОК * <br />
                      МИНСК
                    </div>
                  </div>

                  {/* Real, active QR code linking directly to the real-time registration verification page! */}
                  <div className="flex flex-col items-center justify-center text-center bg-white p-1.5 rounded-xl border border-slate-100 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        window.location.origin + '?verify=' + generatedCertificate.verificationCode
                      )}`}
                      alt="QR Code Verification Link"
                      className="h-14 w-14 object-contain shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[8px] text-slate-500 font-mono font-bold uppercase block mt-1">Код: {generatedCertificate.id.split('-').pop()}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center space-x-2 rounded-xl border border-slate-200 py-3 px-5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Распечатать Справку</span>
            </button>
            <button
              onClick={() => {
                setGeneratedCertificate(null);
                setActiveTab('history');
              }}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 text-xs transition-colors shadow cursor-pointer"
            >
              Перейти в историю справок
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && !generatedCertificate && (
        <div className="space-y-4 print:hidden">
          {certificates.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl bg-slate-50 space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 text-sm font-medium">
                Вы еще не оформляли освобождения на этот семестр.
              </p>
              <button
                onClick={() => setActiveTab('buy')}
                className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
              >
                Оформить первую справку за 150 баллов СНО
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Код: {cert.id}</span>
                      <span className="text-slate-500 font-semibold">{cert.dateRequested}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100">
                        Освобождение
                      </span>
                      <h4 className="font-sans text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                        На день: {new Date(cert.targetExemptionDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 italic font-sans">
                      «{cert.reason}»
                    </p>
                  </div>

                  <div className="border-t border-slate-100/80 pt-3 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setGeneratedCertificate(cert)}
                      className="text-xs font-bold text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Открыть бланк</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Списано: <b>{cert.pointsDeducted} баллов</b>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
