'use client';

import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegionSelector } from '@/components/domain/navigation/RegionSelector';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
}

interface MainSidebarProps {
  /** Current active route for highlighting */
  activeRoute?: string;
  /** Callback when navigation item is clicked */
  onNavigate?: (route: string) => void;
  /** Custom class name */
  className?: string;
}

/* ============================================
   NAVIGATION ITEMS CONFIGURATION
   ============================================ */

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'estimates',
    label: 'Estimates',
    icon: FileSpreadsheet,
    href: '/estimates',
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: Package,
    href: '/materials',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

/* ============================================
   DESIGN SYSTEM CONSTANTS
   ============================================ */

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 72;

/* ============================================
   NAV ITEM COMPONENT
   ============================================ */

interface NavItemButtonProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function NavItemButton({
  item,
  isActive,
  isCollapsed,
  onClick,
}: NavItemButtonProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-center w-full rounded-xl',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent/20 focus-visible:ring-offset-2',
        isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3 gap-3',
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-muted hover:bg-cloud hover:text-soft-black'
      )}
      title={isCollapsed ? item.label : undefined}
    >
      <Icon
        className={cn(
          'shrink-0 transition-colors duration-200',
          isCollapsed ? 'w-5 h-5' : 'w-5 h-5',
          isActive ? 'text-accent' : 'text-muted group-hover:text-soft-black'
        )}
      />
      {!isCollapsed && (
        <span
          className={cn(
            'text-sm font-medium truncate',
            'transition-colors duration-200'
          )}
        >
          {item.label}
        </span>
      )}
    </button>
  );
}

/* ============================================
   COLLAPSE TOGGLE BUTTON
   ============================================ */

interface CollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function CollapseButton({ isCollapsed, onToggle }: CollapseButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center justify-center',
        'w-8 h-8 rounded-lg',
        'bg-cloud text-muted',
        'transition-all duration-200 ease-out',
        'hover:bg-divider hover:text-soft-black',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent/20 focus-visible:ring-offset-2',
        'active:scale-95'
      )}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? (
        <ChevronRight className="w-4 h-4" />
      ) : (
        <ChevronLeft className="w-4 h-4" />
      )}
    </button>
  );
}

/* ============================================
   MAIN SIDEBAR COMPONENT
   Floating, collapsible navigation panel
   ============================================ */

export function MainSidebar({
  activeRoute = '/',
  onNavigate,
  className,
}: MainSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(
    (href: string) => {
      onNavigate?.(href);
    },
    [onNavigate]
  );

  return (
    <aside
      className={cn(
        // Floating sidebar with margin
        'm-3',
        // Sizing
        'h-[calc(100vh-24px)]',
        // Appearance - premium paper style
        'bg-paper rounded-3xl shadow-soft-lg',
        // Border for subtle definition
        'border border-border-soft',
        // Flex layout
        'flex flex-col',
        // Smooth transition on collapse
        'transition-all duration-300 ease-out',
        className
      )}
      style={{
        width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      }}
    >
      {/* Header / Logo Area */}
      <div
        className={cn(
          'flex items-center px-4 py-5',
          'border-b border-border-muted',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-carbon truncate">
                OpenConstruction
              </h1>
              <p className="text-2xs text-subtle truncate">Estimate Platform</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">OC</span>
          </div>
        )}
      </div>

      {/* Region Selector */}
      <div className={cn('px-3 py-3', isCollapsed && 'flex justify-center')}>
        <RegionSelector compact={isCollapsed} />
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-border-muted" />

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hidden">
        {NAV_ITEMS.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={activeRoute === item.href}
            isCollapsed={isCollapsed}
            onClick={() => handleNavClick(item.href)}
          />
        ))}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div
        className={cn(
          'px-3 py-4 border-t border-border-muted',
          isCollapsed ? 'flex justify-center' : 'flex justify-end'
        )}
      >
        <CollapseButton
          isCollapsed={isCollapsed}
          onToggle={handleToggleCollapse}
        />
      </div>
    </aside>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

export default MainSidebar;
