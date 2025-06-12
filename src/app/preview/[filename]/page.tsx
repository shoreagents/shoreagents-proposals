'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactRenderer from '@/components/ReactRenderer';
import HtmlRenderer from '@/components/HtmlRenderer';
import React from 'react';
import Link from 'next/link';

interface PreviewPageProps {
  params: Promise<{
    filename: string;
  }>;
}

interface Component {
  customUrl?: string;
  filename: string;
  uploadDate: string;
}

interface ComponentData {
  content: string;
  metadata?: {
    title?: string;
    uploadDate?: string;
    customUrl?: string;
  };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [componentTitle, setComponentTitle] = useState<string>('');
  const [fileType, setFileType] = useState<'react' | 'html'>('react');
  const [actualFilename, setActualFilename] = useState<string>('');
  const [uploadDate, setUploadDate] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);
  
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const requestedUrl = decodeURIComponent(resolvedParams.filename);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        let components: Component[] = [];
        // First try to find the component by custom URL
        const componentsResponse = await fetch('/api/components');
        if (componentsResponse.ok) {
          const response = await componentsResponse.json();
          components = response.components;
          const component = components.find((c: Component) => c.customUrl === requestedUrl);
          if (component) {
            // If found by custom URL, redirect to the filename
            setRedirecting(true);
            router.replace(`/preview/${encodeURIComponent(component.filename)}`);
            return;
          }
        }
        // If not found by custom URL, try as filename
        const componentByFilename = components.find((c: Component) => c.filename === requestedUrl);
        if (componentByFilename) {
          setActualFilename(requestedUrl);
          setUploadDate(componentByFilename.uploadDate);
          setCustomUrl(componentByFilename.customUrl || '');
          const response = await fetch(`/api/components/${requestedUrl}`);
          if (!response.ok) {
            throw new Error('File not found');
          }
          const data: ComponentData = await response.json();
          setFileContent(data.content);
          setFileType(requestedUrl.endsWith('.html') ? 'html' : 'react');
          if (data.metadata?.title) {
            setComponentTitle(data.metadata.title);
          }
          if (data.metadata?.uploadDate) {
            setUploadDate(data.metadata.uploadDate);
          }
          if (data.metadata?.customUrl) {
            setCustomUrl(data.metadata.customUrl);
          }
          return;
        }
        throw new Error('File not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    loadComponent();
  }, [requestedUrl, router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${actualFilename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delete/${encodeURIComponent(actualFilename)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Component deleted successfully');
        router.push('/');
      } else {
        const error = await response.json();
        alert(`Delete failed: ${error.message}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      alert('Delete failed: Network error');
    }
  };

  if (redirecting || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white" style={{ borderBottom: '1px solid rgb(229, 231, 235)' }}>
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Proposal Details Skeleton */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-8 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* File Info Skeleton */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6 space-y-1">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Dependencies Skeleton */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>

              {/* Testing Section Skeleton */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
                <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            ← Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white" style={{ borderBottom: '1px solid rgb(229, 231, 235)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {fileType === 'html' ? 'HTML Preview' : 'React Preview'}
              </h1>
              <p className="text-gray-600 text-sm">
                {fileType === 'html' 
                  ? 'View and analyze your HTML template.'
                  : 'View, analyze, and test your React component with live preview and dependency analysis.'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/"
                className="text-gray-600 px-4 py-2 rounded-md hover:text-gray-800 transition-colors font-semibold"
              >
                ← Back to Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6">
            {fileType === 'html' ? (
              <HtmlRenderer 
                code={fileContent} 
                filename={actualFilename}
                title={componentTitle}
                uploadDate={uploadDate}
                customUrl={customUrl}
              />
            ) : (
              <ReactRenderer 
                code={fileContent} 
                filename={actualFilename}
                title={componentTitle}
                componentName={componentTitle}
                componentTitle={componentTitle}
                uploadDate={uploadDate}
                customUrl={customUrl}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 