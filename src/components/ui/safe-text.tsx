'use client';

import React from 'react';
import { escapeHtml } from '@/lib/utils/security';

/**
 * SafeText Component
 * 
 * A React component that safely displays text content.
 * Automatically escapes HTML to prevent XSS attacks.
 * 
 * @param children - The text content to display
 * @param className - Optional CSS class name
 * @param as - HTML element to render (default: span)
 */
interface SafeTextProps {
  children: string | number | undefined | null;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'td' | 'th';
}

export function SafeText({ 
  children, 
  className,
  as: Component = 'span' 
}: SafeTextProps) {
  // If no content, render empty
  if (children === null || children === undefined) {
    return <Component className={className} />;
  }
  
  // Escape HTML to prevent XSS
  const safeContent = escapeHtml(String(children));
  
  return (
    <Component 
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

/**
 * Safe HTML Component
 * 
 * A React component for displaying pre-sanitized HTML content.
 * Use this only with content you've already sanitized on the server.
 * 
 * @param html - The HTML content to display
 * @param className - Optional CSS class name
 * @param as - HTML element to render (default: div)
 */
interface SafeHtmlProps {
  html: string | undefined | null;
  className?: string;
  as?: 'div' | 'span' | 'p';
}

export function SafeHtml({ 
  html, 
  className,
  as: Component = 'div' 
}: SafeHtmlProps) {
  if (!html) {
    return <Component className={className} />;
  }
  
  return (
    <Component 
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * SafeDisplay Component
 * 
 * A flexible component that auto-detects content type and handles appropriately.
 * 
 * @param content - The content to display
 * @param fallback - Fallback text when content is empty
 * @param className - Optional CSS class name
 */
interface SafeDisplayProps {
  content: string | number | undefined | null;
  fallback?: string;
  className?: string;
}

export function SafeDisplay({ 
  content, 
  fallback = 'N/A',
  className 
}: SafeDisplayProps) {
  const displayContent = content ?? fallback;
  const safeContent = escapeHtml(String(displayContent));
  
  return (
    <span 
      className={className}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}

export default SafeText;
