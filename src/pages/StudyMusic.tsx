import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Volume1, VolumeX, Clock, Loader2 } from 'lucide-react';
import { useApi } from '../lib/api/ApiContext';
import { MusicTrack as MusicTrackType } from '../lib/api/musicService';
import { MusicIcon, MusicCoverArt } from '../components/MusicIcons';

// Music categories
const categories = [
  { id: 'all', name: 'All Tracks' },
  { id: 'focus', name: 'Focus' },
  { id: 'ambient', name: 'Ambient' },
  { id: 'chill', name: 'Chill' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'classical', name: 'Classical' }
];

export function StudyMusic() {
  const [tracks, setTracks] = useState<MusicTrackType[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrackType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30); // in minutes
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);
  const { musicService } = useApi();

  // Fetch music tracks from the API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const musicTracks = await musicService.getMusicTracks(
          selectedCategory !== 'all' ? selectedCategory : undefined
        );
        
        setTracks(musicTracks);
        
        // Set the first track as current if none is selected
        if (!currentTrack && musicTracks.length > 0) {
          setCurrentTrack(musicTracks[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching music tracks:', err);
        setError('Failed to load music tracks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [musicService, selectedCategory, currentTrack]);

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle track change
  const changeTrack = (track: MusicTrackType) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // The audio will start playing when the src changes due to the useEffect below
  };

  // Handle next track
  const nextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    changeTrack(tracks[nextIndex]);
  };

  // Handle previous track
  const prevTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    
    const currentIndex = tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    changeTrack(tracks[prevIndex]);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start study timer
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimerActive(true);
    setTimerRemaining(timerDuration * 60); // convert to seconds
    
    timerRef.current = window.setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          // Timer finished
          setTimerActive(false);
          if (timerRef.current) clearInterval(timerRef.current);
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel timer
  const cancelTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimerActive(false);
  };

  // Format timer display
  const formatTimerDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Effect to play audio when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.audioSrc;
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Music</h1>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {loading && !currentTrack ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Music Player */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-sm p-6"
              >
                {currentTrack ? (
                  <div className="flex flex-col items-center">
                    {/* Album Art */}
                    <div className="w-48 h-48 mb-6 rounded-lg overflow-hidden bg-gray-200 dark:bg-dark-200">
                      {currentTrack.coverImage === '/placeholder.svg?height=80&width=80' ? (
                        <MusicCoverArt trackId={currentTrack.audioSrc} className="w-full h-full" />
                      ) : (
                        <img 
                          src={currentTrack.coverImage} 
                          alt={currentTrack.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentTrack.title}</h2>
                      <p className="text-gray-500 dark:text-gray-400">{currentTrack.artist}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full mb-4">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 dark:bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-6">
                      <button 
                        onClick={prevTrack}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <SkipBack className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={togglePlay}
                        className="p-4 bg-primary-600 dark:bg-primary-500 text-white rounded-full hover:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </button>
                      <button 
                        onClick={nextTrack}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <SkipForward className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center mt-6 w-full max-w-xs">
                      <button className="text-gray-600 dark:text-gray-300 mr-2">
                        {volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : volume < 0.5 ? (
                          <Volume1 className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-200 dark:bg-dark-300 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-400"
                      />
                    </div>

                    {/* Hidden audio element */}
                    <audio
                      ref={audioRef}
                      src={currentTrack.audioSrc}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={nextTrack}
                      onLoadedMetadata={handleTimeUpdate}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500 dark:text-gray-400">No tracks available</p>
                  </div>
                )}
              </motion.div>

              {/* Study Timer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-sm p-6 mt-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Timer</h2>
                
                {timerActive ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                      {formatTimerDisplay(timerRemaining)}
                    </div>
                    <button
                      onClick={cancelTimer}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Cancel Timer
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="w-full md:flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (minutes)
                      </label>
                      <select
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-dark-200 bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                    <button
                      onClick={startTimer}
                      className="w-full md:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 flex items-center justify-center font-medium transition-colors"
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Start Study Session
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Track List */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-100 rounded-xl shadow-sm p-6 h-full"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedCategory === category.id
                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-dark-200 dark:text-gray-300'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tracks</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[500px]">
                    {tracks.length === 0 ? (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No tracks found in this category
                      </p>
                    ) : (
                      tracks.map(track => (
                        <div
                          key={track.id}
                          onClick={() => changeTrack(track)}
                          className={`flex items-center p-2 rounded-lg cursor-pointer ${
                            currentTrack?.id === track.id
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-dark-200'
                          }`}
                        >
                          <div className="w-10 h-10 mr-3 rounded overflow-hidden bg-gray-200 dark:bg-dark-300">
                            {track.coverImage === '/placeholder.svg?height=80&width=80' ? (
                              <MusicCoverArt trackId={track.audioSrc} className="w-full h-full" />
                            ) : (
                              <img 
                                src={track.coverImage} 
                                alt={track.title} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-medium truncate ${
                              currentTrack?.id === track.id
                                ? 'text-primary-800 dark:text-primary-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {track.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {track.artist}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex items-center">
                            <MusicIcon trackId={track.audioSrc} size={16} className="mr-1" />
                            {track.duration}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}