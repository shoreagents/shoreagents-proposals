'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Eye, EyeOff, Download, Code, Code2, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReactRendererProps {
  code: string;
  filename: string;
  title: string;
  componentName: string;
  componentTitle?: string;
  uploadDate?: string;  // Add uploadDate prop
  customUrl?: string;  // Add customUrl prop
  mode?: 'preview' | 'component' | 'fullScreen';  // Added fullScreen mode
  showLoadingText?: boolean;
  features?: {
    showProposalDetails?: boolean;  // Control Proposal Details section
    showDelete?: boolean;          // Show delete button and modal
    showDownload?: boolean;        // Show download button
    showViewProposal?: boolean;    // Show view proposal link
    showDependencies?: boolean;    // Show dependencies section
    showFileInfo?: boolean;        // Show file information section
    showLivePreview?: boolean;     // Enable live preview feature
    showCode?: boolean;            // Enable code display feature
    showTestingSection?: boolean;  // Control visibility of the testing section
    showUpdate?: boolean;          // Show update button and modal
  };
  onDelete?: () => Promise<void>;  // Custom delete handler
  onDownload?: () => void;         // Custom download handler
}

interface DependencyInfo {
  name: string;
  type: 'external' | 'relative' | 'react' | 'next';
  likely_missing: boolean;
}

