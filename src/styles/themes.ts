import { Theme } from '../types';

const nexaDark: Theme = {
  name: 'NexaDark',
  colors: {
    '--background-color': '#121212',
    '--text-color': '#E0E0E0',
    '--primary-color': '#4A90E2',
    '--sidebar-bg': '#1E1E1E',
    '--note-list-bg': '#252526',
    '--note-item-bg': '#2D2D2D',
    '--note-item-hover-bg': '#3A3D41',
    '--note-item-selected-bg': '#094771',
    '--editor-bg': '#1E1E1E',
    '--border-color': '#333',
    '--button-bg': '#3A3D41',
    '--button-hover-bg': '#4A4D51',
    '--font-family': "'Roboto', sans-serif",
  }
};

const solaris: Theme = {
  name: 'Solaris',
  colors: {
    '--background-color': '#F4F7FC',
    '--text-color': '#1A202C',
    '--primary-color': '#3182CE',
    '--sidebar-bg': '#FFFFFF',
    '--note-list-bg': '#EDF2F7',
    '--note-item-bg': '#FFFFFF',
    '--note-item-hover-bg': '#E2E8F0',
    '--note-item-selected-bg': '#BEE3F8',
    '--editor-bg': '#FFFFFF',
    '--border-color': '#CBD5E0',
    '--button-bg': '#E2E8F0',
    '--button-hover-bg': '#CBD5E0',
    '--font-family': "'Roboto', sans-serif",
  }
};

const cyberpunk: Theme = {
  name: 'CyberPunk',
  colors: {
    '--background-color': '#0d0221',
    '--text-color': '#f0f0f0',
    '--primary-color': '#f923e2',
    '--sidebar-bg': '#261447',
    '--note-list-bg': '#1a0a34',
    '--note-item-bg': '#261447',
    '--note-item-hover-bg': '#3b2263',
    '--note-item-selected-bg': '#5c3da1',
    '--editor-bg': '#0d0221',
    '--border-color': '#4a0d66',
    '--button-bg': '#ff00a0',
    '--button-hover-bg': '#ff48c4',
    '--font-family': "'Roboto', sans-serif",
  }
};

const matrix: Theme = {
  name: 'Matrix',
  colors: {
    '--background-color': '#000000',
    '--text-color': '#00FF41',
    '--primary-color': '#00FF41',
    '--sidebar-bg': '#050505',
    '--note-list-bg': '#0a0a0a',
    '--note-item-bg': '#050505',
    '--note-item-hover-bg': '#141414',
    '--note-item-selected-bg': '#0a2a0a',
    '--editor-bg': '#030303',
    '--border-color': '#005F00',
    '--button-bg': '#003B00',
    '--button-hover-bg': '#005F00',
    '--font-family': "'Roboto Mono', monospace",
  }
};


export const appThemes = [nexaDark, solaris, cyberpunk, matrix];
