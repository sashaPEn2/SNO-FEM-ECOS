import React, { useState } from 'react';
import { BookOpen, Award, Heart, Eye, ArrowRight, Plus, Sparkles, AlertCircle, Trash, Upload, ImageIcon } from 'lucide-react';
import { NewsItem, StudentProfile } from '../types';
import ArticleDetailPage from './ArticleDetailPage';

interface NewsSectionProps {
  news: NewsItem[];
  onLikeNews: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  profile?: StudentProfile;
  onAddNews?: (newNews: NewsItem) => Promise<void>;
  onDeleteNews?: (id: string) => Promise<void>;
}

export default function NewsSection({ news, onLikeNews, onNavigateToTab, profile, onAddNews, onDeleteNews }: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  // SNO Article creation form states
  const [isAddingNews, setIsAddingNews] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'conference' | 'science' | 'grant' | 'announcement'>('conference');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const isActivist = profile?.role === 'sno_activist';

  const PRESET_IMAGES = [
    { label: '📊 Социологические опросы, статистика & аналитика', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80' },
    { label: '⚛️ Лаборатория, инновации & физика', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' },
    { label: '📚 Конференция, круглый стол & доклады', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80' },
    { label: '🏅 Премии, гранты, награды ФЭМ БГЭУ', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setModalError('Файл слишком большой. Максимальный размер 3МБ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!newTitle.trim() || !newSummary.trim() || !newContent.trim()) {
      setModalError('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = `news-${Date.now()}`;
      const newItem: NewsItem = {
        id: generatedId,
        title: newTitle.trim(),
        summary: newSummary.trim(),
        content: newContent.trim(),
        category: newCategory,
        imageUrl: newImageUrl || PRESET_IMAGES[0].url,
        date: new Date().toISOString().split('T')[0],
        views: Math.floor(Math.random() * 15 + 1),
        likes: 0,
        isLiked: false,
      };

      if (onAddNews) {
        await onAddNews(newItem);
      }
      setIsAddingNews(false);
    } catch (err: any) {
      setModalError(err?.message || 'Ошибка создания новости.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Все новости' },
    { id: 'conference', label: 'Конференции' },
    { id: 'science', label: 'Научные кружки' },
    { id: 'grant', label: 'Гранты и конкурсы' },
    { id: 'announcement', label: 'Объявления СНО' },
  ];

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => item.category === selectedCategory);

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'conference':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-100', label: 'Конференция' };
      case 'science':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'СНИЛ / Наука' };
      case 'grant':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'Гранты и Конкурсы' };
      case 'announcement':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Объявление' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Новость' };
    }
  };

  if (activeArticle) {
    return (
      <ArticleDetailPage
        article={activeArticle}
        onBack={() => setActiveArticle(null)}
        onLikeNews={onLikeNews}
        newsList={news}
        onOpenArticle={(item) => setActiveArticle(item)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 border border-slate-800 sm:px-12 sm:py-14">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-805/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-slate-800/10 blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-blue-950/90"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            <span>Научная Среда ФЭМ</span>
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Студенческое научное общество ФЭМ БГЭУ
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans font-light">
            Твой путеводитель в мир студенческой науки, крутых аналитических проектов, конференций с публикацией в РИНЦ и бонусов за академические достижения. Накапливай баллы активности и обменивай их на официальные привилегии!
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('calendar')}
              className="flex items-center space-x-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition-all border border-transparent shadow-sm"
            >
              <span>Подать доклад</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigateToTab('quiz')}
              className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white border border-slate-700 hover:bg-slate-755 transition-all"
            >
              <span>Пройти викторину (+50 баллов)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {isActivist && (
          <button
            onClick={() => {
              setNewTitle('');
              setNewSummary('');
              setNewContent('');
              setNewCategory('conference');
              setNewImageUrl(PRESET_IMAGES[0].url);
              setModalError('');
              setIsAddingNews(true);
            }}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/10 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Опубликовать новость</span>
          </button>
        )}
      </div>

      {/* News Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredNews.map((item) => {
          const theme = getCategoryTheme(item.category);
          return (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:translate-y-[-4px] hover:shadow-md transition-all duration-300"
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm border ${theme.bg}`}>
                    {theme.label}
                  </span>
                </div>
              </div>

              {/* Content body */}
              <div className="flex flex-1 flex-col p-5 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono">
                  <span>{new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.views}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Footer section */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    onClick={() => { window.location.hash = `#/news/${item.id}`; }}
                    className="flex items-center space-x-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 transition-colors"
                  >
                    <span>Подробнее</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {isActivist && onDeleteNews && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Вы действительно хотите удалить эту публикацию?')) {
                            await onDeleteNews(item.id);
                          }
                        }}
                        className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 text-red-650 border border-red-100 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="Удалить статью"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onLikeNews(item.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        item.isLiked
                          ? 'bg-pink-50 text-pink-600 border-pink-100 font-bold'
                          : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${item.isLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                      <span>{item.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>



      {/* Add News Item Modal */}
      {isAddingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 font-display">Публикация научной статьи / новости СНО</h2>
              </div>
              <button
                onClick={() => setIsAddingNews(false)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center font-bold text-lg"
              >
                ×
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSubmitNews} className="flex-1 overflow-y-auto p-6 space-y-4">
              {modalError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-600 border border-red-100 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="font-semibold">{modalError}</span>
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Заголовок публикации <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Например: Победители конкурса грантов БГЭУ 'Молодой аналитик' ФЭМ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Категория <span className="text-red-500">*</span></label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all text-sm"
                >
                  <option value="conference">Конференция</option>
                  <option value="science">СНИЛ / Научный кружок</option>
                  <option value="grant">Гранты и конкурсы</option>
                  <option value="announcement">Объявление СНО</option>
                </select>
              </div>

              {/* Summary / Annotation input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Краткая аннотация (Summary) <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  maxLength={300}
                  placeholder="Краткое описание события или статьи для плитки новостей (до 300 символов)..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all text-sm resize-none"
                />
              </div>

              {/* Image selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Обложка публикации <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setNewImageUrl(img.url)}
                      className={`p-1.5 text-left rounded-xl text-xs font-medium border transition-all flex flex-col items-start gap-1 ${
                        newImageUrl === img.url
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-900 ring-2 ring-indigo-500/10'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <img src={img.url} className="h-10 w-full object-cover rounded-lg mb-1" alt={img.label} />
                      <span className="truncate w-full text-[9px] font-semibold">{img.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
                
                {/* Custom File Upload Option */}
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3.5 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-100/50 transition-all">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Upload className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-705">Загрузить фото с устройства</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="article-file-upload"
                  />
                  <label
                    htmlFor="article-file-upload"
                    className="px-3.5 py-1.5 bg-white border border-slate-205 text-slate-600 rounded-lg text-[11px] font-bold hover:bg-white/80 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Выбрать файл изображения
                  </label>
                  {newImageUrl && newImageUrl.startsWith('data:image') && (
                    <div className="mt-1 flex items-center gap-1.5 p-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                      <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[10px] font-semibold truncate max-w-[200px]">Фото успешно прикреплено!</span>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="Или вставьте свою ссылку на изображение..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Main text content input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Полный текст публикации <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={6}
                  placeholder="Введите здесь весь текст статьи, подробное расписание кружка или условия получения награды/гранта студентом..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition-all text-sm"
                />
              </div>

              {/* Modal form footer actions */}
              <div className="p-4 border-t border-slate-150 flex items-center justify-end gap-2 bg-slate-50 -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddingNews(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-650 text-white bg-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 disabled:opacity-75 transition-all flex items-center space-x-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>Публикация...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      <span>Опубликовать новость</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
