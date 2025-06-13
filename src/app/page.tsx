'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';


// Lazy load Lottie component
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="w-12 h-12 flex items-center justify-center">
      <svg 
        className="w-10 h-10 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" 
        />
      </svg>
    </div>
  )
});

interface UploadedComponent {
  name: string;
  filename: string;
  uploadDate: string;
  title: string;
  customUrl?: string;
  type?: string;
}

interface LottieAnimationData {
  v: string;
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  nm: string;
  ddd: number;
  assets: unknown[];
  layers: unknown[];
}

// Constants for pagination
// const ITEMS_PER_PAGE = 9; // Removed pagination

export default function Home() {
  const [uploadedComponents, setUploadedComponents] = useState<UploadedComponent[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [errors, setErrors] = useState<{ title?: string; file?: string; url?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUploadType, setSelectedUploadType] = useState<'react' | 'html' | null>(null);
  const [reactAnimation, setReactAnimation] = useState<LottieAnimationData | null>(null);
  const [htmlAnimation, setHtmlAnimation] = useState<LottieAnimationData | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHtmlHovering, setIsHtmlHovering] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const htmlLottieRef = useRef<LottieRefCurrentProps>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isAddModalOpen, _setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'html' | 'react'>('all');
  const [inputMethod, setInputMethod] = useState<'file' | 'code'>('code');
  const [codeContent, setCodeContent] = useState('');
  const [showMethodChangeWarning, setShowMethodChangeWarning] = useState(false);
  const [pendingMethodChange, setPendingMethodChange] = useState<'file' | 'code' | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);



  // Fetch components with filtering (no pagination)
  const fetchComponents = async (search: string, tab: string) => {
    try {
      const queryParams = new URLSearchParams({
        search: search,
        type: tab === 'all' ? '' : tab
      });

      const response = await fetch(`/api/components?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch components');
      const data = await response.json();
      
      setUploadedComponents(data.components);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching components:', error);
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchComponents(searchQuery, activeTab);
  }, [searchQuery, activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComponents(searchQuery, activeTab);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Lazy load animations
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const [reactAnim, htmlAnim] = await Promise.all([
          fetch('/animations/react-animation.json').then(res => res.json()),
          fetch('/animations/html-animation.json').then(res => res.json())
        ]);
        setReactAnimation(reactAnim);
        setHtmlAnimation(htmlAnim);
      } catch (error) {
        console.error('Error loading animations:', error);
      }
    };

    loadAnimations();
  }, []);

  useEffect(() => {
    // Update React animation state when hovering changes
    if (lottieRef.current) {
      if (isHovering) {
        lottieRef.current.setDirection(1); // Play forward
        lottieRef.current.play();
      } else {
        lottieRef.current.setDirection(-1); // Play backward
        lottieRef.current.play();
      }
    }
  }, [isHovering]);

  useEffect(() => {
    // Update HTML animation state when hovering changes
    if (htmlLottieRef.current) {
      if (isHtmlHovering) {
        htmlLottieRef.current.setDirection(1); // Play forward
        htmlLottieRef.current.play();
      } else {
        htmlLottieRef.current.setDirection(-1); // Play backward
        htmlLottieRef.current.play();
      }
    }
  }, [isHtmlHovering]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
          setUploadStatus('');
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Reset modal state when opening/closing

  const resetModalState = () => {
    setSelectedUploadType(null);
    setUploadTitle('');
    setSelectedFile(null);
    setCodeContent('');
    setCustomUrl('');
    setErrors({});
    setUploadStatus('');
    setShowMethodChangeWarning(false);
    setPendingMethodChange(null);
    setInputMethod('code');
    setIsDragActive(false);
    // Reset file input ref
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetModalState();
  };

  const validateUrl = (url: string) => {
    if (!url.trim()) return true; // Empty URL is valid (will use default)
    // Allow only lowercase letters, numbers, and hyphens
    return /^[a-z0-9-]+$/.test(url);
  };

  const handleInputMethodChange = (method: 'file' | 'code') => {
    if (selectedFile || codeContent) {
      setShowMethodChangeWarning(true);
      setPendingMethodChange(method);
    } else {
      setInputMethod(method);
    }
  };

  const handleConfirmMethodChange = () => {
    if (pendingMethodChange) {
      setSelectedFile(null);
      setCodeContent('');
      setErrors(prev => ({ ...prev, file: undefined }));
      setInputMethod(pendingMethodChange);
      setShowMethodChangeWarning(false);
      setPendingMethodChange(null);
    }
  };

  const handleCancelMethodChange = () => {
    setShowMethodChangeWarning(false);
    setPendingMethodChange(null);
  };

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Collect all validation errors at once
    const validationErrors: { title?: string; file?: string; url?: string } = {};

    if (!uploadTitle.trim()) {
      validationErrors.title = 'Title is required';
    }

    if (inputMethod === 'file' && !selectedFile) {
      validationErrors.file = 'Please select a file';
    }

    if (inputMethod === 'code' && !codeContent.trim()) {
      validationErrors.file = 'Please enter your code';
    }

    if (customUrl && !validateUrl(customUrl)) {
      validationErrors.url = 'URL can only contain lowercase letters, numbers, and hyphens';
    }

    // If there are validation errors, show them all and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    const formData = new FormData();
    if (inputMethod === 'file') {
      formData.append('file', selectedFile!);
    } else {
      // Create a file from the code content
      const file = new File(
        [codeContent], 
        `${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.tsx`, 
        { type: 'text/plain' }
      );
      formData.append('file', file);
    }
    formData.append('title', uploadTitle);
    
    // Send the custom URL as-is (empty if not provided, let API handle auto-generation)
    formData.append('customUrl', customUrl.trim());

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message === 'This custom URL is already in use') {
          setErrors(prev => ({ ...prev, url: error.message }));
        } else {
          throw new Error(error.message || 'Upload failed');
        }
        return;
      }

      // Refresh the components list
      fetchComponents(searchQuery, activeTab);

      // Reset form and close modal
      setIsModalOpen(false);
      resetModalState();
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ ...prev, file: error instanceof Error ? error.message : 'Failed to upload file' }));
    }
  };

  const handleHtmlUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadStatus('');

    // Collect all validation errors at once
    const validationErrors: { title?: string; file?: string; url?: string } = {};

    if (!uploadTitle.trim()) {
      validationErrors.title = 'Title is required';
    }

    if (inputMethod === 'file') {
      if (!selectedFile) {
        validationErrors.file = 'Please select a file to upload.';
      } else {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!['html', 'htm'].includes(ext || '')) {
          validationErrors.file = 'Only .html and .htm files are allowed';
        }
      }
    }

    if (inputMethod === 'code' && !codeContent.trim()) {
      validationErrors.file = 'Please enter your code';
    }

    if (customUrl && !validateUrl(customUrl)) {
      validationErrors.url = 'URL can only contain lowercase letters, numbers, and hyphens';
    }

    // If there are validation errors, show them all and return
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear any previous errors
    setErrors({});

    const formData = new FormData();
    if (inputMethod === 'file') {
      formData.append('file', selectedFile!);
    } else {
      // Create a file from the code content
      const file = new File(
        [codeContent], 
        `${uploadTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`, 
        { type: 'text/plain' }
      );
      formData.append('file', file);
    }
    formData.append('title', uploadTitle);
    
    // Send the custom URL as-is (empty if not provided, let API handle auto-generation)
    formData.append('customUrl', customUrl.trim());

    try {
      const response = await fetch('/api/upload/html', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        // Check for custom URL conflict
        if (error.message && error.message.toLowerCase().includes('custom url')) {
          setErrors(prev => ({ ...prev, url: error.message }));
          return;
        }
        throw new Error(error.message || 'Upload failed');
      }

      // Refresh the components list
      fetchComponents(searchQuery, activeTab);

      // Reset form and close modal immediately
      setIsModalOpen(false);
      resetModalState();
    } catch (error) {
      console.error('Error uploading HTML file:', error);
      // If not a custom URL error, set as file error
      if (error instanceof Error && error.message.toLowerCase().includes('custom url')) {
        setErrors(prev => ({ ...prev, url: error.message }));
      } else {
        setErrors(prev => ({ ...prev, file: error instanceof Error ? error.message : 'Failed to upload HTML file' }));
      }
    }
  };

  const filteredComponents = useMemo(() => {
    return uploadedComponents.filter(component => {
      const matchesSearch = component.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isHtml = component.filename.toLowerCase().endsWith('.html');
      const matchesTab = activeTab === 'all' || (activeTab === 'html' && isHtml) || (activeTab === 'react' && !isHtml);
      return matchesSearch && matchesTab;
    });
  }, [uploadedComponents, searchQuery, activeTab]);

  const isHtmlUpload = (type: 'react' | 'html' | null): type is 'html' => type === 'html';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgb(229, 231, 235)' }}>
                <h2 className="text-2xl font-semibold text-gray-800">Add Proposal</h2>
                {!selectedUploadType && (
                  <button
                    onClick={handleCloseModal}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors text-3xl font-bold focus:outline-none cursor-pointer"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {!selectedUploadType ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* HTML Template Box */}
                      <button
                        onClick={() => setSelectedUploadType('html')}
                        onMouseEnter={() => setIsHtmlHovering(true)}
                        onMouseLeave={() => setIsHtmlHovering(false)}
                        className="group relative p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 transition-all cursor-pointer text-left"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                            {htmlAnimation ? (
                              <div className="w-12 h-12">
                                <Lottie
                                  animationData={htmlAnimation}
                                  loop={false}
                                  autoplay={false}
                                  lottieRef={htmlLottieRef}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center">
                                <svg 
                                  className="w-10 h-10 text-blue-600 group-hover:text-blue-600" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">HTML</h4>
                          <p className="text-sm text-gray-500">
                            Upload an HTML template
                          </p>
                        </div>
                      </button>

                      {/* React Component Box */}
                      <button
                        onClick={() => setSelectedUploadType('react')}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className="group relative p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-500 transition-all cursor-pointer text-left"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                            {reactAnimation ? (
                              <div className="w-12 h-12">
                                <Lottie
                                  animationData={reactAnimation}
                                  loop={false}
                                  autoplay={false}
                                  lottieRef={lottieRef}
                                  style={{ width: '100%', height: '100%' }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center">
                                <svg 
                                  className="w-10 h-10 text-purple-600 group-hover:text-purple-600" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">React</h4>
                          <p className="text-sm text-gray-500">
                            Upload a TSX file containing a React component
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Back button */}
                    <button
                      onClick={() => setSelectedUploadType(null)}
                      className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer font-semibold"
                    >
                      <span className="mr-1">←</span>
                      Back to Selection
                    </button>

                    {selectedUploadType === 'react' && (
                      <form onSubmit={handleFileUpload} className="space-y-4">
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="title" className="text-sm font-medium text-gray-900">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={uploadTitle}
                            onChange={(e) => {
                              setUploadTitle(e.target.value);
                              if (errors.title) {
                                setErrors(prev => ({ ...prev, title: undefined }));
                              }
                            }}
                            placeholder="Enter a title for your proposal"
                            className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${
                              errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isUploading}
                          />
                          {errors.title && (
                            <p className="text-red-500 text-xs">{errors.title}</p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-0.5">
                          <label className="text-sm font-medium text-gray-900">
                            Input Method
                          </label>
                          <div className="flex space-x-2 mb-2">
                            <button
                              type="button"
                              onClick={() => handleInputMethodChange('code')}
                              className={`flex items-center justify-center px-6 py-2 bg-white border ${
                                inputMethod === 'code'
                                  ? 'border-gray-500 text-gray-900'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              } rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                            >
                              Paste Code
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputMethodChange('file')}
                              className={`flex items-center justify-center px-6 py-2 bg-white border ${
                                inputMethod === 'file'
                                  ? 'border-gray-500 text-gray-900'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              } rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                            >
                              Upload File
                            </button>
                          </div>
                          {showMethodChangeWarning && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-yellow-700">
                                  Switch to {pendingMethodChange === 'file' ? 'file upload' : 'code input'}? This will clear your current {selectedFile ? 'file' : 'code'}.
                                </p>
                                <div className="flex space-x-4 ml-2">
                                  <button
                                    type="button"
                                    onClick={handleConfirmMethodChange}
                                    className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelMethodChange}
                                    className="text-xs font-medium text-gray-600 hover:text-gray-700 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {inputMethod === 'file' ? (
                            <>
                              <div
                                className={`h-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 flex items-center justify-center transition-colors cursor-pointer ${
                                  errors.file ? 'border-red-500' : isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                                }`}
                                tabIndex={0}
                                role="button"
                                aria-label="File upload area"
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                                onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
                                onDrop={e => {
                                  e.preventDefault();
                                  setIsDragActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setSelectedFile(e.dataTransfer.files[0]);
                                  }
                                }}
                              >
                                <input
                                  type="file"
                                  id="file"
                                  name="file"
                                  accept={isHtmlUpload(selectedUploadType) ? '.html,.htm' : '.tsx'}
                                  ref={fileInputRef}
                                  style={{ display: 'none' }}
                                  onChange={e => {
                                    if (errors.file) setErrors(prev => ({ ...prev, file: undefined }));
                                    setSelectedFile(e.target.files?.[0] || null);
                                  }}
                                  disabled={isUploading}
                                />
                                {!selectedFile ? (
                                  <span className="text-gray-400 text-center select-none">
                                    Click or drag file to upload
                                  </span>
                                ) : (
                                  <span className="text-gray-800 truncate w-full text-center select-none">
                                    {selectedFile.name}
                                  </span>
                                )}
                              </div>
                              {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <textarea
                                id="code"
                                name="code"
                                value={codeContent}
                                onChange={(e) => {
                                  if (errors.file) {
                                    setErrors(prev => ({ ...prev, file: undefined }));
                                  }
                                  setCodeContent(e.target.value);
                                }}
                                placeholder="Paste your React code here..."
                                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 font-mono text-sm h-48 resize-none ${
                                  errors.file ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isUploading}
                              />
                              {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex flex-col space-y-0.5">
                          <label htmlFor="customUrl" className="text-sm font-medium text-gray-900">
                            Custom URL (optional)
                          </label>
                          <div className="flex flex-col">
                            <input
                              type="text"
                              id="customUrl"
                              name="customUrl"
                              value={customUrl}
                              onChange={(e) => {
                                const urlValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                setCustomUrl(urlValue);
                                if (errors.url) {
                                  setErrors(prev => ({ ...prev, url: undefined }));
                                }
                              }}
                              placeholder="e.g. my-proposal-2025"
                              className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${
                                errors.url ? 'border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isUploading}
                            />
                            {errors.url && (
                              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Only lowercase letters, numbers, and hyphens are allowed. Spaces will be converted to hyphens automatically.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
                            disabled={isUploading}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUploading}
                            className={`flex-1 ${
                              isHtmlUpload(selectedUploadType)
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600'
                                : 'bg-purple-600 hover:bg-purple-700 disabled:hover:bg-purple-600'
                            } text-white py-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                          >
                            Upload
                          </button>
                        </div>
                      </form>
                    )}

                    {selectedUploadType === 'html' && (
                      <form onSubmit={handleHtmlUpload} className="space-y-4">
                        <div className="flex flex-col space-y-1">
                          <label htmlFor="title" className="text-sm font-medium text-gray-900">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            value={uploadTitle}
                            onChange={(e) => {
                              setUploadTitle(e.target.value);
                              if (errors.title) {
                                setErrors(prev => ({ ...prev, title: undefined }));
                              }
                            }}
                            placeholder="Enter a title for your HTML template"
                            className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${
                              errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={isUploading}
                          />
                          {errors.title && (
                            <p className="text-red-500 text-xs">{errors.title}</p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-0.5">
                          <label className="text-sm font-medium text-gray-900">
                            Input Method
                          </label>
                          <div className="flex space-x-2 mb-2">
                            <button
                              type="button"
                              onClick={() => handleInputMethodChange('code')}
                              className={`flex items-center justify-center px-6 py-2 bg-white border ${
                                inputMethod === 'code'
                                  ? 'border-gray-500 text-gray-900'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              } rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                            >
                              Paste Code
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputMethodChange('file')}
                              className={`flex items-center justify-center px-6 py-2 bg-white border ${
                                inputMethod === 'file'
                                  ? 'border-gray-500 text-gray-900'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              } rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                            >
                              Upload File
                            </button>
                          </div>
                          {showMethodChangeWarning && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-yellow-700">
                                  Switch to {pendingMethodChange === 'file' ? 'file upload' : 'code input'}? This will clear your current {selectedFile ? 'file' : 'code'}.
                                </p>
                                <div className="flex space-x-4 ml-2">
                                  <button
                                    type="button"
                                    onClick={handleConfirmMethodChange}
                                    className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelMethodChange}
                                    className="text-xs font-medium text-gray-600 hover:text-gray-700 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {inputMethod === 'file' ? (
                            <>
                              <div
                                className={`h-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 flex items-center justify-center transition-colors cursor-pointer ${
                                  errors.file ? 'border-red-500' : isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                                }`}
                                tabIndex={0}
                                role="button"
                                aria-label="File upload area"
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                                onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
                                onDrop={e => {
                                  e.preventDefault();
                                  setIsDragActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setSelectedFile(e.dataTransfer.files[0]);
                                  }
                                }}
                              >
                                <input
                                  type="file"
                                  id="file"
                                  name="file"
                                  accept={isHtmlUpload(selectedUploadType) ? '.html,.htm' : '.tsx'}
                                  ref={fileInputRef}
                                  style={{ display: 'none' }}
                                  onChange={e => {
                                    if (errors.file) setErrors(prev => ({ ...prev, file: undefined }));
                                    setSelectedFile(e.target.files?.[0] || null);
                                  }}
                                  disabled={isUploading}
                                />
                                {!selectedFile ? (
                                  <span className="text-gray-400 text-center select-none">
                                    Click or drag file to upload
                                  </span>
                                ) : (
                                  <span className="text-gray-800 truncate w-full text-center select-none">
                                    {selectedFile.name}
                                  </span>
                                )}
                              </div>
                              {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <textarea
                                id="code"
                                name="code"
                                value={codeContent}
                                onChange={(e) => {
                                  if (errors.file) {
                                    setErrors(prev => ({ ...prev, file: undefined }));
                                  }
                                  setCodeContent(e.target.value);
                                }}
                                placeholder="Paste your HTML code here..."
                                className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 font-mono text-sm h-48 resize-none ${
                                  errors.file ? 'border-red-500' : 'border-gray-300'
                                }`}
                                disabled={isUploading}
                              />
                              {errors.file && (
                                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex flex-col space-y-0.5">
                          <label htmlFor="customUrl" className="text-sm font-medium text-gray-900">
                            Custom URL (optional)
                          </label>
                          <div className="flex flex-col">
                            <input
                              type="text"
                              id="customUrl"
                              name="customUrl"
                              value={customUrl}
                              onChange={(e) => {
                                const urlValue = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                setCustomUrl(urlValue);
                                if (errors.url) {
                                  setErrors(prev => ({ ...prev, url: undefined }));
                                }
                              }}
                              placeholder="e.g. my-proposal-2025"
                              className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${
                                errors.url ? 'border-red-500' : 'border-gray-300'
                              }`}
                              disabled={isUploading}
                            />
                            {errors.url && (
                              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Only lowercase letters, numbers, and hyphens are allowed. Spaces will be converted to hyphens automatically.
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
                            disabled={isUploading}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUploading}
                            className={`flex-1 ${
                              isHtmlUpload(selectedUploadType)
                                ? 'bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600'
                                : 'bg-purple-600 hover:bg-purple-700 disabled:hover:bg-purple-600'
                            } text-white py-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                          >
                            Upload
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Components List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              {isLoading ? (
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <h2 className="text-2xl font-semibold text-gray-800">Proposals</h2>
              )}
              <span className="text-sm text-gray-500">
                {isLoading ? (
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  `${uploadedComponents.length} Proposal${uploadedComponents.length !== 1 ? 's' : ''}`
                )}
              </span>
            </div>

            <div className="space-y-4">
              {/* Search and Tabs */}
              {isLoading ? (
                <div className="space-y-4">
                  {/* Search Bar Skeleton */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-300 animate-pulse" />
                    </div>
                    <div className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Tabs and Add Button Row Skeleton */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="h-8 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-8 w-14 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 w-36 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search proposals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  {/* Tabs and Add Button Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                          activeTab === 'all'
                            ? 'bg-gray-300 text-gray-900'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setActiveTab('html')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                          activeTab === 'html'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        HTML
                      </button>
                      <button
                        onClick={() => setActiveTab('react')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                          activeTab === 'react'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        React
                      </button>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-gray-600 px-4 py-2 rounded-md hover:text-gray-800 transition-colors font-semibold cursor-pointer"
                    >
                      + Add New Proposal
                    </button>
                  </div>
                </div>
              )}

              {/* Content Area */}
              {isLoading ? (
                // Skeleton loader for cards
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="block p-6 bg-white rounded-lg border border-gray-200 relative min-h-[120px] animate-pulse"
                    >
                      {/* Badge skeleton */}
                      <div className="absolute top-2 right-2">
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                      {/* Date skeleton */}
                      <div className="absolute bottom-2 right-2">
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                      </div>
                      {/* Title skeleton */}
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : uploadedComponents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No proposals yet</p>
                  <p className="text-gray-400 text-sm mb-6">
                    Click &quot;Add New Proposal&quot; to upload your first TSX proposal
                  </p>
                </div>
              ) : (
                // Cards Grid with actual content
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredComponents.map((component, index) => {
                    const isHtml = component.filename.toLowerCase().endsWith('.html');
                    const hoverColor = isHtml ? 'blue' : 'purple';
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const _previewUrl = component.customUrl || component.filename;
                    return (
                      <Link
                        key={`${component.filename}-${index}`}
                        href={`/preview/${component.customUrl || component.filename}`}
                        className={`block p-6 bg-white rounded-lg border border-gray-200 hover:border-${hoverColor}-500 transition-colors relative group min-h-[120px]`}
                      >
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors bg-${hoverColor}-100 text-${hoverColor}-800 group-hover:bg-${hoverColor}-200 group-hover:text-${hoverColor}-900`}>
                            {isHtml ? 'HTML' : 'React'}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <p className="text-[11px] text-gray-500">
                            Created: {new Date(component.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <h3 className={`font-semibold text-lg text-gray-800 group-hover:text-${hoverColor}-600 pr-16`}>
                          {component.title}
                        </h3>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
