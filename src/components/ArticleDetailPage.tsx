import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Eye, MessageSquare, CornerDownRight, Bookmark, Share2, Award, Calendar, ChevronRight, Send, Printer } from 'lucide-react';
import { NewsItem } from '../types';

interface ArticleDetailPageProps {
  article: NewsItem;
  onBack: () => void;
  onLikeNews: (id: string) => void;
  newsList: NewsItem[];
  onOpenArticle?: (article: NewsItem) => void;
}

interface Comment {
  id: string;
  author: string;
  group: string;
  text: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

export default function ArticleDetailPage({ article, onBack, onLikeNews, newsList, onOpenArticle }: ArticleDetailPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [academicGroup, setAcademicGroup] = useState('');
  const [localLiked, setLocalLiked] = useState(article.isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState(article.likes);

  // Load custom comments from localStorage or initialize with high-quality mock data
  useEffect(() => {
    const savedCommentsKey = `comments-${article.id}`;
    const cached = localStorage.getItem(savedCommentsKey);
    if (cached) {
      setComments(JSON.parse(cached));
    } else {
      const initial: Comment[] = [
        {
          id: '1',
          author: 'Виктория Козлова',
          group: 'ДФМ-1 (2 курс)',
          text: 'Отличный материал! Крайне полезные рекомендации по подготовке научной публикации в журналы ВАК. Было бы интересно подробнее узнать на секциях СНО про новые требования РИНЦ.',
          date: '02.06.2026 в 14:20',
          likes: 4,
          isLiked: false,
        },
        {
          id: '2',
          author: 'д-р экон. наук, проф. Самойлов А.В.',
          group: 'Кафедра экономической теории',
          text: 'Молодцы, ребята! Прекрасная инициатива. Настоятельно рекомендую студентам всех курсов ФЭМ ознакомиться с данной статьей перед подачей тезисов.',
          date: '03.06.2026 в 10:15',
          likes: 12,
          isLiked: true,
        },
        {
          id: '3',
          author: 'Алексей Некрашевич',
          group: 'ДНЗ-2, активист СНО',
          text: 'Напоминаю студентам: активные обсуждения статей и викторин поощряются автоматическим бонусом. Пишите ваши мнения!',
          date: '04.06.2026 в 09:05',
          likes: 3,
          isLiked: false,
        },
      ];
      setComments(initial);
      localStorage.setItem(savedCommentsKey, JSON.stringify(initial));
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Read progress listener
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id]);

  const handleLikeArticle = () => {
    onLikeNews(article.id);
    setLocalLiked(!localLiked);
    setLocalLikesCount(prev => localLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    const slug = `${window.location.origin}/#news/${article.id}`;
    navigator.clipboard.writeText(slug).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !authorName.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: authorName.trim(),
      group: academicGroup.trim() || 'Гость БГЭУ',
      text: newCommentText.trim(),
      date: new Date().toLocaleDateString('ru-RU') + ' в ' + new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      likes: 0,
      isLiked: false,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    setNewCommentText('');
    localStorage.setItem(`comments-${article.id}`, JSON.stringify(updated));
  };

  const handleLikeComment = (commentId: string) => {
    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1
        };
      }
      return c;
    });
    setComments(updated);
    localStorage.setItem(`comments-${article.id}`, JSON.stringify(updated));
  };

  const handlePrint = () => {
    window.print();
  };

  // Get related research items
  const relatedNews = newsList
    .filter(item => item.id !== article.id)
    .slice(0, 2);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'conference': return 'Конференция';
      case 'science': return 'СНИЛ / Наука';
      case 'grant': return 'Гранты и конкурсы';
      case 'announcement': return 'Объявление';
      default: return 'Статья';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'conference': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'science': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'grant': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'announcement': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 pb-16 relative">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-950 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Share Toast Modal */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-55 flex items-center space-x-2 bg-slate-900 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-xl animate-bounce">
          <Share2 className="h-4 w-4 text-emerald-400" />
          <span>Ссылка скопирована в буфер обмена исследователя БГЭУ!</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-900 group transition-all"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Вернуться к ленте СНО</span>
        </button>

        <div className="flex items-center space-x-2 text-slate-400 font-bold uppercase text-[10px] sm:text-xs">
          <span>Новости СНО</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[240px]">{article.title}</span>
        </div>
      </div>

