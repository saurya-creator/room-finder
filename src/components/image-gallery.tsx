"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Share2,
  Heart,
  ShieldCheck,
  Grid,
} from "lucide-react";
import { PropertyImageItem } from "@/types";

interface ImageGalleryProps {
  images: PropertyImageItem[];
  title: string;
  videoUrl?: string | null;
}

export function ImageGallery({ images, title, videoUrl }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const displayImages = images && images.length > 0
    ? images
    : [{ id: "d1", url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200", isCover: true, displayOrder: 0 }];

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-4">
      
      {/* 5-Photo Modern Grid Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] max-h-[500px]">
        
        {/* Main Hero Large Photo (Takes 2 cols) */}
        <div
          onClick={() => { setActiveIdx(0); setIsModalOpen(true); }}
          className="md:col-span-2 relative group cursor-pointer overflow-hidden bg-slate-100 h-full"
        >
          <img
            src={displayImages[0].url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>

        {/* Column 2 (2 stacked photos) */}
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <div
            onClick={() => { setActiveIdx(1 % displayImages.length); setIsModalOpen(true); }}
            className="relative group cursor-pointer overflow-hidden bg-slate-100"
          >
            <img
              src={displayImages[1 % displayImages.length].url}
              alt={`${title} 2`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div
            onClick={() => { setActiveIdx(2 % displayImages.length); setIsModalOpen(true); }}
            className="relative group cursor-pointer overflow-hidden bg-slate-100"
          >
            <img
              src={displayImages[2 % displayImages.length].url}
              alt={`${title} 3`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Column 3 (2 stacked photos with "View All" overlay on last) */}
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <div
            onClick={() => { setActiveIdx(3 % displayImages.length); setIsModalOpen(true); }}
            className="relative group cursor-pointer overflow-hidden bg-slate-100"
          >
            <img
              src={displayImages[3 % displayImages.length].url}
              alt={`${title} 4`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div
            onClick={() => setIsModalOpen(true)}
            className="relative group cursor-pointer overflow-hidden bg-slate-100"
          >
            <img
              src={displayImages[4 % displayImages.length || 0].url}
              alt={`${title} 5`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-navy-950/60 flex items-center justify-center text-white backdrop-blur-[2px] group-hover:bg-navy-950/40 transition-colors">
              <span className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 border border-white/30">
                <Grid className="w-4 h-4" />
                Show all {displayImages.length} photos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile "View All Photos" trigger button */}
      <div className="md:hidden flex items-center justify-between">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-navy-900 bg-slate-100 hover:bg-slate-200"
        >
          <Grid className="w-4 h-4" />
          View all photos ({displayImages.length})
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-fade-in">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
            <div>
              <p className="text-sm font-bold truncate max-w-md">{title}</p>
              <p className="text-xs text-slate-400">
                Photo {activeIdx + 1} of {displayImages.length}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Photo View */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={displayImages[activeIdx].url}
              alt={displayImages[activeIdx].caption || title}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all"
            />

            {/* Left / Right Nav Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Thumbnail Strip Footer */}
          <div className="px-6 py-4 bg-black/40 border-t border-slate-800 overflow-x-auto flex gap-3 justify-center">
            {displayImages.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeIdx ? "border-brand-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