// Error Boundary Component for Live Preview
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Live preview render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold mb-2">Render Error</h3>
          <p className="text-red-700 text-sm">
            {this.state.error}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ReactRenderer({ 
  code, 
  filename, 
  title,
  componentName, 
  componentTitle,
  uploadDate,
  customUrl,
  mode = 'preview',
  showLoadingText = true,
  features = {
    showProposalDetails: true,
    showDelete: true,
    showDownload: true,
    showViewProposal: true,
    showDependencies: true,
    showFileInfo: true,
    showLivePreview: true,
    showCode: true,
    showTestingSection: true,
    showUpdate: true
  },
  onDelete,
  onDownload
}: ReactRendererProps) {
  const [showCode, setShowCode] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [liveComponent, setLiveComponent] = useState<React.ComponentType | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTitle, setUpdateTitle] = useState(componentTitle || title);
  const [updateCustomUrl, setUpdateCustomUrl] = useState(customUrl || '');
  const [updateInputMethod, setUpdateInputMethod] = useState<'file' | 'code'>('code');
  const [updateCodeContent, setUpdateCodeContent] = useState(code);
  const [updateSelectedFile, setUpdateSelectedFile] = useState<File | null>(null);
  const [updateErrors, setUpdateErrors] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showMethodChangeWarning, setShowMethodChangeWarning] = useState(false);
  const [pendingMethodChange, setPendingMethodChange] = useState<'file' | 'code' | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Add the reset function here so it can access state and props
  const resetUpdateModalState = () => {
    setUpdateTitle(componentTitle || title);
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

  // Analyze dependencies in the component
  const dependencies = useMemo(() => {
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const deps: DependencyInfo[] = [];
    let match;

    // Common packages that are usually installed in Next.js projects
    const commonPackages = [
      'react', 'react-dom', 'next', '@types/react', '@types/node',
      'typescript', 'tailwindcss', 'eslint',
      'lucide-react'
    ];

    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];
      
      let type: DependencyInfo['type'] = 'external';
      let likely_missing = true;

      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        type = 'relative';
        likely_missing = true; // Relative imports will likely be missing
      } else if (importPath.startsWith('react') || importPath === 'react-dom') {
        type = 'react';
        likely_missing = false;
      } else if (importPath.startsWith('next/')) {
        type = 'next';
        likely_missing = false;
      } else if (commonPackages.some(pkg => importPath.startsWith(pkg))) {
        likely_missing = false;
      }

      deps.push({
        name: importPath,
        type,
        likely_missing
      });
    }

    return deps;
  }, [code]);

  const missingDependencies = dependencies.filter(dep => dep.likely_missing);
  const safeDependencies = dependencies.filter(dep => !dep.likely_missing);

  // Live preview functionality
  const generateLivePreview = async () => {
    if (missingDependencies.length > 0) {
      setPreviewError('Cannot render live preview: Missing dependencies');
      return;
    }

    try {
      setPreviewError(null);
      
      // Transform TSX to JavaScript using Babel
      const { transform } = await import('@babel/standalone');
      
      const transformedCode = transform(code, {
        presets: [
          ['react', { runtime: 'classic' }],
          'typescript'
        ],
        filename: filename,
      }).code;

      if (!transformedCode) {
        throw new Error('Failed to transform component code');
      }

      // Load all available dependencies in parallel
      const [
        React,
        LucideReact,
      ] = await Promise.all([
        import('react'),
        import('lucide-react'),
      ]);
      
      // Handle destructured imports from lucide-react first
      const lucideImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"`]lucide-react['"`];?\s*/g;
      let lucideIcons: string[] = [];
      let match;
      
      while ((match = lucideImportRegex.exec(transformedCode)) !== null) {
        const imports = match[1].split(',').map(imp => imp.trim());
        lucideIcons.push(...imports);
      }

      // Handle destructured imports from react
      const reactImportRegex = /import\s+React,?\s*\{([^}]+)\}\s*from\s*['"`]react['"`];?\s*/g;
      let reactComponents: string[] = [];
      
      while ((match = reactImportRegex.exec(transformedCode)) !== null) {
        const imports = match[1].split(',').map(imp => imp.trim());
        reactComponents.push(...imports);
      }

      // Remove ALL import statements and export statements
      let modifiedCode = transformedCode
        // Remove all import statements (comprehensive regex)
        .replace(/import\s+.*?from\s+['"`][^'"`]+['"`];?\s*/g, '')
        .replace(/import\s+['"`][^'"`]+['"`];?\s*/g, '')
        .replace(/import\s*\{[^}]*\}\s*from\s*['"`][^'"`]+['"`];?\s*/g, '')
        .replace(/import\s+\w+\s*,?\s*\{[^}]*\}\s*from\s*['"`][^'"`]+['"`];?\s*/g, '')
        .replace(/import\s+\w+\s+from\s*['"`][^'"`]+['"`];?\s*/g, '')
        .replace(/import\s*\*\s*as\s+\w+\s+from\s*['"`][^'"`]+['"`];?\s*/g, '')
        // Remove export statements
        .replace(/export\s+default\s+/, 'return ')
        .replace(/export\s+\{[^}]*\};?\s*/g, '')
        // Clean up any remaining semicolons and newlines at the start
        .replace(/^\s*;+\s*/g, '')
        .trim();

      // Add destructured lucide icons as const declarations at the top
      if (lucideIcons.length > 0) {
        const iconDeclarations = lucideIcons.map(icon => 
          `const ${icon} = LucideReact.${icon};`
        ).join('\n');
        modifiedCode = iconDeclarations + '\n\n' + modifiedCode;
      }

      // Add destructured React components as const declarations
      if (reactComponents.length > 0) {
        const reactDeclarations = reactComponents.map(component => {
          // Special case for createPortal which comes from react-dom
          if (component === 'createPortal') {
            return `const ${component} = ReactDOM.createPortal;`;
          }
          return `const ${component} = React.${component};`;
        }).join('\n');
        modifiedCode = reactDeclarations + '\n\n' + modifiedCode;
      }

      // Create the component factory function with full packages
      const componentFactory = new Function(
        'React',
        'ReactDOM',
        'LucideReact',
        modifiedCode
      );
      
      // Execute the factory to get the component  
      const ReactModule = React.default || React;
      const ReactDOMModule = await import('react-dom');
      const component = componentFactory(
        ReactModule,
        ReactDOMModule,
        LucideReact
      );
      
      if (component) {
        setLiveComponent(() => component);
        setShowLivePreview(true);
      } else {
        throw new Error('Component could not be created');
      }
      
    } catch (error) {
      console.error('Live preview error:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to create live preview');
    }
  };

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

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.location.href = `/api/download/${encodeURIComponent(filename)}`;
    }
  };

  // Auto-show live preview if testing section is hidden or in fullScreen mode
  useEffect(() => {
    if ((!features.showTestingSection || mode === 'fullScreen') && features.showLivePreview) {
      generateLivePreview();
    }
  }, [features.showTestingSection, features.showLivePreview, mode]);

  // If in fullScreen mode, only render the live preview
  if (mode === 'fullScreen') {
    return (
      <div className="w-full h-full">
        {previewError ? (
          <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-red-800 text-sm font-mono whitespace-pre-wrap">{previewError}</div>
          </div>
        ) : liveComponent ? (
          <div className="w-full h-full [&_button]:cursor-pointer [&_a]:cursor-pointer [&_[role=button]]:cursor-pointer">
            <ErrorBoundary>
              {React.createElement(liveComponent)}
            </ErrorBoundary>
          </div>
        ) : null}
      </div>
    );
  }

  // Regular render for other modes
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
              <p className="text-gray-800 text-xl font-semibold">{componentTitle || componentName}</p>
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
                    onClick={() => setShowUpdateModal(true)}
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
                Are you sure you want to delete <span className="font-medium text-gray-800">"{componentTitle || componentName}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-full cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200"
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
            <div className="col-span-6">
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
            {features.showDependencies && (
              <div className="col-span-2">
                <span className="font-medium text-gray-600">Dependencies:</span>
                <p className="text-gray-800">
                  {dependencies.length} found {missingDependencies.length > 0 && `(${missingDependencies.length} missing)`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dependencies Section */}
      {features.showDependencies && (
        <div className="grid grid-cols-2 gap-4">
          {/* Safe Dependencies */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Available Dependencies</h4>
            {safeDependencies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {safeDependencies.map((dep, index) => (
                  <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-mono">
                    {dep.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-700 text-sm">No dependencies required</p>
            )}
          </div>

          {/* Dependency Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Missing Dependencies</h4>
            {missingDependencies.length > 0 ? (
              <>
                <div className="space-y-2">
                  {missingDependencies.map((dep, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-mono">
                        {dep.name}
                      </span>
                      <span className="text-xs text-gray-600">
                        ({dep.type === 'relative' ? 'Local file' : 'External package'})
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-red-100 rounded text-xs text-gray-700">
                  <strong className="text-gray-800">To use this component:</strong>
                  <br />1. Install missing packages: <code className="bg-red-200 px-1 rounded text-red-800">npm install {missingDependencies.filter(d => d.type === 'external').map(d => d.name).join(' ')}</code>
                  <br />2. Ensure relative imports point to existing files
                </div>
              </>
            ) : (
              <p className="text-gray-700 text-sm">All dependencies are available</p>
            )}
          </div>
        </div>
      )}

      {/* Testing Section */}
      {features.showTestingSection && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="text-purple-800 font-semibold mb-2">
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
                className={`flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-[140px] justify-center cursor-pointer ${
                  showCode ? 'bg-purple-50 border-purple-200 text-purple-700' : ''
                }`}
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
                    generateLivePreview();
                  } else {
                    setShowLivePreview(false);
                  }
                }}
                disabled={missingDependencies.length > 0}
                className={`flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-[140px] justify-center cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${
                  showLivePreview ? 'bg-purple-50 border-purple-200 text-purple-700' : ''
                }`}
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
              <a
                href={`/api/download/${encodeURIComponent(filename)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 min-w-[160px] justify-center cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download TSX
              </a>
            )}
          </div>
        </div>
      )}

      {/* Live Preview */}
      {showLivePreview && features.showLivePreview && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-800">Live Preview</h4>
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
            {/* Preview Container with proper stacking context */}
            <div className="relative isolate" style={{ 
              minHeight: '200px',
              transform: 'translate3d(0,0,0)', // Creates stacking context
              contain: 'paint', // Contains fixed elements
              overflow: 'hidden' // Ensures fixed elements don't escape
            }}>
              {previewError ? (
                <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="text-red-800 text-sm font-mono whitespace-pre-wrap">{previewError}</div>
                </div>
              ) : liveComponent ? (
                <div 
                  ref={previewRef} 
                  className="w-full h-full min-h-[200px] p-1 [&_button]:cursor-pointer [&_a]:cursor-pointer [&_[role=button]]:cursor-pointer"
                >
                  <ErrorBoundary>
                    {React.createElement(liveComponent)}
                  </ErrorBoundary>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Code Display */}
      {showCode && features.showCode && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto">
          <pre className="text-sm">
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
                  if (ext !== 'tsx') {
                    setUpdateErrors({ file: 'Only .tsx files are allowed' });
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
                  if (!updateCodeContent.includes('export default') && !updateCodeContent.includes('export {')) {
                    setUpdateErrors({ file: 'Code must contain a default export (React component)' });
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
                        accept=".tsx"
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
                      placeholder="Paste your React code here..."
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
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 cursor-pointer"
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
}