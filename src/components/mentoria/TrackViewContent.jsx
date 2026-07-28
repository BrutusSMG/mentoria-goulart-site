// src/components/mentoria/TrackViewContent.jsx
"use client";
import { useEffect } from 'react';
import { trackViewContent } from '@/utils/tracking';

const TrackViewContent = () => {
  useEffect(() => {
    trackViewContent('Mentoria Garimpo Urbano', 2497);
  }, []);
  return null;
};

export default TrackViewContent;