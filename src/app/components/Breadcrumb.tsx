import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();

  return (
    <nav className="px-4 py-2 bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = location.pathname === item.path;
          
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
              )}
              {isLast || isCurrent ? (
                <span className="text-[#2E7D32]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-[#2E7D32] transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
