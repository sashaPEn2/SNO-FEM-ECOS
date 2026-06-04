import { useState, useEffect } from 'react';
import { ExemptionCertificate, StudentProfile } from '../types';
import { ShieldCheck, Search, FileText, Check, AlertTriangle, Calendar, Award, User, RefreshCw, Printer } from 'lucide-react';

interface VerificationSectionProps {
  certificates: ExemptionCertificate[];
  profile: StudentProfile;
}

export default function VerificationSection({ certificates, profile }: VerificationSectionProps) {
  const [searchCode, setSearchCode] = useState<string>('');
  const [verifiedCert, setVerifiedCert] = useState<ExemptionCertificate | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Read code from URL search param if present (e.g., from QR code link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('verify') || params.get('code');
    if (code) {
      setSearchCode(code);
      handleVerify(code);
    }
  }, []);

  const handleVerify = (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;
    setIsVerifying(true);
    setHasSearched(false);
    setVerifiedCert(null);

    setTimeout(() => {
      const match = certificates.find(
        (c) => c.verificationCode.toLowerCase() === codeToVerify.trim().toLowerCase() || c.id.toLowerCase() === codeToVerify.trim().toLowerCase()
      );
      setVerifiedCert(match || null);
      setHasSearched(true);
      setIsVerifying(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-1 sm:px-4">
      {/* Visual Header */}
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2.5">
          <ShieldCheck className="h-8 w-8 text-blue-900" />
          <span>Реестр и Верификация документов</span>
        </h1>
        <p className="text-slate-500 max-w-2xl text-sm leading-relaxed">
          Проверьте легитимность поданных заявлений на освобождение от учебных занятий. Деканат ФЭМ БГЭУ сверяет цифровые коды верификации по СНО-реестру участников.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Form Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Поиск по коду
            </h3>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500">
                Введите шифр или хэш-код документа:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="BSEU-EXEMPT-FEM-..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white text-slate-900 text-xs sm:text-sm transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify(searchCode);
                  }}
                />
              </div>

              <button
                onClick={() => handleVerify(searchCode)}
                disabled={isVerifying || !searchCode}
                className="w-full py-2.5 bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-semibold active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Поиск в базе данных...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Проверить подлинность</span>
                  </>
                )}
              </button>
            </div>

            {/* Micro instructions / Sample codes for ease of evaluation */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
              <span className="font-bold block text-slate-700">Быстрое тестирование:</span>
              {certificates.length === 0 ? (
                <p className="italic">В реестре пока нет заявлений. Приобретите заявление во вкладке «Обмен баллов СНО», чтобы получить код.</p>
              ) : (
                <div className="space-y-1.5">
                  <p>Нажмите на код ниже, чтобы подставить его для тестирования:</p>
                  <div className="flex flex-wrap gap-1">
                    {certificates.slice(0, 3).map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSearchCode(c.verificationCode);
                          handleVerify(c.verificationCode);
                        }}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-mono text-blue-900 truncate max-w-full"
                      >
                        Пример {i+1} ({c.id.split('-').pop()})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Result Display */}
        <div className="lg:col-span-2">
          {isVerifying ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-md flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent"></div>
              <p className="text-slate-600 font-medium text-sm">Обращение к криптографическому реестру выданных освобождений БГЭУ...</p>
            </div>
          ) : hasSearched ? (
            verifiedCert ? (
              /* FOUND - VALID CERTIFICATE SHEET */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-emerald-900 font-bold text-sm">Документ успешно верифицирован!</h4>
                    <p className="text-emerald-700 text-xs mt-0.5">
                      Настоящий бланк-заявление зарегистрирован в СНО ФЭМ БГЭУ под номером <b className="font-mono text-emerald-900">{verifiedCert.id}</b> и является действительным.
                    </p>
                  </div>
                </div>

                {/* Formal statement duplicate rendered beautifully */}
                <div className="bg-[#fcfbf9]/95 text-black border border-amber-900/10 p-6 sm:p-10 shadow-lg relative overflow-hidden font-serif rounded-2xl">
                  {/* Watermark logo */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] select-none pointer-events-none text-center">
                    <div className="text-6xl font-sans font-extrabold tracking-widest text-slate-900">БГЭУ</div>
                    <div className="text-[10px] font-sans font-bold tracking-wider mt-1">ФАКУЛЬТЕТ ЭКОНОМИКИ И МЕНЕДЖМЕНТА</div>
                  </div>

                  {/* Document header right aligned */}
                  <div className="ml-auto w-full sm:w-[68%] text-left text-xs leading-relaxed text-black font-serif mb-8 space-y-0.5">
                    <div>Декану факультета</div>
                    <div>экономики и менеджмента</div>
                    <div className="font-bold">Петриченко Е. В.</div>
                    <div className="pt-0.5">
                      студента(ки) <span className="border-b border-black font-sans font-semibold px-2 text-blue-900">{verifiedCert.course || 3}</span> курса ФЭМ
                    </div>
                    <div>
                      группы <span className="border-b border-black font-sans font-semibold px-3 text-blue-900">{verifiedCert.studentGroup}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">дневной формы обучения высшего образования</div>
                    <div className="py-0.5">
                      на {verifiedCert.isBudget !== false ? 'бюджетной' : 'платной'} основе
                    </div>
                    <div className="pt-1">
                      <div className="border-b border-black font-sans font-bold text-blue-950 px-2 text-center text-xs pb-0.5">
                        {verifiedCert.studentName}
                      </div>
                    </div>
                  </div>

                  {/* Letter Title */}
                  <div className="text-center my-6 text-black font-serif text-md tracking-wide lowercase italic font-bold">
                    заявление.
                  </div>

                  {/* Body Text */}
                  <div className="text-slate-900 leading-wider text-xs sm:text-sm text-justify space-y-4">
                    <p style={{ textIndent: '1.5rem' }}>
                      Прошу пропуски занятий с{' '}
                      <span className="border-b border-black font-semibold text-blue-900 px-1">
                        {new Date(verifiedCert.targetExemptionDate).toLocaleDateString('ru-RU')}
                      </span>{' '}
                      по{' '}
                      <span className="border-b border-black font-semibold text-blue-900 px-1">
                        {new Date(verifiedCert.endDate || verifiedCert.targetExemptionDate).toLocaleDateString('ru-RU')}
                      </span>{' '}
                      считать по уважительной причине в связи с{' '}
                      <span className="border-b border-black italic font-sans text-blue-950 font-medium px-1">
                        {verifiedCert.reason}
                      </span>
                      .
                    </p>
                    <p className="text-xs font-serif text-slate-500 leading-tight">
                      Подтверждающие документы в комплекте: {verifiedCert.supportingDocs || 'Справка-рекомендация СНО ФЭМ БГЭУ №' + verifiedCert.id}
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-8 font-serif text-xs">
                    <div>
                      <div className="border-b border-black font-sans text-blue-900 font-semibold px-1 pb-0.5">
                        {verifiedCert.dateRequested} г.
                      </div>
                      <div className="text-[9px] text-slate-400 text-center font-sans mt-0.5">(дата)</div>
                    </div>
                    <div>
                      <div className="border-b border-black font-sans text-slate-400 italic px-4 pb-0.5">
                        /подписано заявителем/
                      </div>
                      <div className="text-[9px] text-slate-400 text-center font-sans mt-0.5">(подпись)</div>
                    </div>
                  </div>

                  {/* Verified Seal details block */}
                  <div className="mt-8 pt-4 border-t border-dashed border-slate-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[10px] text-slate-500">
                        <span className="text-emerald-700 font-bold block mb-0.5">✓ СНО ФЭМ БГЭУ ВЕРИФИКАЦИЯ ОК</span>
                        <span>Электронная подпись активна. Списано баллов СНО: {verifiedCert.pointsDeducted}</span>
                      </div>
                      
                      {/* Stamp render */}
                      <div className="relative h-14 w-14 rounded-full border border-dashed border-blue-900/50 flex items-center justify-center text-center opacity-75 shrink-0 select-none">
                        <div className="text-[4px] text-blue-900 font-extrabold uppercase scale-90">
                          БГЭУ СНО ФЭМ <br />
                          ДЛЯ СПРАВОК
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold tracking-wide transition-all"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Распечатать бланк</span>
                  </button>
                </div>
              </div>
            ) : (
              /* NOT FOUND - FAKE ALERT */
              <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-red-950 font-bold text-lg">Документ не верифицирован в СНО</h4>
                  <p className="text-red-700 text-sm max-w-md mx-auto">
                    Указанный код верификации или регистрационный номер не числятся в официальном реестре СНО ФЭМ БГЭУ. Такой бланк может являться фиктивным и отвергаться деканатом.
                  </p>
                </div>
              </div>
            )
          ) : (
            /* EMPTY STATE */
            <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-md text-center space-y-4 min-h-[300px] flex flex-col items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-slate-800 font-bold">Ожидание ввода проверочного кода</h4>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
                  Введите в форму слева уникальный хэш-код или регистрационный номер документа, указанный в нижней строчке бланка-заявления, чтобы сверить его подлинность.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ledger Journal List (Журнал всех выданных заявлений) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-slate-900 text-lg">
              Журнал-реестр выданных заявлений СНО
            </h3>
            <p className="text-slate-500 text-xs">
              Официальный публичный журнал учета электронно-регистрированных освобождений студентов факультета экономики и менеджмента.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-blue-900 text-[11px] font-bold uppercase tracking-wider shrink-0">
            Записей в реестре: {certificates.length}
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="h-10 w-10 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">Журнал пуст</p>
            <p className="text-xs max-w-xs mx-auto">В системе еще не совершался обмен баллов на официальные заявления.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Код / Номер</th>
                  <th className="py-3 px-4">Фио исследователя</th>
                  <th className="py-3 px-4">Дата прогула / освобождения</th>
                  <th className="py-3 px-4">Списано баллов</th>
                  <th className="py-3 px-4 text-center">Статус</th>
                  <th className="py-3 px-4 text-right">Экшн</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 space-y-0.5">
                      <span className="block">{c.id}</span>
                      <span className="text-[10px] text-slate-400 block font-normal truncate max-w-[120px]">{c.verificationCode}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {c.studentName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">{c.studentName}</span>
                          <span className="text-[10px] text-slate-400 block">{c.studentGroup} группа • {c.course || 3} курс {c.isBudget !== false ? '(бюджет)' : '(плат.)'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                        <span>
                          {new Date(c.targetExemptionDate).toLocaleDateString('ru-RU')}
                          {c.endDate && c.endDate !== c.targetExemptionDate && ` - ${new Date(c.endDate).toLocaleDateString('ru-RU')}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-blue-900" />
                        <span>-{c.pointsDeducted} СНО</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                        ✓ Верифицирован
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSearchCode(c.verificationCode);
                          handleVerify(c.verificationCode);
                          // Scroll to verify section smoothly
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-blue-900 hover:text-blue-950 hover:underline px-2 py-1"
                      >
                        Загрузить в бланк
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
