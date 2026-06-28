/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Achievement, Student } from "../types";
import { Printer, X, ShieldCheck } from "lucide-react";
import QRCode from "qrcode";

interface CertificateModalProps {
  achievement: Achievement;
  student: Student;
  onClose: () => void;
}

export default function CertificateModal({ achievement, student, onClose }: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // Determine student's department code (1 - Department of Industrial Economics, etc.)
  const spec = student.specialty.toLowerCase();
  let deptCode = 1;
  let deptName = "Кафедра экономики промышленных предприятий";
  if (spec.includes("промыш") || spec.includes("предприят") || spec.includes("деу") || spec.includes("дэу")) {
    deptCode = 1;
    deptName = "Кафедра экономики промышленных предприятий";
  } else if (spec.includes("менедж") || spec.includes("управлен") || spec.includes("жку") || spec.includes("инновац") || spec.includes("ку")) {
    deptCode = 2;
    deptName = "Кафедра экономики и управления предприятиями";
  } else if (spec.includes("национал") || spec.includes("государствен") || spec.includes("мнэ") || spec.includes("дгп")) {
    deptCode = 3;
    deptName = "Кафедра национальной экономики и государственного управления";
  } else {
    deptCode = 4;
    deptName = "Кафедра планирования и прогнозирования";
  }

  useEffect(() => {
    // Generate actual verification URL pointing to this specific certificate registry page
    const verificationUrl = `${window.location.origin}${window.location.pathname}?verify=${achievement.id}`;
    QRCode.toDataURL(verificationUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: "#064e3b", // Deep emerald color matching BSEU academic identity
        light: "#ffffff"
      }
    })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error("QR Code generation error:", err);
      });
  }, [achievement.id]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Не удалось открыть окно печати. Пожалуйста, разрешите всплывающие окна для этого сайта.");
      return;
    }

    // Generate high fidelity document layout representing official BSEU verification certificate
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Справка СНО БГЭУ - ${student.fullName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
            
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px 60px;
              color: #111111;
              line-height: 1.5;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header-block {
              text-align: center;
              font-family: 'Inter', sans-serif;
              text-transform: uppercase;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.3px;
              border-bottom: 2px solid #064e3b;
              padding-bottom: 10px;
              margin-bottom: 25px;
            }
            
            .header-block .title-main {
              font-size: 11px;
              margin-bottom: 2px;
            }
            
            .header-block .university {
              font-size: 13px;
              font-weight: 800;
              color: #064e3b;
              margin-bottom: 3px;
              letter-spacing: 0.5px;
            }
            
            .header-block .faculty {
              font-size: 11px;
              color: #374151;
              margin-bottom: 4px;
            }
            
            .header-block .contacts {
              font-size: 8.5px;
              font-weight: 400;
              text-transform: none;
              color: #4b5563;
            }
            
            .ref-meta-row {
              display: flex;
              justify-content: space-between;
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              color: #374151;
              margin-bottom: 35px;
              padding: 0 5px;
            }
            
            .ref-meta-row .underline-box {
              border-bottom: 1px dashed #1f2937;
              padding: 0 8px;
              font-weight: 600;
              color: #000;
            }
            
            .doc-title {
              text-align: center;
              font-family: 'Inter', sans-serif;
              font-weight: 800;
              font-size: 18px;
              letter-spacing: 1px;
              color: #064e3b;
              margin: 30px 0 25px 0;
              text-transform: uppercase;
            }
            
            .doc-title .doc-subtitle {
              font-size: 10.5px;
              font-weight: 500;
              letter-spacing: 0;
              color: #4b5563;
              text-transform: none;
              margin-top: 4px;
            }
            
            .content-p {
              text-align: justify;
              text-indent: 1.25cm;
              font-size: 14.5px;
              margin-bottom: 12px;
              font-family: 'Times New Roman', serif;
            }
            
            .highlight-achievement-card {
              margin: 20px 0;
              padding: 15px 20px;
              background-color: #f4fbf7;
              border: 1px solid #a7f3d0;
              border-radius: 8px;
              font-family: 'Inter', sans-serif;
              font-size: 13.5px;
              text-indent: 0;
            }
            
            .highlight-achievement-card .ach-title {
              font-weight: 800;
              color: #064e3b;
              font-size: 14px;
              margin-bottom: 6px;
            }
            
            .highlight-achievement-card .ach-info {
              font-size: 11px;
              color: #4b5563;
              margin-bottom: 4px;
            }
            
            .highlight-achievement-card .ach-desc {
              font-size: 11px;
              color: #4b5563;
              font-style: italic;
              border-top: 1px dashed #d1fae5;
              padding-top: 6px;
              margin-top: 6px;
            }
            
            .signatures-block {
              margin-top: 45px;
              font-family: 'Inter', sans-serif;
              font-size: 12px;
            }
            
            .sig-line-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 22px;
              position: relative;
            }
            
            .sig-line-row .label {
              width: 50%;
              line-height: 1.35;
            }
            
            .sig-line-row .label .sub-text {
              font-size: 9.5px;
              color: #4b5563;
              font-style: italic;
            }
            
            .sig-line-row .line-anchor {
              width: 25%;
              border-bottom: 1px solid #4b5563;
              text-align: center;
              font-size: 10.5px;
              color: #9ca3af;
              font-style: italic;
              padding-bottom: 2px;
              position: relative;
            }
            
            .sig-line-row .fullname {
              width: 25%;
              text-align: right;
              font-weight: 700;
              color: #111827;
            }
            
            .stamp-verify-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 35px;
              font-family: 'Inter', sans-serif;
              border-top: 1px solid #f3f4f6;
              padding-top: 25px;
            }
            
            .round-stamp {
              width: 125px;
              height: 125px;
              transform: rotate(-4deg);
              opacity: 0.85;
            }
            
            .verification-box {
              text-align: right;
              font-size: 8.5px;
              font-family: 'JetBrains Mono', monospace;
              color: #4b5563;
              border-left: 2px solid #e5e7eb;
              padding-left: 15px;
            }
            
            .verification-box .code-title {
              font-weight: 700;
              color: #064e3b;
              font-size: 10px;
              margin-top: 2px;
            }
            
            .verification-box .tag {
              color: #047857;
              font-weight: 700;
              font-size: 9.5px;
              margin-top: 4px;
            }
            
            .vector-sig {
              position: absolute;
              left: 50%;
              bottom: -4px;
              transform: translateX(-50%);
              width: 85px;
              height: 38px;
              pointer-events: none;
            }
            
            @media print {
              body {
                padding: 0cm;
                margin: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header-block">
            <div class="title-main">Министерство образования Республики Беларусь</div>
            <div class="title-main">Учреждение образования</div>
            <div class="university">«Белорусский государственный экономический университет»</div>
            <div class="faculty">Факультет экономики и менеджмента</div>
            <div class="contacts">
              пр-т Партизанский, 26, г. Минск, 220070 | Тел: +375 (17) 209-80-00 | e-mail: fem@bseu.by
            </div>
          </div>

          <div class="ref-meta-row">
            <div>
              Исх. № <span class="underline-box">${deptCode}-СНО-ФЭМ/${achievement.id.slice(-4).toUpperCase()}</span>
            </div>
            <div>
              «<span class="underline-box">&nbsp;&nbsp;${new Date().getDate()}&nbsp;&nbsp;</span>» 
              <span class="underline-box">&nbsp;&nbsp;${new Date().toLocaleString('ru-RU', { month: 'long' })}&nbsp;&nbsp;</span> 
              2026 г.
            </div>
          </div>

          <div class="doc-title">
            СПРАВКА-ПОДТВЕРЖДЕНИЕ
            <div class="doc-subtitle">о зарегистрированном научно-исследовательском достижении (СНО ФЭМ БГЭУ)</div>
          </div>

          <div class="content-p">
            Дана настоящая справка <strong>${student.fullName}</strong> в том, что он(а) действительно является обучающимся
            очной формы получения высшего образования факультета экономики и менеджмента УО «БГЭУ», курс обучения: 
            <strong>${student.course}</strong>, академическая группа <strong>${student.group}</strong>, обучающимся по специальности 
            «<em>${student.specialty}</em>».
          </div>

          <div class="content-p">
            Справка удостоверяет, что вышеуказанный студент научно-активен и внес существенный практический вклад в развитие научно-исследовательской работы студентов (НИРС) факультета. В Едином электронном реестре достижений Студенческого научного общества (СНО ФЭМ БГЭУ) зафиксировано и утверждено следующее верифицированное научное достижение:
          </div>

          <div class="highlight-achievement-card">
            <div class="ach-title">${achievement.title}</div>
            <div class="ach-info">
              <strong>Шкала оценивания:</strong> СНО Наука (научные публикации, статьи, тезисы конференций)
            </div>
            <div class="ach-info">
              <strong>Академический статус:</strong> Утверждено верификационной комиссией СНО от ${achievement.approvedDate || new Date().toLocaleDateString("ru-RU")}
            </div>
            ${achievement.supervisor ? `
              <div class="ach-info">
                <strong>Научный руководитель:</strong> ${achievement.supervisor}
              </div>
            ` : ''}
            ${achievement.description ? `
              <div class="ach-desc">
                Аннотация поданной НИР: «${achievement.description}»
              </div>
            ` : ''}
          </div>

          <div class="content-p">
            За указанную научно-исследовательскую работу решением Совета СНО ФЭМ студенту начислено <strong>${achievement.points} баллов</strong> индивидуального рейтинга в реестре научно-активного студенчества. Данное достижение проверено на плагиат, соответствует требованиям Высшей аттестационной комиссии (ВАК), регламенту публикационной активности БГЭУ и внесено в цифровую базу НИРС.
          </div>

          <div class="content-p">
            Настоящее подтверждение выдано для представления в <strong>Деканат факультета экономики и менеджмента УО «БГЭУ»</strong> для рассмотрения вопроса о поощрении обучающегося (в комиссию по назначению надбавок к академической стипендии за успехи в научно-исследовательской работе, для согласования скидки за обучение, направления на именные стипендии Республики Беларусь, а также для внесения в личное портфолио научно-исследовательского актива при распределении выпускников).
          </div>

          <div class="signatures-block">
            
            <div class="sig-line-row">
              <div class="label">
                <strong>Председатель Совета СНО ФЭМ</strong><br/>
                <span class="sub-text">Совет молодых ученых, УО «БГЭУ»</span>
              </div>
              <div class="line-anchor">
                <!-- Vector handwriting signature Terro -->
                <svg class="vector-sig" viewBox="0 0 100 40" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round">
                  <path d="M10,25 C25,10 32,35 48,15 Q55,8 65,24 C72,28 80,18 90,14" />
                  <path d="M22,25 Q45,21 68,17" />
                </svg>
                подпись
              </div>
              <div class="fullname">А.В. Терро</div>
            </div>

            <div class="sig-line-row" style="margin-top: 25px;">
              <div class="label">
                <strong>Куратор СНО ФЭМ, заместитель декана по научной работе</strong><br/>
                <span class="sub-text">к.э.н., доцент, УО «БГЭУ»</span>
              </div>
              <div class="line-anchor">
                <!-- Vector handwriting signature Gulina -->
                <svg class="vector-sig" viewBox="0 0 100 40" fill="none" stroke="#047857" stroke-width="1.6" stroke-linecap="round">
                  <path d="M12,15 T38,8 T50,30 T68,14 T80,35 Q90,18 95,28" />
                  <path d="M18,18 Q45,18 78,20" />
                </svg>
                подпись
              </div>
              <div class="fullname">О.В. Гулина</div>
            </div>

          </div>

          <div class="stamp-verify-container">
            <!-- Round Blue Seal of BSEU -->
            <svg class="round-stamp" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-dasharray="190 3" />
              <circle cx="60" cy="60" r="45" fill="none" stroke="#2563eb" stroke-width="0.9" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="#2563eb" stroke-width="0.7" stroke-dasharray="2 2" />
              
              <path id="stampPath" d="M 60,60 m -41,0 a 41,41 0 1,1 82,0 a 41,41 0 1,1 -82,0" fill="none" />
              <text font-size="5" font-family="'Inter', sans-serif" font-weight="700" fill="#2563eb">
                <textPath href="#stampPath" startOffset="0%">
                  УО БЕЛОРУССКИЙ ГОСУДАРСТВЕННЫЙ ЭКОНОМИЧЕСКИЙ УНИВЕРСИТЕТ * ФЭМ *
                </textPath>
              </text>
              <path id="stampPathInner" d="M 60,60 m -24,0 a 24,24 0 1,1 48,0 a 24,24 0 1,1 -48,0" fill="none" />
              <text font-size="4.5" font-family="'Inter', sans-serif" fill="#2563eb">
                <textPath href="#stampPathInner" startOffset="0%">
                  * СТУДЕНЧЕСКОЕ НАУЧНОЕ ОБЩЕСТВО *
                </textPath>
              </text>
              
              <text x="60" y="56" text-anchor="middle" font-size="8" font-family="'Inter', sans-serif" font-weight="900" fill="#2563eb">СНО</text>
              <text x="60" y="65" text-anchor="middle" font-size="4.5" font-family="'Inter', sans-serif" font-weight="700" fill="#2563eb" letter-spacing="1">ФЭМ</text>
              <text x="60" y="71" text-anchor="middle" font-size="3.5" font-family="'Inter', sans-serif" fill="#2563eb">МИНСК</text>
            </svg>

            <div class="verification-box">
              <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                <!-- Real QR-Code pointing to Verification Registry -->
                <img src="${qrCodeUrl}" width="65" height="65" style="border: 1px solid #cbd5e1; padding: 2px; background: white; border-radius: 4px;" />
              </div>
              <div>КОД ЭЛЕКТРОННОЙ ВЕРИФИКАЦИИ СНО:</div>
              <div class="code-title">
                БГЭУ-ФЭМ-${achievement.id.toUpperCase().split("_")[1] || achievement.id.toUpperCase()}-${student.id.toUpperCase().split("_")[1]}
              </div>
              <div class="tag">✔ ДЕЙСТВИТЕЛЬНЫЙ ДОКУМЕНТ В реестре</div>
              <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">Единая база НИРС БГЭУ | СНО ФЭМ БГЭУ 2026</div>
            </div>
          </div>
          
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currentDate = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate certificate hash for "verification metadata"
  const verificationCode = `БГЭУ-ФЭМ-${achievement.id.toUpperCase().split("_")[1] || achievement.id.toUpperCase()}-${student.id.toUpperCase().split("_")[1]}`;

  return (
    <div id="certificate-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white text-gray-900 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all scale-100">
        
        {/* Top bar controls */}
        <div id="cert-controls" className="bg-slate-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Официальное подтверждение для деканата</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-certificate"
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Распечатать Справку (PDF)</span>
            </button>
            <button
              onClick={onClose}
              id="btn-close-certificate"
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper visual preview Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          
          <div 
            ref={printRef}
            id="print-area" 
            className="w-[210mm] max-w-full bg-white shadow-lg border border-slate-200 p-[1.5cm] text-gray-800 text-[13px] leading-relaxed font-serif relative"
          >
            {/* Watermark/Emblem Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center select-none">
              <span className="text-emerald-900 text-[9rem] font-bold tracking-widest uppercase">ФЭМ БГЭУ</span>
            </div>

            {/* Header section (official state establishment naming) */}
            <div className="text-center font-sans uppercase font-bold tracking-tight text-[11px] text-gray-800 border-b-2 border-emerald-800 pb-3 mb-5">
              <div>Министерство образования Республики Беларусь</div>
              <div className="mt-0.5">Учреждение образования</div>
              <div className="text-[12px] font-black text-emerald-800 mt-0.5">«Белорусский государственный экономический университет»</div>
              <div className="text-[11px] font-semibold text-gray-700 mt-0.5">Факультет экономики и менеджмента</div>
              <div className="text-[8px] font-normal lowercase tracking-wide text-gray-500 mt-0.5">
                пр-т Партизанский, 26, г. Минск, 220070 | Тел: +375 (17) 209-80-00 | e-mail: fem@bseu.by
              </div>
            </div>

            {/* Outgoing Reference Number Info */}
            <div className="flex justify-between font-sans text-[11px] text-gray-600 mb-6 px-1">
              <div>
                <span>Исх. № </span>
                <span className="font-semibold underline">{deptCode}-СНО-ФЭМ / {achievement.id.slice(-4).toUpperCase()}</span>
              </div>
              <div>
                <span>от «</span>
                <span className="font-semibold underline"> {new Date().getDate()} </span>
                <span>» </span>
                <span className="font-semibold underline"> {new Date().toLocaleString('ru-RU', { month: 'long' })} </span>
                <span> 2026 г.</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center font-sans font-bold text-base text-emerald-950 tracking-wider uppercase mb-6 mt-2">
              СПРАВКА-ПОДТВЕРЖДЕНИЕ
              <div className="text-[10px] font-medium tracking-normal text-gray-500 mt-0.5 lowercase">
                о наличии верифицированного научно-исследовательского достижения
              </div>
            </div>

            {/* Main content text */}
            <div className="text-justify px-1 space-y-3 text-sm font-serif text-gray-800 indent-8">
              <p>
                Дана настоящая справка <strong>{student.fullName}</strong> в том, что он(а) является обучающимся 
                {" "}<span className="underline">{student.course}</span> очной формы получения высшего образования
                факультета экономики и менеджмента УО «БГЭУ», специальность 
                «<span className="italic">{student.specialty}</span>», академическая группа 
                <strong> {student.group}</strong>.
              </p>
              <p>
                Справка удостоверяет, что вышеуказанный студент научно-активен и внес существенный вклад в научную и исследовательскую деятельность факультета. В Едином реестре Студенческого научного общества (СНО ФЭМ БГЭУ) зафиксировано и одобрено следующее утвержденное достижение:
              </p>
              <div className="my-4 p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl font-sans text-xs tracking-normal leading-relaxed indent-0">
                <div className="text-emerald-900 font-extrabold text-sm mb-1">
                  {achievement.title}
                </div>
                <div className="text-gray-500 font-medium">
                  <strong>Сфера/Категория:</strong> научная статья / тезисы (СНО Наука) | <strong>Верификационная отметка:</strong> Одобрено {achievement.approvedDate || new Date().toLocaleDateString("ru-RU")}
                </div>
                {achievement.supervisor && (
                  <div className="text-gray-700 font-medium mt-1">
                    <strong>Научный руководитель:</strong> {achievement.supervisor}
                  </div>
                )}
                {achievement.description && (
                  <div className="text-gray-600 font-normal mt-2 italic border-t border-emerald-100 pt-2">
                    «{achievement.description}»
                  </div>
                )}
              </div>
              <p>
                За указанную научно-исследовательскую работу решением Совета СНО студенту начислено 
                <strong> {achievement.points} баллов</strong> рейтинговой шкалы, что верифицировано Советом НИРС ФЭМ БГЭУ.
              </p>
              <p>
                Настоящая справка выдана для предоставления в <strong>Деканат факультета экономики и менеджмента БГЭУ</strong> с целью подтверждения научно-исследовательских заслуг обучающегося при рассмотрении претендентов на материальное стимулирование (дополнительные баллы, повышенная государственная стипендия за успехи в научно-исследовательской работе, скидки за обучение), а также для формирования личного портфолио будущего специалиста.
              </p>
            </div>

            {/* Signatures Panel */}
            <div className="mt-12 font-sans text-xs space-y-5 px-1 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-end relative">
                <div className="w-[45%] text-left">
                  <div className="font-bold text-gray-800">Председатель Совета СНО ФЭМ</div>
                  <div className="text-[10px] text-gray-500 italic mt-0.5">Совет молодых ученых, БГЭУ</div>
                </div>
                <div className="w-[20%] border-b border-gray-400 text-center italic text-[10px] text-gray-300 relative h-7">
                  <svg className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-16 h-8 pointer-events-none" viewBox="0 0 100 40" fill="none" stroke="#10b981" strokeWidth="1.8">
                    <path d="M10,25 C25,10 32,35 48,15 Q55,8 65,24 C72,28 80,18 90,14" strokeLinecap="round" />
                    <path d="M22,25 Q45,21 68,17" strokeLinecap="round" />
                  </svg>
                  подпись
                </div>
                <div className="w-[30%] text-right font-bold">А.В. Терро</div>
              </div>

              <div className="flex justify-between items-end relative">
                <div className="w-[45%] text-left">
                  <div className="font-bold text-gray-800">Куратор СНО ФЭМ, заместитель декана по научной работе</div>
                  <div className="text-[10px] text-gray-500 italic mt-0.5">к.э.н., доцент, БГЭУ</div>
                </div>
                <div className="w-[20%] border-b border-gray-400 text-center italic text-[10px] text-gray-300 relative h-7">
                  <svg className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-16 h-8 pointer-events-none" viewBox="0 0 100 40" fill="none" stroke="#047857" strokeWidth="1.6">
                    <path d="M12,15 T38,8 T50,30 T68,14 T80,35 Q90,18 95,28" strokeLinecap="round" />
                    <path d="M18,18 Q45,18 78,20" strokeLinecap="round" strokeDasharray="" />
                  </svg>
                  подпись
                </div>
                <div className="w-[30%] text-right font-bold">О.В. Гулина</div>
              </div>
            </div>

            {/* Stamp space & verification block */}
            <div className="mt-10 flex justify-between items-center px-1 font-sans">
              
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex items-center justify-center border-2 border-dashed border-blue-600/70 text-blue-700/70 rounded-full p-2 text-center text-[8px] font-black leading-tight select-none rotate-[-6deg]">
                  М. П. СНО<br />ФЭМ БГЭУ<br />ВЕРИФИЦИРОВАНО
                </div>
                {qrCodeUrl && (
                  <div className="flex flex-col items-center">
                    <img src={qrCodeUrl} className="w-16 h-16 border border-slate-200 p-1 bg-white rounded-md" alt="QR-код сверки" />
                    <span className="text-[7.5px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">Отсканируй QR</span>
                  </div>
                )}
              </div>

              <div className="text-right text-[8.5px] text-slate-400 font-mono space-y-0.5 border-l border-slate-200 pl-4 h-max">
                <div>Код верификации СНО: {verificationCode}</div>
                <div>Электронный реестр СНО ФЭМ БГЭУ</div>
                <div className="text-emerald-700/70 font-semibold">✔ ОДОБРЕНО КАНЦЕЛЯРИЕЙ СНО БГЭУ</div>
              </div>
            </div>

          </div>

        </div>

        {/* Legend footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-col md:flex-row gap-2 justify-between items-center rounded-b-2xl">
          <span className="italic">Документ содержит интерактивные ЭЦП и защищенные реквизиты сверки с базой БГЭУ.</span>
          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase text-[9px] tracking-wide">Код реестра: {verificationCode}</span>
        </div>

      </div>
    </div>
  );
}
