import React, { useState } from 'react';
import { ArrowRight, Calendar, User, Clock, BookOpen, X } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogSectionProps {
  blogs: BlogPost[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ blogs }) => {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-14 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
              FROM OUR BLOG
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#1b3d2b]">
              Sunnah & Health Insights
            </h2>
          </div>
          <button 
            onClick={() => setSelectedBlog(blogs[0])}
            className="text-xs font-semibold text-[#1b3d2b] hover:text-amber-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Blogs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedBlog(post)}
              className="group bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-3">
                {/* Image */}
                <div className="aspect-16/9 overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#1b3d2b] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {post.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-stone-900 group-hover:text-[#1b3d2b] text-base leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center text-xs font-bold text-[#1b3d2b] group-hover:text-amber-700 gap-1.5">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="px-3 py-1 bg-emerald-50 text-[#1b3d2b] text-xs font-bold rounded-full">
                {selectedBlog.category}
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b3d2b]">
                {selectedBlog.title}
              </h2>

              <div className="flex items-center gap-4 text-xs text-stone-500 font-medium pt-1 border-b border-stone-100 pb-3">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  {selectedBlog.author}
                </span>
                <span>•</span>
                <span>{selectedBlog.date}</span>
                <span>•</span>
                <span>{selectedBlog.readTime}</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-16/9">
              <img
                src={selectedBlog.image}
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-stone prose-sm max-w-none text-stone-700 space-y-4 leading-relaxed whitespace-pre-line">
              {selectedBlog.content}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedBlog(null)}
                className="px-6 py-2.5 bg-[#1b3d2b] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
