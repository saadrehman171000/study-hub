import React from 'react';
import { Music, Moon, Coffee, Sunset, Cloud, Stars, Waves, Mountain, Sun, Book, Clock, Heart, Wind, Glasses } from 'lucide-react';

interface MusicIconProps {
  trackId: string;
  className?: string;
  size?: number;
}

// Maps track names to corresponding icons
const iconMap: Record<string, React.ReactNode> = {
  'ASHUTOSH-Jaipur': <Sun />,
  'barradeen-bedtime-after-a-coffee': <Coffee />,
  'Beloved': <Heart />,
  'Crescent-Moon': <Moon />,
  'Deal': <Book />,
  'Evening-Improvisation-with-Ethera': <Sunset />,
  'Heart-Of-The-Ocean': <Waves />,
  'Inspire-ashutosh': <Mountain />,
  'keys-of-moon-white-petals': <Stars />,
  'Lost-and-Found': <Glasses />,
  'Lovely-Long-Version': <Heart />,
  'Midnight-Stroll-Lofi-Study-Music': <Moon />,
  'Missing-You': <Cloud />,
  'Powerful-Trap': <Wind />,
  'storm-clouds-purpple-cat': <Cloud />,
  'Tokyo-Music-Walker-Brunch-For-Two': <Clock />,
  'tokyo-music-walker-sunset-drive': <Sunset />,
  'When-I-Was-A-Boy': <Music />
};

// Color map for different music categories
const colorMap: Record<string, string> = {
  'focus': 'text-blue-500',
  'ambient': 'text-purple-500',
  'chill': 'text-green-500',
  'lofi': 'text-indigo-500',
  'classical': 'text-amber-500'
};

// Function to get the icon key from the file name
const getIconKey = (filename: string): string => {
  if (!filename) return '';
  const match = filename.match(/\/([^\/]+)\.mp3$/);
  return match ? match[1] : '';
};

export const MusicIcon: React.FC<MusicIconProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  trackId, 
  className = '', 
  size = 24,
  ...props 
}) => {
  // Default icon if no match is found
  const defaultIcon = <Music size={size} className={`text-gray-400 ${className}`} />;
  
  // If no trackId provided, return default
  if (!trackId) return <div {...props}>{defaultIcon}</div>;
  
  // Get icon based on track name
  const iconKey = getIconKey(trackId);
  const icon = iconMap[iconKey] || defaultIcon;
  
  // Clone the icon element with the size prop
  const iconWithProps = React.cloneElement(icon as React.ReactElement, { 
    size,
    className: `${className}`
  });
  
  return <div {...props}>{iconWithProps}</div>;
};

// Random gradient backgrounds for music tracks
export const getRandomGradient = (trackId: string): string => {
  // Seed the randomness based on track ID to get consistent gradients for each track
  const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const gradients = [
    'bg-gradient-to-r from-blue-400 to-indigo-600',
    'bg-gradient-to-r from-purple-400 to-pink-600',
    'bg-gradient-to-r from-green-400 to-teal-600',
    'bg-gradient-to-r from-yellow-400 to-orange-600',
    'bg-gradient-to-r from-red-400 to-pink-600',
    'bg-gradient-to-r from-indigo-400 to-blue-600',
    'bg-gradient-to-r from-pink-400 to-purple-600',
    'bg-gradient-to-r from-teal-400 to-green-600',
    'bg-gradient-to-r from-amber-400 to-yellow-600',
    'bg-gradient-to-r from-blue-500 to-purple-600',
    'bg-gradient-to-r from-green-500 to-cyan-600',
    'bg-gradient-to-r from-pink-500 to-rose-600',
    'bg-gradient-to-r from-violet-400 to-indigo-600',
    'bg-gradient-to-r from-slate-400 to-gray-600',
    'bg-gradient-to-r from-emerald-400 to-teal-600',
    'bg-gradient-to-r from-amber-400 to-orange-600',
    'bg-gradient-to-r from-sky-400 to-blue-600',
    'bg-gradient-to-r from-rose-400 to-red-600'
  ];
  
  // Use the hash to pick a gradient
  const index = hash % gradients.length;
  return gradients[index];
};

// Generate vibrant cover art for tracks with placeholder cover images
export const MusicCoverArt: React.FC<{ trackId: string; className?: string }> = ({ 
  trackId, 
  className = '' 
}) => {
  const gradient = getRandomGradient(trackId);
  const iconKey = getIconKey(trackId);
  const icon = iconMap[iconKey] || <Music />;
  
  // Clone the icon element with size and color
  const iconWithProps = React.cloneElement(icon as React.ReactElement, { 
    size: 48,
    className: "text-white opacity-80"
  });
  
  return (
    <div className={`${gradient} ${className} flex items-center justify-center rounded-lg overflow-hidden`}>
      {iconWithProps}
    </div>
  );
}; 