      {/* Article Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main reading content section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold tracking-wider uppercase border ${getCategoryColor(article.category)}`}>
              {getCategoryLabel(article.category)}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight font-sans">
              {article.title}
            </h1>

            {/* Sub-header info panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-y border-slate-100 py-3 font-mono font-medium">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Опубликовано: {new Date(article.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views + 124} просмотров</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} комментариев</span>
                </span>
              </div>
            </div>

            {/* Feature Image Banner with Hover Zoom Wrapper */}
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 group">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Read Summary callout box */}
            <div className="p-4 bg-slate-50 border-l-4 border-blue-900 rounded-r-2xl italic text-slate-800 font-sans text-sm sm:text-base leading-relaxed">
              <strong>Краткая аннотация:</strong> {article.summary}
            </div>

            {/* Rich Content Paragraphs */}
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 font-sans font-normal pt-2">
              {article.content.split('\n\n').map((para, idx) => (
                <p key={idx} className="whitespace-pre-line hover:text-slate-950 transition-colors">
                  {para}
                </p>
              ))}
            </div>

            {/* PDF/Print & Actions Toolbars */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-150 mt-8">
              <div className="flex gap-2">
                <button
                  onClick={handleLikeArticle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    localLiked 
                      ? 'bg-pink-50 text-pink-600 border-pink-100' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${localLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>Полезно ({localLikesCount})</span>
                </button>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    isBookmarked 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                  title="Сохранить на рабочем столе"
                >
                  <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isBookmarked ? 'В закладках' : 'В закладки'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Распечатать статью</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 rounded-xl border border-blue-900 text-blue-900 bg-blue-50/20 px-3.5 py-2 text-xs sm:text-sm font-bold hover:bg-blue-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Поделиться</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Comments Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6">
            <h3 className="font-sans text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-indigo-800" />
              <span>Обсуждение статьи ({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wide">
                Оставить научный отзыв или вопрос к автору:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="ФИО исследователя (например: Попов А.В.)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 p-2.5 rounded-xl focus:border-blue-900 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Учебная группа или Кафедра"
                  value={academicGroup}
                  onChange={(e) => setAcademicGroup(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-200 p-2.5 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              <textarea
                required
                rows={3}
                placeholder="Что вы думаете по поводу данной публикации? Напишите аргументированное суждение..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-slate-200 p-3 rounded-xl focus:border-blue-900 focus:outline-none placeholder-slate-400 leading-relaxed"
              />

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  * Пожалуйста, соблюдайте академическую этику БГЭУ.
                </span>
                <button
                  type="submit"
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/10 transition-colors"
                >
                  <span>Отправить отзыв</span>
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.length === 0 ? (
                <p className="text-center text-slate-400 py-6 text-xs md:text-sm">
                  Комментариев пока нет. Будьте первыми, кто оставит мнение!
                </p>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="group p-4 bg-white hover:bg-slate-50/50 border border-slate-150/60 rounded-2xl shadow-sm transition-all flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 flex-shrink-0 font-extrabold text-[11px] sm:text-xs">
                      {cmt.author.split(' ').map(name => name[0]).slice(0, 2).join('')}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize block leading-snug">
                            {cmt.author}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">
                            {cmt.group}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cmt.date}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-1">
                        {cmt.text}
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleLikeComment(cmt.id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            cmt.isLiked 
                              ? 'bg-pink-50 text-pink-600 border-pink-100 font-extrabold' 
                              : 'bg-white text-slate-400 hover:bg-slate-50 border-slate-150'
                          }`}
                        >
                          <Heart className={`h-3 w-3 ${cmt.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                          <span>Поддерживаю ({cmt.likes})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar right panel */}
        <div className="space-y-6">
          {/* Scientific value rating widget card */}
          <div className="bg-gradient-to-br from-blue-955 via-indigo-950 to-blue-900 text-white rounded-3xl border border-slate-800 shadow-lg p-5 sm:p-6 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl"></div>
            <Award className="h-7 w-7 text-amber-400 shrink-0" />
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 font-sans block">
                СВЯЗАННЫЕ НАГРАДЫ ФЭМ
              </span>
              <h4 className="text-sm font-bold text-white">Научный допуск БГЭУ</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-indigo-150 leading-relaxed font-sans font-light">
              После ознакомления со статьей, вы можете закрепить полученные знания во вкладке "Викторины" и получить до <b>+50 баллов</b> прямо на баланс своего студенческого дела.
            </p>
          </div>

          {/* Related Articles Carousel widget */}
          {relatedNews.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-6 space-y-4">
              <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wide">
                Рекомендуем почитать:
              </h4>

              <div className="space-y-4">
                {relatedNews.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => onOpenArticle && onOpenArticle(item)}
                    className="group flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all"
                  >
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-103"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h5 className="font-sans text-xs font-bold text-slate-800 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h5>
                      <span className="text-[9px] font-mono text-slate-400 block font-medium">
                        {new Date(item.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
