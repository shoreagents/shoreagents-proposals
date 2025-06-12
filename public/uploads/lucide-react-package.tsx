import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Settings, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  Bell, 
  Heart, 
  Star, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  ChevronLeft,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Camera,
  Image,
  FileText,
  Folder
} from 'lucide-react';

export default function LucideReactProject() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [likedItems, setLikedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleLike = (id) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedItems(newLiked);
  };

  const navigationItems = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Mail, label: 'Messages', id: 'messages' },
    { icon: Calendar, label: 'Calendar', id: 'calendar' },
    { icon: Settings, label: 'Settings', id: 'settings' }
  ];

  const mediaItems = [
    { id: 1, title: 'Summer Vibes', type: 'music' },
    { id: 2, title: 'Mountain Adventure', type: 'video' },
    { id: 3, title: 'Coffee Recipe', type: 'document' },
    { id: 4, title: 'Beach Photos', type: 'image' }
  ];

  const getMediaIcon = (type) => {
    switch (type) {
      case 'music': return Play;
      case 'video': return Camera;
      case 'document': return FileText;
      case 'image': return Image;
      default: return Folder;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b backdrop-blur-sm bg-opacity-90`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold">Lucide Dashboard</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 rounded-md hover:bg-opacity-80 transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 rounded-md hover:bg-opacity-80 transition-colors">
                <User size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r pt-16`}>
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                }`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${menuOpen ? 'ml-64' : 'ml-0'} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className={`rounded-xl p-6 mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <h2 className="text-2xl font-bold mb-2">Welcome to Lucide Icons</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Explore beautiful, customizable icons for your React projects
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { icon: Download, label: 'Downloads', value: '2.4K', color: 'text-blue-500' },
              { icon: Star, label: 'Favorites', value: '128', color: 'text-yellow-500' },
              { icon: FileText, label: 'Projects', value: '12', color: 'text-green-500' },
              { icon: Phone, label: 'Contacts', value: '89', color: 'text-purple-500' }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className={`rounded-xl p-6 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <IconComponent className={stat.color} size={24} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Media Player */}
          <div className={`rounded-xl p-6 mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <h3 className="text-lg font-semibold mb-4">Media Controls</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-md hover:bg-opacity-80 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="flex-1 mx-4">
                <div className={`h-2 rounded-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div className="h-2 bg-blue-500 rounded-full w-1/3"></div>
                </div>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                1:23 / 3:45
              </span>
            </div>
          </div>

          {/* Media Library */}
          <div className={`rounded-xl p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Media Library</h3>
              <div className="flex space-x-2">
                <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  <Plus size={16} />
                </button>
                <button className="p-2 rounded-md hover:bg-opacity-80 transition-colors">
                  <Upload size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaItems.map((item) => {
                const IconComponent = getMediaIcon(item.type);
                const isLiked = likedItems.has(item.id);
                
                return (
                  <div key={item.id} className={`p-4 rounded-lg border ${
                    isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  } transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent size={20} className="text-blue-500" />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`p-1 rounded transition-colors ${
                            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className={`text-sm capitalize ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.type}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </div>
  );
}