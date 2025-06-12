'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Download, Code, Code2, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HtmlRendererProps {
  code: string;
  filename: string;
  title: string;
  uploadDate?: string;
  customUrl?: string;
  mode?: 'preview' | 'component' | 'fullScreen';
  showLoadingText?: boolean;
  features?: {
    showProposalDetails?: boolean;
    showDelete?: boolean;
    showDownload?: boolean;
    showViewProposal?: boolean;
    showFileInfo?: boolean;
    showLivePreview?: boolean;
    showCode?: boolean;
    showTestingSection?: boolean;
    showUpdate?: boolean;
  };
  onDelete?: () => Promise<void>;
  onDownload?: () => void;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ 
  code, 
  filename, 
  title,
  uploadDate,
  customUrl,
  mode = 'preview',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showLoadingText: _showLoadingText = true,
  features = {
    showProposalDetails: true,
    showDelete: true,
    showDownload: true,
    showViewProposal: true,
    showFileInfo: true,
    showLivePreview: true,
    showCode: true,
    showTestingSection: true,
    showUpdate: true
  },
  onDelete,
  onDownload
}) => {
  const [showCode, setShowCode] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState(title);
  const [updateCustomUrl, setUpdateCustomUrl] = useState(customUrl || '');
  const [updateInputMethod, setUpdateInputMethod] = useState<'file' | 'code'>('code');
  const [updateCodeContent, setUpdateCodeContent] = useState(code);
  const [updateSelectedFile, setUpdateSelectedFile] = useState<File | null>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string | undefined>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [showMethodChangeWarning, setShowMethodChangeWarning] = useState(false);
  const [pendingMethodChange, setPendingMethodChange] = useState<'file' | 'code' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if ((!features.showTestingSection || mode === 'fullScreen') && features.showLivePreview) {
      setShowLivePreview(true);
    }
  }, [features.showTestingSection, features.showLivePreview, mode]);

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete();
      } else {
        const response = await fetch(`/api/delete/${encodeURIComponent(filename)}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/');
        } else {
          console.error('Failed to delete proposal');
        }
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenUpdateModal = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/components/${filename}`);
      if (response.ok) {
        const data = await response.json();
        setUpdateTitle(data.metadata?.title || title);
        setUpdateCustomUrl(data.metadata?.customUrl || '');
        setUpdateCodeContent(data.content || code);
        setUpdateSelectedFile(null);
        setUpdateInputMethod('code');
        setUpdateErrors({});
      }
    } catch {}
    setIsUpdating(false);
    setShowUpdateModal(true);
  };

  const resetUpdateModalState = () => {
    setUpdateTitle(title);
    setUpdateCustomUrl(customUrl || '');
    setUpdateInputMethod('code');
    setUpdateCodeContent(code);
    setUpdateSelectedFile(null);
    setUpdateErrors({});
    setIsUpdating(false);
    setShowMethodChangeWarning(false);
    setPendingMethodChange(null);
    setIsDragActive(false);
  };

  if (mode === 'fullScreen') {
    return (
      <div className="w-full">
        <iframe
          srcDoc={code}
          className="w-full border-0"
          style={{ height: 'auto', minHeight: '100vh' }}
          sandbox="allow-scripts"
          title="HTML Preview"
          onLoad={(e) => {
            const iframe = e.target as HTMLIFrameElement;
            if (iframe.contentWindow) {
              const height = iframe.contentWindow.document.documentElement.scrollHeight;
              iframe.style.height = `${height}px`;
            }
          }}
        />

      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Proposal Details */}
      {features.showProposalDetails && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
          {uploadDate && (
            <div className="absolute top-2 right-2">
              <p className="text-[11px] text-gray-500">
                Created: {new Date(uploadDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <h4 className="font-semibold text-gray-800 mb-2">Proposal Details</h4>
          <div className="grid grid-cols-12 gap-4 text-sm">
            <div className="col-span-12">
              <span className="font-medium text-gray-600">Title:</span>
              <p className="text-gray-800 text-xl font-semibold">{title}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 relative">
            {features.showViewProposal && (
              <a
                href={`/${customUrl || filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-[140px] justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Proposal
              </a>
            )}
            {/* Absolutely positioned icons at the bottom-right */}
            <div className="absolute right-1 -bottom-2 flex items-center gap-2">
              {features.showUpdate && (
                <div className="relative group">
                  <button
                    onClick={handleOpenUpdateModal}
                    className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap">
                    Update Proposal
                  </span>
                </div>
              )}
              {features.showDelete && (
                <div className="relative group">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap">
                    Delete Proposal
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && features.showDelete && (
        <div 
          className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-xl border border-gray-200 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6" style={{ borderBottom: '1px solid rgb(229, 231, 235)' }}>
              <h2 className="text-2xl font-semibold text-gray-800">Delete Proposal</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-800">&quot;{title}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-full cursor-pointer hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Information */}
      {features.showFileInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2">File Information</h4>
          <div className="grid grid-cols-12 gap-4 text-sm">
            <div className="col-span-8">
              <span className="font-medium text-gray-600">Filename:</span>
              <p className="text-gray-800 font-mono text-xs truncate" title={filename}>{filename}</p>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">File Size:</span>
              <p className="text-gray-800">{(code.length / 1024).toFixed(2)} KB</p>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Lines of Code:</span>
              <p className="text-gray-800">{code.split('\n').length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Testing Section */}
      {features.showTestingSection && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-blue-800 font-semibold mb-2">
            Testing
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            View the code, test with live preview, or download the file.
          </p>
          <div className="flex flex-wrap gap-3">
            {features.showCode && (
              <button
                onClick={() => {
                  setShowCode(!showCode);
                  if (!showCode) setShowLivePreview(false);
                }}
                className={`flex items-center gap-2 px-6 py-2 bg-white border ${
                  showCode ? 'border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'
                } rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium min-w-[140px] justify-center cursor-pointer`}
              >
                {showCode ? (
                  <>
                    <Code2 className="w-4 h-4" />
                    Hide Code
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    Show Code
                  </>
                )}
              </button>
            )}
            {features.showLivePreview && (
              <button
                onClick={() => {
                  if (!showLivePreview) {
                    setShowCode(false);
                  }
                  setShowLivePreview(!showLivePreview);
                }}
                className={`flex items-center gap-2 px-6 py-2 bg-white border ${
                  showLivePreview ? 'border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'
                } rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium min-w-[140px] justify-center cursor-pointer`}
              >
                {showLivePreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </>
                )}
              </button>
            )}
            {features.showDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-[160px] justify-center cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download HTML
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Preview Display */}
      {showLivePreview && features.showLivePreview && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-800 mb-4">Live Preview</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-auto h-[100vh] min-h-[600px]">
            <iframe
              srcDoc={code}
              className="w-full h-full border-0"
              sandbox="allow-scripts"
              title="HTML Preview"
            />
          </div>
        </div>
      )}

      {/* Code Display */}
      {showCode && features.showCode && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-xl">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCopyCode}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              Copy Code
            </button>
          </div>
          <pre className="text-sm overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Update Proposal</h2>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setUpdateErrors({});
                setIsUpdating(true);
                if (!updateTitle.trim()) {
                  setUpdateErrors({ title: 'Title is required' });
                  setIsUpdating(false);
                  return;
                }
                if (updateInputMethod === 'file' && !updateSelectedFile) {
                  setUpdateErrors({ file: 'Please select a file to upload.' });
                  setIsUpdating(false);
                  return;
                }
                if (updateInputMethod === 'file' && updateSelectedFile) {
                  const ext = updateSelectedFile.name.split('.').pop()?.toLowerCase();
                  if (!['html', 'htm'].includes(ext || '')) {
                    setUpdateErrors({ file: 'Only .html and .htm files are allowed' });
                    setIsUpdating(false);
                    return;
                  }
                }
                if (updateInputMethod === 'code') {
                  if (!updateCodeContent.trim()) {
                    setUpdateErrors({ file: 'Please enter your code' });
                    setIsUpdating(false);
                    return;
                  }
                  if (!updateCodeContent.includes('<!DOCTYPE html>') && !updateCodeContent.includes('<html')) {
                    setUpdateErrors({ file: 'Code must be a valid HTML document' });
                    setIsUpdating(false);
                    return;
                  }
                }
                if (updateCustomUrl && !/^[a-z0-9-]+$/.test(updateCustomUrl)) {
                  setUpdateErrors({ url: 'URL can only contain lowercase letters, numbers, and hyphens' });
                  setIsUpdating(false);
                  return;
                }
                const formData = new FormData();
                formData.append('title', updateTitle);
                formData.append('customUrl', updateCustomUrl);
                if (updateInputMethod === 'file' && updateSelectedFile) {
                  formData.append('file', updateSelectedFile);
                  formData.append('newFilename', updateSelectedFile.name);
                } else if (updateInputMethod === 'code') {
                  formData.append('code', updateCodeContent);
                }
                try {
                  const response = await fetch(`/api/update/${filename}`, {
                    method: 'PUT',
                    body: formData,
                  });
                  const result = await response.json();
                  if (!response.ok) {
                    if (result.message && result.message.toLowerCase().includes('custom url')) {
                      setUpdateErrors({ url: result.message });
                    } else if (result.message && result.message.toLowerCase().includes('title')) {
                      setUpdateErrors({ title: result.message });
                    } else if (result.message && result.message.toLowerCase().includes('filename')) {
                      setUpdateErrors({ file: result.message });
                    } else {
                      setUpdateErrors({ file: result.message || 'Update failed' });
                    }
                    setIsUpdating(false);
                    return;
                  }
                  if (result.metadata && result.metadata.filename && result.metadata.filename !== filename) {
                    window.location.href = `/preview/${encodeURIComponent(result.metadata.filename)}`;
                    return;
                  }
                  window.location.reload();
                } catch (err) {
                  setUpdateErrors({ file: err instanceof Error ? err.message : 'Update failed' });
                  setIsUpdating(false);
                }
              }}
            >
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-900">Title</label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={e => setUpdateTitle(e.target.value)}
                  className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${updateErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isUpdating}
                  placeholder="Enter your new title"
                />
                {updateErrors.title && <p className="text-red-500 text-xs">{updateErrors.title}</p>}
              </div>
              <div className="flex flex-col space-y-0.5">
                <label className="text-sm font-medium text-gray-900">Input Method</label>
                <div className="flex space-x-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (updateSelectedFile || updateCodeContent) {
                        setShowMethodChangeWarning(true);
                        setPendingMethodChange('code');
                      } else {
                        setUpdateInputMethod('code');
                      }
                    }}
                    className={`flex items-center justify-center px-6 py-2 bg-white border ${updateInputMethod === 'code' ? 'border-gray-500 text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                  >
                    Edit Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (updateSelectedFile || updateCodeContent) {
                        setShowMethodChangeWarning(true);
                        setPendingMethodChange('file');
                      } else {
                        setUpdateInputMethod('file');
                      }
                    }}
                    className={`flex items-center justify-center px-6 py-2 bg-white border ${updateInputMethod === 'file' ? 'border-gray-500 text-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} rounded-xl transition-colors text-sm font-medium min-w-[140px] cursor-pointer`}
                  >
                    Upload File
                  </button>
                </div>
                {showMethodChangeWarning && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-yellow-700">
                        Switch to {pendingMethodChange === 'file' ? 'file upload' : 'code input'}? This will clear your current {updateSelectedFile ? 'file' : 'code'}.
                      </p>
                      <div className="flex space-x-4 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUpdateSelectedFile(null);
                            setUpdateCodeContent('');
                            setUpdateErrors((prev: typeof updateErrors) => ({ ...prev, file: undefined }));
                            if (pendingMethodChange === 'file' || pendingMethodChange === 'code') {
                              setUpdateInputMethod(pendingMethodChange);
                            }
                            setShowMethodChangeWarning(false);
                            setPendingMethodChange(null);
                          }}
                          className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMethodChangeWarning(false);
                            setPendingMethodChange(null);
                          }}
                          className="text-xs font-medium text-gray-600 hover:text-gray-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {updateInputMethod === 'file' ? (
                  <>
                    <div
                      className={`h-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 flex items-center justify-center transition-colors cursor-pointer ${updateErrors.file ? 'border-red-500' : 'border-gray-300 bg-white'}`}
                      tabIndex={0}
                      role="button"
                      aria-label="File upload area"
                      onClick={() => updateFileInputRef.current?.click()}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') updateFileInputRef.current?.click(); }}
                      onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
                      onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
                      onDrop={e => {
                        e.preventDefault();
                        setIsDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setUpdateSelectedFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <input
                        type="file"
                        ref={updateFileInputRef}
                        style={{ display: 'none' }}
                        accept=".html,.htm"
                        onChange={e => setUpdateSelectedFile(e.target.files?.[0] || null)}
                        disabled={isUpdating}
                      />
                      {!updateSelectedFile ? (
                        <span className="text-gray-400 text-center select-none">Click or drag file to upload</span>
                      ) : (
                        <span className="text-gray-800 truncate w-full text-center select-none">{updateSelectedFile.name}</span>
                      )}
                    </div>
                    {updateErrors.file && <p className="text-red-500 text-xs mt-1">{updateErrors.file}</p>}
                  </>
                ) : (
                  <>
                    <textarea
                      value={updateCodeContent}
                      onChange={e => setUpdateCodeContent(e.target.value)}
                      placeholder="Paste your HTML code here..."
                      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 font-mono text-sm h-48 resize-none ${updateErrors.file ? 'border-red-500' : 'border-gray-300'}`}
                      disabled={isUpdating}
                    />
                    {updateErrors.file && <p className="text-red-500 text-xs mt-1">{updateErrors.file}</p>}
                  </>
                )}
              </div>
              <div className="flex flex-col space-y-0.5">
                <label className="text-sm font-medium text-gray-900">Custom URL (optional)</label>
                <input
                  type="text"
                  value={updateCustomUrl}
                  onChange={e => setUpdateCustomUrl(e.target.value)}
                  className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-500 text-gray-900 ${updateErrors.url ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isUpdating}
                  placeholder="Enter your new custom url"
                />
                {updateErrors.url && <p className="text-red-500 text-xs mt-1">{updateErrors.url}</p>}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => { resetUpdateModalState(); setShowUpdateModal(false); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 cursor-pointer"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlRenderer; 