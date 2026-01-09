'use client';

import { useCallback, useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Package,
  BarChart3,
  Settings,
  Plus,
  FileDown,
  Upload,
  Sparkles,
  Search,
  Command as CommandIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Represents a single command in the command palette
 */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  keywords?: string[];
  action: () => void;
  disabled?: boolean;
}

/**
 * Represents a group/section of commands
 */
export interface CommandGroup {
  id: string;
  heading: string;
  commands: CommandItem[];
}

/**
 * Props for the CommandMenu component
 */
export interface CommandMenuProps {
  /** Additional class names for the container */
  className?: string;
  /** Callback when the menu opens */
  onOpen?: () => void;
  /** Callback when the menu closes */
  onClose?: () => void;
  /** Language preference for placeholder text */
  locale?: 'en' | 'es';
  /** Custom command groups to merge with defaults */
  customGroups?: CommandGroup[];
}

// ============================================
// DEFAULT COMMANDS CONFIGURATION
// ============================================

const createDefaultGroups = (onClose: () => void): CommandGroup[] => [
  {
    id: 'navigation',
    heading: 'Navigate to...',
    commands: [
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        description: 'Overview and key metrics',
        icon: LayoutDashboard,
        shortcut: ['G', 'D'],
        keywords: ['home', 'overview', 'main', 'inicio'],
        action: () => {
          console.log('Navigate to Dashboard');
          onClose();
        },
      },
      {
        id: 'nav-estimates',
        label: 'Estimates',
        description: 'View and manage estimates',
        icon: FileSpreadsheet,
        shortcut: ['G', 'E'],
        keywords: ['projects', 'budgets', 'presupuestos', 'estimaciones'],
        action: () => {
          console.log('Navigate to Estimates');
          onClose();
        },
      },
      {
        id: 'nav-materials',
        label: 'Materials',
        description: 'Material catalog and pricing',
        icon: Package,
        shortcut: ['G', 'M'],
        keywords: ['inventory', 'supplies', 'materiales', 'catalogo'],
        action: () => {
          console.log('Navigate to Materials');
          onClose();
        },
      },
      {
        id: 'nav-reports',
        label: 'Reports',
        description: 'Analytics and insights',
        icon: BarChart3,
        shortcut: ['G', 'R'],
        keywords: ['analytics', 'charts', 'reportes', 'informes'],
        action: () => {
          console.log('Navigate to Reports');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        label: 'Settings',
        description: 'App configuration',
        icon: Settings,
        shortcut: ['G', 'S'],
        keywords: ['preferences', 'config', 'configuracion', 'ajustes'],
        action: () => {
          console.log('Navigate to Settings');
          onClose();
        },
      },
    ],
  },
  {
    id: 'actions',
    heading: 'Actions',
    commands: [
      {
        id: 'action-new-estimate',
        label: 'New Estimate',
        description: 'Create a new project estimate',
        icon: Plus,
        shortcut: ['N'],
        keywords: ['create', 'add', 'nuevo', 'crear', 'presupuesto'],
        action: () => {
          console.log('Create new estimate');
          onClose();
        },
      },
      {
        id: 'action-export-pdf',
        label: 'Export PDF',
        description: 'Export current view as PDF',
        icon: FileDown,
        shortcut: ['E', 'P'],
        keywords: ['download', 'save', 'descargar', 'exportar'],
        action: () => {
          console.log('Export PDF');
          onClose();
        },
      },
      {
        id: 'action-import',
        label: 'Import Data',
        description: 'Import from CSV or Excel',
        icon: Upload,
        shortcut: ['I'],
        keywords: ['upload', 'csv', 'excel', 'importar', 'cargar'],
        action: () => {
          console.log('Import data');
          onClose();
        },
      },
    ],
  },
  {
    id: 'ai',
    heading: 'AI Ask',
    commands: [
      {
        id: 'ai-query',
        label: 'Ask AI Assistant',
        description: 'Natural language queries about your data',
        icon: Sparkles,
        shortcut: ['A', 'I'],
        keywords: ['ai', 'query', 'question', 'preguntar', 'asistente'],
        action: () => {
          console.log('Open AI assistant');
          onClose();
        },
      },
    ],
  },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

// ============================================
// PLACEHOLDER TEXT
// ============================================

const placeholders = {
  en: 'What do you need to estimate today?',
  es: '¿Qué necesitas estimar hoy?',
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CommandMenu({
  className,
  onOpen,
  onClose,
  locale = 'es',
  customGroups = [],
}: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Handle close with callback
  const handleClose = useCallback(() => {
    setOpen(false);
    setSearch('');
    onClose?.();
  }, [onClose]);

  // Handle open with callback
  const handleOpen = useCallback(() => {
    setOpen(true);
    onOpen?.();
  }, [onOpen]);

  // Merge default groups with custom groups
  const commandGroups = [...createDefaultGroups(handleClose), ...customGroups];

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Open on Ctrl+K or Cmd+K
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (open) {
          handleClose();
        } else {
          handleOpen();
        }
      }

      // Close on Escape
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose, handleOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-soft-black/20 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Command palette container */}
          <motion.div
            className={cn(
              'fixed left-1/2 top-[20%] z-50 w-full max-w-[640px] -translate-x-1/2',
              className
            )}
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Command
              className={cn(
                // Glassmorphism container
                'overflow-hidden rounded-2xl',
                'bg-white/80 backdrop-blur-xl',
                'border border-white/20',
                'shadow-soft-xl',
                // Focus management
                'outline-none'
              )}
              loop
              shouldFilter
            >
              {/* Search input area */}
              <div className="flex items-center gap-3 border-b border-divider/50 px-4">
                <Search className="h-5 w-5 shrink-0 text-whisper" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder={placeholders[locale]}
                  className={cn(
                    'flex-1 bg-transparent py-4',
                    'text-base text-soft-black',
                    'placeholder:text-whisper',
                    'outline-none border-none',
                    'focus:outline-none focus:ring-0'
                  )}
                  autoFocus
                />
                {/* Keyboard shortcut indicator */}
                <kbd className="hidden sm:flex items-center gap-1 rounded-lg bg-cloud/80 px-2 py-1 text-xs font-medium text-subtle">
                  <CommandIcon className="h-3 w-3" />
                  <span>K</span>
                </kbd>
              </div>

              {/* Command list */}
              <Command.List
                className={cn(
                  'max-h-[400px] overflow-y-auto overflow-x-hidden',
                  'scrollbar-hidden'
                )}
              >
                {/* Empty state */}
                <Command.Empty className="py-8 text-center">
                  <p className="text-sm text-muted">No results found.</p>
                  <p className="mt-1 text-xs text-whisper">
                    Try a different search term
                  </p>
                </Command.Empty>

                {/* Command groups */}
                {commandGroups.map((group) => (
                  <Command.Group
                    key={group.id}
                    className="px-2 py-2"
                  >
                    {/* Custom styled heading - uppercase with whisper color */}
                    <div className="px-2 pb-1.5 pt-3 text-xs font-medium uppercase tracking-wider text-whisper">
                      {group.heading}
                    </div>
                    {group.commands.map((command) => (
                      <CommandMenuItem
                        key={command.id}
                        command={command}
                      />
                    ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer with keyboard hints */}
              <div
                className={cn(
                  'flex items-center justify-between',
                  'border-t border-divider/50',
                  'bg-cloud/30 px-4 py-2.5'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Navigation hint */}
                  <div className="flex items-center gap-1.5 text-xs text-subtle">
                    <kbd className="rounded bg-cloud px-1.5 py-0.5 font-mono text-[10px] font-medium">
                      ↑
                    </kbd>
                    <kbd className="rounded bg-cloud px-1.5 py-0.5 font-mono text-[10px] font-medium">
                      ↓
                    </kbd>
                    <span className="ml-1">navigate</span>
                  </div>

                  {/* Select hint */}
                  <div className="flex items-center gap-1.5 text-xs text-subtle">
                    <kbd className="rounded bg-cloud px-1.5 py-0.5 font-mono text-[10px] font-medium">
                      ↵
                    </kbd>
                    <span className="ml-1">select</span>
                  </div>

                  {/* Close hint */}
                  <div className="flex items-center gap-1.5 text-xs text-subtle">
                    <kbd className="rounded bg-cloud px-1.5 py-0.5 font-mono text-[10px] font-medium">
                      esc
                    </kbd>
                    <span className="ml-1">close</span>
                  </div>
                </div>

                {/* Branding or additional info */}
                <div className="text-xs text-ghost">
                  OpenConstructionEstimate
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// COMMAND MENU ITEM SUBCOMPONENT
// ============================================

interface CommandMenuItemProps {
  command: CommandItem;
}

function CommandMenuItem({ command }: CommandMenuItemProps) {
  const Icon = command.icon;

  return (
    <Command.Item
      value={`${command.label} ${command.keywords?.join(' ') ?? ''}`}
      onSelect={command.action}
      disabled={command.disabled}
      className={cn(
        'relative flex items-center gap-3',
        'cursor-pointer select-none',
        'rounded-xl px-3 py-2.5 mx-1',
        'text-sm text-soft-black',
        'transition-colors duration-150',
        // Hover and selected states
        'data-[selected=true]:bg-accent/10',
        'data-[selected=true]:text-accent',
        'hover:bg-cloud/80',
        // Disabled state
        'data-[disabled=true]:pointer-events-none',
        'data-[disabled=true]:opacity-50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center',
          'rounded-lg bg-cloud/80',
          'transition-colors duration-150',
          'group-data-[selected=true]:bg-accent/20'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Label and description */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="truncate font-medium">{command.label}</span>
        {command.description && (
          <span className="truncate text-xs text-muted">
            {command.description}
          </span>
        )}
      </div>

      {/* Keyboard shortcut */}
      {command.shortcut && (
        <div className="flex shrink-0 items-center gap-1">
          {command.shortcut.map((key, index) => (
            <kbd
              key={index}
              className={cn(
                'flex h-5 min-w-[20px] items-center justify-center',
                'rounded bg-cloud/80 px-1.5',
                'font-mono text-[10px] font-medium text-subtle'
              )}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </Command.Item>
  );
}

// ============================================
// EXPORTS
// ============================================

export default CommandMenu;
