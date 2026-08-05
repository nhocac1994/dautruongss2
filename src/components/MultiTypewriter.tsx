'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MultiTypewriterProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  highlights?: { [key: string]: string }; // { 'Season 2.0': '#FFD700', 'tôi đang chờ bạn!': '#FF6B35' }
}

export default function MultiTypewriter({ 
  texts, 
  speed = 50,
  deleteSpeed = 25,
  pauseTime = 1500,
  className = '',
  highlights = {}
}: MultiTypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentText = texts[currentTextIndex];
    if (!currentText) return;

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Xử lý pause khi đã gõ xong
    if (!isDeleting && currentIndex >= currentText.length) {
      pauseTimeoutRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);
      return;
    }

    // Xử lý chuyển text khi đã xóa xong - chuyển ngay lập tức
    if (isDeleting && currentIndex <= 0) {
      const nextIndex = (currentTextIndex + 1) % texts.length;
      setCurrentTextIndex(nextIndex);
      setIsDeleting(false);
      setCurrentIndex(0);
      setDisplayedText('');
      return;
    }

    // Gõ hoặc xóa với delay ngắn hơn để mượt mà
    const delay = isDeleting ? deleteSpeed : speed;
    timeoutRef.current = setTimeout(() => {
      if (!isDeleting) {
        // Đang gõ - gõ nhanh hơn
        if (currentIndex < currentText.length) {
          const nextIndex = currentIndex + 1;
          setDisplayedText(currentText.slice(0, nextIndex));
          setCurrentIndex(nextIndex);
        }
      } else {
        // Đang xóa - xóa nhanh hơn
        if (currentIndex > 0) {
          const nextIndex = currentIndex - 1;
          setDisplayedText(currentText.slice(0, nextIndex));
          setCurrentIndex(nextIndex);
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [currentIndex, isDeleting, currentTextIndex, texts, speed, deleteSpeed, pauseTime]);

  // Function để render text với highlights
  const renderTextWithHighlights = (text: string) => {
    if (!highlights || Object.keys(highlights).length === 0) {
      return text;
    }

    const result: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const sortedHighlights = Object.keys(highlights).sort((a, b) => b.length - a.length); // Sort by length để match dài nhất trước

    // Tìm tất cả matches
    const matches: Array<{ start: number; end: number; text: string; color: string }> = [];
    sortedHighlights.forEach(highlightText => {
      const regex = new RegExp(highlightText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          color: highlights[highlightText]
        });
      }
    });

    // Sort matches by start index
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (giữ match đầu tiên)
    const filteredMatches: typeof matches = [];
    matches.forEach(match => {
      const overlaps = filteredMatches.some(existing => 
        (match.start >= existing.start && match.start < existing.end) ||
        (match.end > existing.start && match.end <= existing.end)
      );
      if (!overlaps) {
        filteredMatches.push(match);
      }
    });

    // Build result với highlights
    filteredMatches.forEach((match, index) => {
      // Add text before match
      if (match.start > lastIndex) {
        result.push(text.slice(lastIndex, match.start));
      }
      
      // Add highlighted text
      result.push(
        <span key={`highlight-${index}`} style={{ color: match.color }}>
          {match.text}
        </span>
      );
      
      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    // Nếu không có match nào, return text gốc
    if (result.length === 0) {
      return text;
    }

    return result;
  };

  return (
    <motion.span 
      className={className}
    >
      {renderTextWithHighlights(displayedText)}
      {!isDeleting && displayedText.length > 0 && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-5 bg-white ml-1 align-middle"
        />
      )}
    </motion.span>
  );
}

