import React, { useState } from 'react';
import { BlogPost } from '../types';
import { ChevronRight, Clock, User, Sparkles, BookOpen, X, ArrowLeft } from 'lucide-react';

interface BlogPageProps {
  blogs: BlogPost[];
  onGoHome: () => void;
}

export function BlogPage({ blogs, onGoHome }: BlogPageProps) {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-stone-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
          <button onClick={onGoHome} className="hover:text-[#1b3d2b] cursor-pointer">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">Sunnah Wellness Articles</span>
        </div>

        {/* Page Banner */}
        <div className="bg-[#1b3d2b] text-white p-8 sm:p-10 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Tibb-e-Nabawi Guidance</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold">Prophetic Medicine & Health Blog</h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              In-depth research articles on the healing properties of Sidr Honey, Black Seed (Kalonji), Olive Oil, Hijama cupping, and prophetic dietary wisdom.
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => setSelectedBlog(blog)}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-stone-100">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-emerald-900 text-amber-300 font-bold text-[10px] uppercase px-3 py-1 rounded-full border border-emerald-700">
                    {blog.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-4 text-stone-400 text-[11px] font-medium">
                    <span className="flex items-center gap-1 text-stone-600">
                      <User className="w-3.5 h-3.5 text-emerald-800" />
                      {blog.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-stone-500">
                      <Clock className="w-3.5 h-3.5" />
                      {blog.readTime}
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-stone-900 group-hover:text-[#1b3d2b] transition-colors leading-snug">
                    {blog.title}
                  </h2>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {blog.excerpt || blog.summary || blog.content.substring(0, 150)}...
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlog(blog);
                  }}
                  className="w-full py-2.5 px-4 bg-stone-50 group-hover:bg-[#1b3d2b] text-stone-800 group-hover:text-amber-300 rounded-xl font-bold text-xs flex items-center justify-between transition-colors border border-stone-200"
                >
                  <span>Read Full Article</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Full Article Modal */}
        {selectedBlog && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="p-6 bg-[#1b3d2b] text-white flex items-center justify-between border-b border-emerald-900">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    {selectedBlog.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="p-1 rounded-lg bg-emerald-900/50 text-emerald-200 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-snug">
                    {selectedBlog.title}
                  </h1>
                  <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
                    <span>By {selectedBlog.author}</span>
                    <span>•</span>
                    <span>{selectedBlog.date}</span>
                    <span>•</span>
                    <span>{selectedBlog.readTime}</span>
                  </div>
                </div>

                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-stone-200"
                />

                <div className="prose prose-stone text-xs sm:text-sm leading-relaxed text-stone-700 space-y-4">
                  {selectedBlog.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-5 py-2 bg-[#1b3d2b] text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Article
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
