'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';

interface IframePreviewProps {
  component: React.ComponentType;
  onError?: (error: string) => void;
  minHeight?: number;
  maxHeight?: number;
  autoHeight?: boolean;
  smoothTransition?: boolean;
}

const IframePreview = forwardRef<HTMLIFrameElement, IframePreviewProps>(({ 
  component, 
  onError,
  minHeight = 200,
  maxHeight = 800,
  autoHeight = true,
  smoothTransition = false
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(autoHeight ? Math.max(minHeight, 400) : minHeight);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useImperativeHandle(ref, () => iframeRef.current!);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !component) return;

    const setupIframe = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Create the HTML structure with Tailwind CSS
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
                         <style>
               body {
                 margin: 0;
                 padding: 0;
                 font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                 background: white;
                 color: rgb(0, 0, 0);
                 line-height: 1.5;
               }
              * {
                box-sizing: border-box;
              }
              button, a, [role="button"] {
                cursor: pointer;
              }
              /* Ensure Tailwind utilities work properly */
              .bg-white { background-color: rgb(255, 255, 255); }
              .text-black { color: rgb(0, 0, 0); }
              .p-4 { padding: 1rem; }
              .m-4 { margin: 1rem; }
              .rounded { border-radius: 0.25rem; }
              .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
            </style>
          </head>
          <body>
            <div id="preview-root"></div>
          </body>
          </html>
        `;

        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Wait for the iframe to be ready
        iframe.onload = () => {
          const previewRoot = iframeDoc.getElementById('preview-root');
          if (previewRoot) {
            // Clean up previous root if it exists
            if (rootRef.current) {
              rootRef.current.unmount();
            }

            // Create new React root and render component
            rootRef.current = createRoot(previewRoot);
            rootRef.current.render(React.createElement(component));
            
            // Set up auto-height adjustment
            const adjustHeight = () => {
              if (!autoHeight) return;
              
              try {
                const body = iframeDoc.body;
                const html = iframeDoc.documentElement;
                
                if (body && html) {
                  // Get the actual content height
                  const contentHeight = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                  );
                  
                  // Add some padding and constrain to min/max
                  const newHeight = Math.min(
                    Math.max(contentHeight + 16, minHeight),
                    maxHeight
                  );
                  setIframeHeight(newHeight);
                }
              } catch (error) {
                console.warn('Could not adjust iframe height:', error);
              }
            };

            // Initial height adjustment - multiple attempts for better accuracy
            setTimeout(adjustHeight, 50);
            setTimeout(adjustHeight, 200);
            setTimeout(adjustHeight, 500);

            // Set up ResizeObserver to watch for content changes
            if (autoHeight && window.ResizeObserver && iframeDoc.body) {
              resizeObserverRef.current = new ResizeObserver(() => {
                adjustHeight();
              });
              
              // Observe the body for size changes
              resizeObserverRef.current.observe(iframeDoc.body);
            }

            // Also listen for window resize in the iframe
            if (autoHeight) {
              iframe.contentWindow?.addEventListener('resize', adjustHeight);
            }
          }
        };

      } catch (error) {
        console.error('Iframe preview error:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to create isolated preview');
      }
    };

    // Small delay to ensure iframe is ready
    const timer = setTimeout(setupIframe, 100);

    return () => {
      clearTimeout(timer);
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [component, onError, autoHeight, minHeight, maxHeight]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0"
      style={{
        height: autoHeight ? `${iframeHeight}px` : '100%',
        backgroundColor: 'white',
        transition: (autoHeight && smoothTransition) ? 'height 0.1s ease-out' : 'none',
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      title="Isolated Component Preview"
    />
  );
});

IframePreview.displayName = 'IframePreview';

export default IframePreview; 