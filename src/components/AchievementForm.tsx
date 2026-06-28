/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ActivityCategory, Course, Achievement, ApplicationStatus, Student } from "../types";
import { Send, FileText, Calendar, Link, Award, UserCheck, AlertTriangle } from "lucide-react";

interface AchievementFormProps {
  currentUser: Student;
  initialCategory?: ActivityCategory;
  onSubmit: (achievement: Omit<Achievement, "id" | "status" | "studentId" | "studentName">) => void;
  onCancel: () => void;
}

// Subcategories with standard BSEU FEM rating points pre-sets
const RATING_MATRIX: Record<ActivityCategory, { name: string; points: number }[]> = {
  [ActivityCategory.Science]: [
    { name: "Победитель / Лауреат Республиканского конкурса научных работ студентов (100 б.)", points: 100 },
    { name: "Публикация исследовательской статьи в рецензируемом журнале ВАК РБ (80 б.)", points: 80 },
    { name: "Участие с докладом / публикация тезисов на Международной конференции (50 б.)", points: 50 },
    { name: "Публикация в научном сборнике БГЭУ / Иных вузов (40 б.)", points: 40 },
    { name: "Участие во внутривузовской научной конференции (20 б.)", points: 20 },
  ],
  [ActivityCategory.Sport]: [
    { name: "Золотая медаль / 1 место на Спартакиаде БГЭУ (50 б.)", points: 50 },
    { name: "Серебряный / бронзовый призер Спартакиады БГЭУ (30 б.)", points: 30 },
    { name: "Участие в областных / республиканских студенческих играх (40 б.)", points: 40 },
    { name: "Систематическое выступление за сборную факультета по видам спорта (20 б.)", points: 20 },
  ],
  [ActivityCategory.Social]: [
    { name: "Организация крупного мероприятия ФЭМ (День первокурсника, Мисс ФЭМ и др.) (50 б.)", points: 50 },
    { name: "Вхождение в руководящий состав СНО ФЭМ / Студсовета / Профкома (40 б.)", points: 40 },
    { name: "Систематическое волонтерство на мероприятиях университетского уровня (30 б.)", points: 30 },
    { name: "Активное членство БРСМ / содействие общественной жизни факультета (20 б.)", points: 20 },
  ],
  [ActivityCategory.Creative]: [
    { name: "Диплом I степени на фестивале 'Студенческая весна БГЭУ' (50 б.)", points: 50 },
    { name: "Дипломы II/III степени на художественных конкурсах университета (30 б.)", points: 30 },
    { name: "Активное участие в культурных программах Клуба культуры БГЭУ (20 б.)", points: 20 },
  ],
  [ActivityCategory.Academic]: [
    { name: "Семестровый средний балл успеваемости 9.5 - 10.0 (30 б.)", points: 30 },
    { name: "Семестровый средний балл успеваемости 9.0 - 9.4 (20 б.)", points: 20 },
    { name: "Диплом участника предметной олимпиады БГЭУ (1-3 место в личном зачете) (45 б.)", points: 45 },
  ],
};

