"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import HtmlRenderer from "@/components/HtmlRenderer";
import ReactRenderer from "@/components/ReactRenderer";

interface ComponentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ComponentData {
  content: string;
  metadata?: {
    title?: string;
  };
}

interface Component {
  filename: string;
  customUrl?: string;
}

export default function ComponentPage({ params }: ComponentPageProps) {
  const resolvedParams = React.use(params);
  const requestedUrl = resolvedParams.slug;
  const [componentContent, setComponentContent] = useState<string>("");
  const [componentName, setComponentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualFilename, setActualFilename] = useState<string>("");
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let components: Component[] = [];

        // Try to find the component by custom URL or filename
        const componentsResponse = await fetch("/api/components");
        if (componentsResponse.ok) {
          const response = await componentsResponse.json();
          components = response.components;
          // Try customUrl first
          let component = components.find((c: Component) => c.customUrl === requestedUrl);
          if (component) {
            setActualFilename(component.filename);
            const response = await fetch(`/api/components/${component.filename}`);
            if (!response.ok) {
              throw new Error("Failed to load component");
            }
            const data: ComponentData = await response.json();
            setComponentContent(data.content);
            setComponentName(data.metadata?.title || component.filename);
            return;
          }
          // Try filename
          component = components.find((c: Component) => c.filename === requestedUrl);
          if (component) {
            if (component.customUrl) {
              setRedirecting(true);
              router.replace(`/${component.customUrl}`);
              return;
            }
            setActualFilename(component.filename);
            const response = await fetch(`/api/components/${component.filename}`);
            if (!response.ok) {
              throw new Error("Failed to load component");
            }
            const data: ComponentData = await response.json();
            setComponentContent(data.content);
            setComponentName(data.metadata?.title || component.filename);
            return;
          }
        }
        throw new Error("Component not found");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchComponent();
  }, [requestedUrl, router]);

  if (redirecting || error || isLoading) {
    return null;
  }

  const isHtmlFile = actualFilename.toLowerCase().endsWith(".html");

  return (
    <div className="w-full h-screen">
      {isHtmlFile ? (
        <HtmlRenderer
          code={componentContent}
          filename={actualFilename}
          title={componentName}
          mode="fullScreen"
          showLoadingText={false}
          features={{
            showProposalDetails: false,
            showDelete: false,
            showDownload: false,
            showViewProposal: false,
            showFileInfo: false,
            showLivePreview: true,
            showCode: false,
            showTestingSection: false,
          }}
        />
      ) : (
        <ReactRenderer
          code={componentContent}
          filename={actualFilename}
          title={componentName}
          componentName={componentName}
          mode="fullScreen"
          showLoadingText={false}
          features={{
            showProposalDetails: false,
            showDelete: false,
            showDownload: false,
            showViewProposal: false,
            showFileInfo: false,
            showLivePreview: true,
            showCode: false,
            showTestingSection: false,
          }}
        />
      )}
    </div>
  );
} 