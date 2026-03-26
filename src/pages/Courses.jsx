import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Play, Clock, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

function useTheme() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => { setIsLight(localStorage.getItem('avvelux-theme') === 'light'); }, []);
  return isLight;
}

const SAMPLE_COURSES = [
  {
    id: 'c1',
    title: 'Master Your Morning: The Ultimate Routine',
    description: 'Build an unshakable morning routine that sets the tone for peak performance every single day.',
    thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    category: 'Self-Help',
    instructor_name: 'James Carter',
    instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    total_duration: '1h 42m',
    lessons: [
      { id: 'l1', title: 'Why Your Morning Decides Your Day', description: 'The science behind morning momentum.', duration: '8:24', thumbnail_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400' },
      { id: 'l2', title: 'The Power of Waking Up Early', description: 'How to shift your sleep schedule without pain.', duration: '12:10', thumbnail_url: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400' },
      { id: 'l3', title: 'Hydration & Your Brain', description: 'Start hydrated, start sharp.', duration: '7:55', thumbnail_url: 'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=400' },
      { id: 'l4', title: 'Movement in the Morning', description: 'Quick exercises to energize your body.', duration: '15:30', thumbnail_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
      { id: 'l5', title: 'Journaling for Clarity', description: '3 minutes of writing that rewires your mindset.', duration: '10:00', thumbnail_url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400' },
      { id: 'l6', title: 'Cold Exposure 101', description: 'Why cold showers change your mental toughness.', duration: '9:45', thumbnail_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
      { id: 'l7', title: 'Nutrition for Morning Energy', description: 'What to eat (and what to avoid) before noon.', duration: '11:20', thumbnail_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400' },
      { id: 'l8', title: 'Your Perfect Routine Blueprint', description: 'Build your personalized routine step by step.', duration: '14:00', thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' },
    ],
  },
  {
    id: 'c2',
    title: 'Entrepreneurship 101: From Idea to Launch',
    description: 'Everything you need to validate, build, and launch your first business in 30 days.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    category: 'Business',
    instructor_name: 'Sofia Mendes',
    instructor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    total_duration: '2h 18m',
    lessons: [
      { id: 'l1', title: 'The Entrepreneurial Mindset', description: 'How successful founders think differently.', duration: '10:00', thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400' },
      { id: 'l2', title: 'Finding Your Idea', description: 'Frameworks to discover profitable opportunities.', duration: '14:30', thumbnail_url: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400' },
      { id: 'l3', title: 'Validating Before Building', description: 'Test your idea without spending a dollar.', duration: '12:15', thumbnail_url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400' },
      { id: 'l4', title: 'Your First Customer', description: 'How to get paying customers from day one.', duration: '16:00', thumbnail_url: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400' },
      { id: 'l5', title: 'Building an MVP', description: 'Ship fast, learn faster.', duration: '13:45', thumbnail_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400' },
      { id: 'l6', title: 'Pricing Your Product', description: 'The psychology of pricing that sells.', duration: '9:30', thumbnail_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
      { id: 'l7', title: 'Marketing on Zero Budget', description: 'Organic growth tactics that actually work.', duration: '18:00', thumbnail_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400' },
      { id: 'l8', title: 'Launch Day Checklist', description: 'Go live with confidence.', duration: '8:00', thumbnail_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400' },
    ],
  },
];

export default function Courses() {
  const isLight = useTheme();
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('id');
  const lessonId = params.get('lessonId');

  const { data: dbCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50),
  });

  const courses = dbCourses.length > 0 ? dbCourses : SAMPLE_COURSES;

  if (courseId) {
    const course = courses.find(c => c.id === courseId) || SAMPLE_COURSES.find(c => c.id === courseId);
    if (course) {
      return <CoursePlayer course={course} activeLessonId={lessonId} isLight={isLight} />;
    }
  }

  return <CourseList courses={courses} isLight={isLight} />;
}

function CourseList({ courses, isLight }) {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Self-Help', 'Business'];
  const filtered = filter === 'All' ? courses : courses.filter(c => c.category === filter);

  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-100 hover:shadow-md' : 'bg-[#242424] border-gray-800/50 hover:border-gray-700';

  return (
    <div>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${text}`}>Courses</h1>
        <p className={`text-sm ${muted} mt-1`}>Free lessons curated for you</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === cat
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(course => (
          <Link
            key={course.id}
            to={`?id=${course.id}&lessonId=${course.lessons?.[0]?.id || ''}`}
            className={`group block rounded-2xl border overflow-hidden transition-all ${cardBg}`}
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className={`text-xs font-medium text-white/80`}>{course.total_duration}</span>
                <span className="text-xs text-white/80">{course.lessons?.length} lessons</span>
              </div>
            </div>
            <div className="p-4">
              <h3 className={`font-semibold leading-snug mb-2 line-clamp-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>{course.title}</h3>
              <div className="flex items-center gap-2 mt-3">
                {course.instructor_avatar ? (
                  <img src={course.instructor_avatar} alt={course.instructor_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {course.instructor_name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className={`text-xs ${muted}`}>{course.instructor_name}</span>
                {course.rating && (
                  <span className="ml-auto flex items-center gap-0.5 text-xs text-yellow-400">
                    <Star className="w-3 h-3 fill-current" /> {course.rating}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CoursePlayer({ course, activeLessonId, isLight }) {
  const lessons = course.lessons || [];
  const [currentLessonId, setCurrentLessonId] = useState(activeLessonId || lessons[0]?.id);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
  const currentIndex = lessons.findIndex(l => l.id === currentLessonId);

  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800';
  const sideBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#141414] border-gray-800';

  const handleAsk = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const q = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', content: q }]);
    setAiInput('');
    setAiLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI learning assistant for the course "${course.title}". The user is currently watching "${currentLesson?.title}". Answer concisely.\n\nQuestion: ${q}`,
    });
    setAiMessages(prev => [...prev, { role: 'assistant', content: res }]);
    setAiLoading(false);
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
      <div className="mb-4">
        <Link to={createPageUrl('Courses')} className={`flex items-center gap-1 text-sm ${muted} hover:text-purple-400`}>
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left: Lesson list */}
        <div className={`lg:w-72 flex-shrink-0 rounded-2xl border overflow-hidden ${sideBg}`}>
          <div className={`p-4 border-b ${isLight ? 'border-gray-200' : 'border-gray-800'}`}>
            <p className={`font-semibold text-sm ${text}`}>{course.title}</p>
            <p className={`text-xs ${muted} mt-1`}>{lessons.length} lessons · {course.total_duration}</p>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
            {lessons.map((lesson, idx) => {
              const isActive = lesson.id === currentLessonId;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setCurrentLessonId(lesson.id)}
                  className={`w-full flex items-start gap-3 p-3 border-b text-left transition-colors ${
                    isActive
                      ? isLight ? 'bg-purple-50 border-purple-100' : 'bg-purple-900/20 border-gray-700'
                      : isLight ? 'hover:bg-gray-100 border-gray-100' : 'hover:bg-white/5 border-gray-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                    isActive ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : isLight ? 'bg-gray-200 text-gray-600' : 'bg-[#3a3a3a] text-gray-400'
                  }`}>
                    {isActive ? <Play className="w-3 h-3 fill-white" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${isActive ? 'text-purple-400' : text}`}>{lesson.title}</p>
                    <p className={`text-xs ${muted} mt-0.5 flex items-center gap-1`}>
                      <Clock className="w-3 h-3" />{lesson.duration}
                    </p>
                  </div>
                  {isActive && <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Video */}
        <div className="flex-1 min-w-0">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-4">
            {currentLesson?.video_url ? (
              <video src={currentLesson.video_url} poster={currentLesson.thumbnail_url} controls className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                <img src={currentLesson?.thumbnail_url || course.thumbnail_url} alt={currentLesson?.title} className="w-full h-full object-cover opacity-40 absolute inset-0" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <p className="text-white text-sm opacity-70">Lesson preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className={`rounded-2xl border p-5 mb-4 ${cardBg}`}>
            <p className={`text-xs ${muted} mb-1`}>Lesson {currentIndex + 1} of {lessons.length}</p>
            <h2 className={`text-xl font-bold ${text} mb-1`}>{currentLesson?.title}</h2>
            <p className={`text-sm ${muted} mb-4`}>{currentLesson?.description}</p>

            <div className="flex items-center gap-3 mb-4">
              {course.instructor_avatar ? (
                <img src={course.instructor_avatar} alt={course.instructor_name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {course.instructor_name?.[0]?.toUpperCase()}
                </div>
              )}
              <span className={`text-sm font-medium ${text}`}>{course.instructor_name}</span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => currentIndex > 0 && setCurrentLessonId(lessons[currentIndex - 1].id)}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''} ${isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-[#3a3a3a] text-white hover:bg-[#444]'}`}
              >
                ← Previous
              </button>
              <button
                onClick={() => currentIndex < lessons.length - 1 && setCurrentLessonId(lessons[currentIndex + 1].id)}
                disabled={currentIndex === lessons.length - 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity ${currentIndex === lessons.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Next Lesson →
              </button>
            </div>
          </div>

          {/* AI Assistant */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            <button
              onClick={() => setShowAI(v => !v)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-xs">✨</span>
                </div>
                <span className={`font-semibold ${text}`}>AI Learning Assistant</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${muted} transition-transform ${showAI ? 'rotate-90' : ''}`} />
            </button>
            {showAI && (
              <div className="p-4 pt-0">
                <div className={`rounded-xl p-3 min-h-[120px] max-h-60 overflow-y-auto mb-3 space-y-3 ${isLight ? 'bg-gray-50' : 'bg-[#1a1a1a]'}`}>
                  {aiMessages.length === 0 && <p className={`text-sm ${muted}`}>Ask me anything about this lesson...</p>}
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                      {m.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-xs">✨</div>}
                      <div className={`rounded-xl px-3 py-2 text-sm max-w-[85%] ${m.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : isLight ? 'bg-white text-gray-900' : 'bg-[#2a2a2a] text-white'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {aiLoading && <div className={`text-sm ${muted} animate-pulse`}>Thinking...</div>}
                </div>
                <div className="flex gap-2">
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAsk()}
                    placeholder="Ask about this lesson..."
                    className={`flex-1 rounded-xl px-3 py-2 text-sm border outline-none ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500'}`}
                  />
                  <button onClick={handleAsk} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:opacity-90">Ask</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}