export default function AchievementForm({ currentUser, initialCategory, onSubmit, onCancel }: AchievementFormProps) {
  const [category, setCategory] = useState<ActivityCategory>(initialCategory || ActivityCategory.Science);
  const [subtypeIndex, setSubtypeIndex] = useState<number>(0);

  // Sync category if initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofText, setProofText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [points, setPoints] = useState(100);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // When category changes, reset selected subtype and update corresponding pre-set points
  useEffect(() => {
    setSubtypeIndex(0);
    const subtype = RATING_MATRIX[category][0];
    if (subtype) {
      setPoints(subtype.points);
    }
  }, [category]);

  const handleSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value);
    setSubtypeIndex(index);
    const subtype = RATING_MATRIX[category][index];
    if (subtype) {
      setPoints(subtype.points);
    }
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = "Введите название достижения";
    if (title.length < 10) tempErrors.title = "Название должно быть развернутым (минимум 10 символов)";
    if (!description.trim()) tempErrors.description = "Опишите суть вашего достижения";
    if (!date) tempErrors.date = "Выберите дату получения достижения";
    
    // Safety check for date (no future achievements)
    if (date && new Date(date) > new Date()) {
      tempErrors.date = "Дата не может быть в будущем";
    }

    if (category === ActivityCategory.Science && !supervisor.trim()) {
      tempErrors.supervisor = "Для научных достижений необходимо указать научного руководителя";
    }

    if (!proofText.trim() && !proofUrl.trim()) {
      tempErrors.proof = "Укажите хотя бы один способ подтверждения: ссылку на документ или текстовые реквизиты";
    }

    if (proofUrl && !proofUrl.startsWith("http://") && !proofUrl.startsWith("https://")) {
      tempErrors.proofUrl = "Ссылка на подтверждение должна начинаться с http:// или https://";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        course: currentUser.course,
        category,
        title,
        description,
        date,
        proofUrl: proofUrl.trim() || undefined,
        proofText,
        attachments: attachments.length > 0 ? attachments : undefined,
        supervisor: category === ActivityCategory.Science ? supervisor : undefined,
        points,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 max-w-2xl mx-auto">
      
      {/* Form Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-805">Подать новое достижение</h2>
          <p className="text-xs text-slate-500 mt-1">
            Заполните форму для рассмотрения научным отделом и активом СНО ФЭМ
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="achievement-submission-form">
        
        {/* Category Selector (Fixed to Scientific) */}
        <div className="hidden">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ActivityCategory)}
            id="form-category-select"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-850 focus:outline-hidden focus:border-emerald-600 transition"
          >
            <option value={ActivityCategory.Science}>{ActivityCategory.Science}</option>
          </select>
        </div>

        {/* Subtype/Criteria Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Соответствующий критерий (Регламент премий СНО ФЭМ)
          </label>
          <select
            value={subtypeIndex}
            onChange={handleSubtypeChange}
            id="form-subtype-select"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-755 focus:outline-hidden focus:border-emerald-600 transition"
          >
            {RATING_MATRIX[category].map((item, idx) => (
              <option key={idx} value={idx}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 ">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Оценочные баллы за этот вид: <strong>{points} б.</strong> в общий рейтинг.</span>
          </div>
        </div>

        {/* Achievement Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Название достижения (Полное официальное наименование)
          </label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            id="form-title-input"
            rows={2}
            placeholder="Например: Публикация научной статьи 'Проблемы цифровой логистики предприятий АПК РБ' в сборнике БГЭУ"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-850 focus:outline-hidden focus:border-emerald-600 focus:bg-white placeholder-slate-400 transition"
          />
          {errors.title && <p id="err-title" className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
        </div>

        {/* Achievement Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Дата получения достижения / публикации
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              id="form-date-input"
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-850 focus:outline-hidden focus:border-emerald-600 transition"
            />
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          {errors.date && <p id="err-date" className="text-red-500 text-xs mt-1.5 font-medium">{errors.date}</p>}
        </div>

        {/* Supervisor (Conditional: Only for scientific efforts) */}
        {category === ActivityCategory.Science && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Научный руководитель (ФИО, ученая степень)
            </label>
            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              id="form-supervisor-input"
              placeholder="Например: к.э.н., доцент Ковалевская М.В."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-850 focus:outline-hidden focus:border-emerald-600 transition"
            />
            {errors.supervisor && <p id="err-supervisor" className="text-red-500 text-xs mt-1.5 font-medium">{errors.supervisor}</p>}
            <p className="text-slate-400 text-[10px] mt-1.5 italic">
              *Внимание: Научный руководитель указывается обязательно для подтверждения и автоматической вставки в бланк итоговой Справки СНО.
            </p>
          </div>
        )}

        {/* Detailed Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Описание сущности и результатов достижения
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            id="form-desc-input"
            rows={3}
            placeholder="Опишите, в чем выражается достижение. Например: 'В статье рассмотрены инновационные методы реинжиниринга процессов логистики, предложена модель сокращения транзакционных запасов для ОАО МТЗ. Работа состоит из 8 страниц...'"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-850 focus:outline-hidden focus:border-emerald-600 focus:bg-white placeholder-slate-400 transition"
          />
          {errors.description && <p id="err-desc" className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</p>}
        </div>

        {/* Proof Section (Require at least one) */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Подтверждающие свидетельства</h4>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ссылка на подтверждение (публикация, приказ, скан диплома на диске)
            </label>
            <div className="relative">
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                id="form-proofurl-input"
                placeholder="https://elib.bseu.by/handle/123456789/101..."
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-850 focus:outline-hidden focus:border-emerald-600 bg-white transition"
              />
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>
            {errors.proofUrl && <p id="err-proofurl" className="text-red-500 text-[11px] mt-1 font-medium">{errors.proofUrl}</p>}
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Прикрепить дополнительные файлы/фото (ссылки)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-850 focus:outline-hidden focus:border-emerald-600 bg-white transition"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAttachmentUrl) {
                    setAttachments([...attachments, newAttachmentUrl]);
                    setNewAttachmentUrl("");
                  }
                }}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
              >
                Добавить
              </button>
            </div>
            <ul className="space-y-1">
              {attachments.map((url, index) => (
                <li key={index} className="text-[10px] bg-white p-2 rounded border border-slate-200 flex justify-between items-center text-slate-600">
                  <span className="truncate max-w-[80%]">{url}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="text-red-500 font-bold ml-2"
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Реквизиты документа (серийный номер диплома, выходные данные статьи)
            </label>
            <input
              type="text"
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              id="form-prooftext-input"
              placeholder="Например: Диплом первой степени № ДП-993848, изд-во БГЭУ, стр. 44-50"
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-850 focus:outline-hidden focus:border-emerald-600 bg-white transition"
            />
          </div>

          {(errors.proof) && (
            <div className="flex items-center gap-1.5 text-red-500 text-[11px] mt-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errors.proof}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div id="form-button-container" className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 ">
          <button
            type="button"
            onClick={onCancel}
            id="form-btn-cancel"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 :bg-slate-700 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            id="form-btn-submit"
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition"
          >
            <Send className="w-4 h-4" />
            <span>Отправить заявку</span>
          </button>
        </div>

      </form>

    </div>
  );
}
