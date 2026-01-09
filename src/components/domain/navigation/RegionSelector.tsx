/**
 * OpenConstructionEstimate - Region Selector
 *
 * A compact dropdown component for selecting the active region/locale.
 * Designed for the sidebar with glassmorphism styling consistent with
 * the CommandMenu and overall Calm Tech design system.
 *
 * Features:
 * - Flag emoji + city display
 * - Smooth dropdown animation via Framer Motion
 * - Keyboard accessible
 * - Persists selection via regionStore
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useRegionStore,
  REGIONS,
  REGION_CODES,
  type RegionCode,
  type RegionInfo,
} from '@/lib/stores/regionStore';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

interface RegionSelectorProps {
  /** Compact mode for collapsed sidebar */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

/* ============================================
   ANIMATION VARIANTS
   ============================================ */

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.02,
      duration: 0.2,
    },
  }),
};

/* ============================================
   REGION OPTION COMPONENT
   ============================================ */

interface RegionOptionProps {
  region: RegionInfo;
  isSelected: boolean;
  index: number;
  onSelect: (code: RegionCode) => void;
}

function RegionOption({
  region,
  isSelected,
  index,
  onSelect,
}: RegionOptionProps) {
  return (
    <motion.button
      type="button"
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onSelect(region.code)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
        'text-left text-sm',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent/20',
        isSelected
          ? 'bg-accent/10 text-accent'
          : 'text-soft-black hover:bg-cloud'
      )}
    >
      {/* Flag emoji */}
      <span className="text-base leading-none shrink-0">{region.flag}</span>

      {/* City and country */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{region.city}</div>
        <div className="text-xs text-muted truncate">{region.country}</div>
      </div>

      {/* Currency badge */}
      <span className="text-xs font-mono text-subtle bg-cloud/80 px-1.5 py-0.5 rounded">
        {region.currency}
      </span>

      {/* Check mark for selected */}
      {isSelected && (
        <Check className="w-4 h-4 text-accent shrink-0" />
      )}
    </motion.button>
  );
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export function RegionSelector({ compact = false, className }: RegionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Store access
  const selectedRegion = useRegionStore((s) => s.selectedRegion);
  const setRegion = useRegionStore((s) => s.setRegion);

  // Get current region info
  const currentRegion = REGIONS[selectedRegion];

  // Handle region selection
  const handleSelect = useCallback((code: RegionCode) => {
    setRegion(code);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [setRegion]);

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Compact mode - just show icon
  if (compact) {
    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'bg-cloud text-soft-black',
            'transition-all duration-200 ease-out',
            'hover:bg-divider hover:shadow-soft-sm',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-accent/20',
            'active:scale-95'
          )}
          title={`${currentRegion.flag} ${currentRegion.city}`}
          aria-label="Select region"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="w-5 h-5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={cn(
                'absolute left-12 top-0 z-50',
                'w-64 p-2',
                // Glassmorphism style
                'bg-paper/95 backdrop-blur-xl',
                'rounded-xl shadow-soft-lg',
                'border border-divider/50'
              )}
              role="listbox"
              aria-label="Available regions"
            >
              <div className="max-h-[320px] overflow-y-auto scrollbar-hidden">
                {REGION_CODES.map((code, index) => (
                  <RegionOption
                    key={code}
                    region={REGIONS[code]}
                    isSelected={code === selectedRegion}
                    index={index}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded mode - full display
  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5',
          'rounded-xl',
          'bg-cloud text-soft-black',
          'transition-all duration-200 ease-out',
          'hover:bg-divider hover:shadow-soft-sm',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-accent/20',
          'active:scale-[0.98]'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select region"
      >
        {/* Flag emoji */}
        <span className="text-lg leading-none shrink-0">
          {currentRegion.flag}
        </span>

        {/* City name */}
        <span className="flex-1 text-left text-sm font-medium truncate">
          {currentRegion.city}
        </span>

        {/* Chevron indicator */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted shrink-0',
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={cn(
              'absolute left-0 right-0 top-full mt-2 z-50',
              'p-2',
              // Glassmorphism style consistent with CommandMenu
              'bg-paper/95 backdrop-blur-xl',
              'rounded-xl shadow-soft-lg',
              'border border-divider/50'
            )}
            role="listbox"
            aria-label="Available regions"
          >
            {/* Section label */}
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-whisper">
              Select Region
            </div>

            {/* Region options */}
            <div className="max-h-[280px] overflow-y-auto scrollbar-hidden">
              {REGION_CODES.map((code, index) => (
                <RegionOption
                  key={code}
                  region={REGIONS[code]}
                  isSelected={code === selectedRegion}
                  index={index}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-2 pt-2 border-t border-divider/50 px-3 py-1.5">
              <p className="text-xs text-ghost">
                Region affects pricing and currency
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

export default RegionSelector;
