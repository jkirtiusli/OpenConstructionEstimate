'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Supported filter operators
 */
export type FilterOperator =
  | 'eq'      // equals (=)
  | 'neq'     // not equals (!=)
  | 'gt'      // greater than (>)
  | 'gte'     // greater than or equal (>=)
  | 'lt'      // less than (<)
  | 'lte'     // less than or equal (<=)
  | 'contains'// text contains
  | 'between' // between range
  | 'in';     // in list

/**
 * Unit type for construction domain values
 */
export type FilterUnit =
  | 'EUR'
  | 'USD'
  | 'sqm'   // square meters (m2)
  | 'sqft'  // square feet
  | 'kg'
  | 'ton'
  | 'unit'
  | 'none';

/**
 * A single parsed filter from natural language input
 */
export interface ParsedFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | [number, number];
  unit: FilterUnit;
  rawInput: string;
  displayLabel: string;
}

/**
 * Result of parsing natural language query
 */
export interface ParseResult {
  success: boolean;
  filters: ParsedFilter[];
  unrecognized: string[];
}

/**
 * Props for the SmartFilter component
 */
export interface SmartFilterProps {
  /** Current active filters */
  filters?: ParsedFilter[];
  /** Callback when filters change */
  onFiltersChange?: (filters: ParsedFilter[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names */
  className?: string;
  /** Language preference */
  locale?: 'en' | 'es';
  /** Available fields for filtering */
  availableFields?: string[];
}

// ============================================
// FILTER PARSING LOGIC
// ============================================

/**
 * Field aliases for natural language matching
 * Maps various terms to canonical field names
 */
const fieldAliases: Record<string, string[]> = {
  cost: ['cost', 'costo', 'price', 'precio', 'amount', 'monto', 'value', 'valor'],
  material: ['material', 'materiales', 'materials', 'item', 'items', 'producto'],
  area: ['area', 'superficie', 'surface', 'size', 'tamano', 'm2', 'sqm'],
  quantity: ['quantity', 'cantidad', 'qty', 'units', 'unidades', 'count'],
  weight: ['weight', 'peso', 'kg', 'kilos', 'ton', 'tons', 'toneladas'],
  date: ['date', 'fecha', 'created', 'creado', 'updated', 'modified'],
  status: ['status', 'estado', 'state'],
  supplier: ['supplier', 'proveedor', 'vendor', 'provider'],
  category: ['category', 'categoria', 'type', 'tipo'],
};

/**
 * Operator patterns for regex matching
 */
const operatorPatterns: { pattern: RegExp; operator: FilterOperator }[] = [
  { pattern: />=|≥|mayor o igual|greater than or equal/i, operator: 'gte' },
  { pattern: /<=|≤|menor o igual|less than or equal/i, operator: 'lte' },
  { pattern: /!=|<>|≠|no es|not equal|diferente/i, operator: 'neq' },
  { pattern: />|mayor que|greater than|mas de|more than/i, operator: 'gt' },
  { pattern: /<|menor que|less than|menos de/i, operator: 'lt' },
  { pattern: /=|es|equals|igual a?/i, operator: 'eq' },
  { pattern: /entre|between/i, operator: 'between' },
  { pattern: /contiene|contains|incluye|includes|con /i, operator: 'contains' },
];

/**
 * Unit detection patterns
 */
const unitPatterns: { pattern: RegExp; unit: FilterUnit }[] = [
  { pattern: /€|eur|euros?/i, unit: 'EUR' },
  { pattern: /\$|usd|dollars?|dolares?/i, unit: 'USD' },
  { pattern: /m²|m2|sqm|metros? cuadrados?|square meters?/i, unit: 'sqm' },
  { pattern: /ft²|sqft|square feet|pies? cuadrados?/i, unit: 'sqft' },
  { pattern: /kg|kilos?|kilogramos?/i, unit: 'kg' },
  { pattern: /ton|tons?|toneladas?/i, unit: 'ton' },
  { pattern: /unidad|unidades|unit|units|pcs|piezas?/i, unit: 'unit' },
];

/**
 * Generates a unique ID for filters
 */
let filterIdCounter = 0;
function generateFilterId(): string {
  filterIdCounter += 1;
  return `filter-${Date.now()}-${filterIdCounter}`;
}

/**
 * Resolves field name from natural language alias
 */
function resolveField(input: string): string | null {
  const normalizedInput = input.toLowerCase().trim();

  for (const [field, aliases] of Object.entries(fieldAliases)) {
    if (aliases.some(alias => normalizedInput.includes(alias))) {
      return field;
    }
  }

  return null;
}

/**
 * Detects operator from text
 */
function detectOperator(text: string): FilterOperator | null {
  for (const { pattern, operator } of operatorPatterns) {
    if (pattern.test(text)) {
      return operator;
    }
  }
  return null;
}

/**
 * Detects unit from text
 */
function detectUnit(text: string): FilterUnit {
  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(text)) {
      return unit;
    }
  }
  return 'none';
}

/**
 * Extracts numeric value from text
 */
function extractValue(text: string): string | number | [number, number] | null {
  // Check for between/range pattern: "100-500" or "100 to 500" or "entre 100 y 500"
  const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:-|to|a|y)\s*(\d+(?:[.,]\d+)?)/i);
  if (rangeMatch) {
    return [
      parseFloat(rangeMatch[1].replace(',', '.')),
      parseFloat(rangeMatch[2].replace(',', '.'))
    ];
  }

  // Check for single number
  const numberMatch = text.match(/(\d+(?:[.,]\d+)?)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1].replace(',', '.'));
  }

  // Return remaining text as string value for text-based filters
  const cleanedText = text
    .replace(/[<>=!≥≤≠]/g, '')
    .replace(/mayor|menor|igual|que|a|de|o|es|no|entre|y|contiene|con|includes?|greater|less|than|equal|between|and|contains?/gi, '')
    .trim();

  return cleanedText.length > 0 ? cleanedText : null;
}

/**
 * Creates a display label for a filter
 */
function createDisplayLabel(filter: Omit<ParsedFilter, 'displayLabel'>): string {
  const operatorSymbols: Record<FilterOperator, string> = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    contains: ':',
    between: ':',
    in: ':',
  };

  const unitSymbols: Partial<Record<FilterUnit, string>> = {
    EUR: '€',
    USD: '$',
    sqm: 'm²',
    sqft: 'ft²',
    kg: 'kg',
    ton: 'ton',
  };

  let valueStr: string;
  if (Array.isArray(filter.value)) {
    valueStr = `${filter.value[0]}-${filter.value[1]}`;
  } else {
    valueStr = String(filter.value);
  }

  const unitSuffix = filter.unit !== 'none' ? ` ${unitSymbols[filter.unit] || filter.unit}` : '';

  return `${filter.field} ${operatorSymbols[filter.operator]} ${valueStr}${unitSuffix}`;
}

/**
 * Main parsing function for natural language queries
 */
export function parseNaturalLanguageQuery(query: string): ParseResult {
  const filters: ParsedFilter[] = [];
  const unrecognized: string[] = [];

  // Split by common delimiters
  const segments = query.split(/[,;]|\s+y\s+|\s+and\s+/i).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    const field = resolveField(segment);
    const operator = detectOperator(segment) || 'contains';
    const value = extractValue(segment);
    const unit = detectUnit(segment);

    if (field && value !== null) {
      const filterBase = {
        id: generateFilterId(),
        field,
        operator,
        value,
        unit,
        rawInput: segment,
      };

      filters.push({
        ...filterBase,
        displayLabel: createDisplayLabel(filterBase),
      });
    } else if (segment.length > 2) {
      // Only add to unrecognized if it's a meaningful string
      unrecognized.push(segment);
    }
  }

  return {
    success: filters.length > 0,
    filters,
    unrecognized,
  };
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const badgeVariants = {
  initial: { opacity: 0, scale: 0.8, y: 5 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 25 }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -5,
    transition: { duration: 0.15 }
  },
};

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
};

// ============================================
// PLACEHOLDER TEXT
// ============================================

const placeholders = {
  en: 'Try "cost > 500€" or "concrete materials"...',
  es: 'Prueba "costo > 500€" o "materiales de construcción"...',
};

// ============================================
// MAIN COMPONENT
// ============================================

export function SmartFilter({
  filters: externalFilters,
  onFiltersChange,
  placeholder,
  className,
  locale = 'es',
  availableFields = [],
}: SmartFilterProps) {
  // Internal state for filters (controlled or uncontrolled mode)
  const [internalFilters, setInternalFilters] = useState<ParsedFilter[]>([]);
  const filters = externalFilters ?? internalFilters;
  const setFilters = onFiltersChange ?? setInternalFilters;

  // Input state
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available field suggestions
  const allFields = availableFields.length > 0
    ? availableFields
    : Object.keys(fieldAliases);

  /**
   * Handle input submission
   */
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;

    const result = parseNaturalLanguageQuery(inputValue);

    if (result.success) {
      setFilters([...filters, ...result.filters]);
      setInputValue('');
    }

    setShowSuggestions(false);
  }, [inputValue, filters, setFilters]);

  /**
   * Handle Enter key press
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [handleSubmit]);

  /**
   * Remove a single filter
   */
  const removeFilter = useCallback((filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  }, [filters, setFilters]);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setFilters([]);
    setInputValue('');
    inputRef.current?.focus();
  }, [setFilters]);

  /**
   * Close suggestions when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Input container with glassmorphism */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-white/80 backdrop-blur-xl',
          'border border-white/20',
          'shadow-soft-xl',
          'transition-all duration-200',
          isFocused && 'shadow-glow border-accent/20'
        )}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Search/Sparkles icon */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <Search
              className={cn(
                'h-5 w-5 transition-colors duration-200',
                isFocused ? 'text-accent' : 'text-whisper'
              )}
            />
            {filters.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1"
              >
                <Sparkles className="h-3 w-3 text-accent" />
              </motion.div>
            )}
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (inputValue.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? placeholders[locale]}
            className={cn(
              'flex-1 bg-transparent',
              'text-base text-soft-black',
              'placeholder:text-whisper',
              'outline-none border-none',
              'focus:outline-none focus:ring-0'
            )}
            aria-label="Smart filter input"
          />

          {/* Clear all button */}
          {(filters.length > 0 || inputValue) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearAllFilters}
              className={cn(
                'flex h-8 w-8 items-center justify-center',
                'rounded-lg',
                'text-whisper hover:text-muted',
                'hover:bg-cloud/80',
                'transition-colors duration-150'
              )}
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Active filters badges */}
        <AnimatePresence>
          {filters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-divider/50"
            >
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="flex flex-wrap gap-2 px-4 py-3"
              >
                <AnimatePresence mode="popLayout">
                  {filters.map((filter) => (
                    <FilterBadge
                      key={filter.id}
                      filter={filter}
                      onRemove={() => removeFilter(filter.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && inputValue.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-divider/50 bg-cloud/30"
            >
              <div className="px-4 py-2">
                <p className="text-xs text-subtle">
                  Press <kbd className="rounded bg-cloud px-1.5 py-0.5 font-mono text-[10px] font-medium">Enter</kbd> to add filter
                </p>
                {/* Quick field suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allFields.slice(0, 5).map((field) => (
                    <button
                      key={field}
                      onClick={() => setInputValue(`${field} > `)}
                      className={cn(
                        'rounded-lg px-2 py-1',
                        'text-xs text-muted',
                        'bg-cloud/50 hover:bg-cloud',
                        'transition-colors duration-150'
                      )}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text */}
      <div className="mt-2 flex items-center gap-2 px-1">
        <AlertCircle className="h-3 w-3 text-whisper" />
        <p className="text-xs text-whisper">
          {locale === 'es'
            ? 'Usa operadores: >, <, =, entre, contiene'
            : 'Use operators: >, <, =, between, contains'
          }
        </p>
      </div>
    </div>
  );
}

// ============================================
// FILTER BADGE SUBCOMPONENT
// ============================================

interface FilterBadgeProps {
  filter: ParsedFilter;
  onRemove: () => void;
}

function FilterBadge({ filter, onRemove }: FilterBadgeProps) {
  return (
    <motion.div
      layout
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'group flex items-center gap-1.5',
        'rounded-lg px-2.5 py-1.5',
        'bg-accent/10 text-accent',
        'border border-accent/20',
        'text-sm font-medium',
        'transition-colors duration-150',
        'hover:bg-accent/15'
      )}
    >
      {/* Filter display label */}
      <span className="max-w-[200px] truncate">
        {filter.displayLabel}
      </span>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={cn(
          'flex h-4 w-4 items-center justify-center',
          'rounded',
          'text-accent/60 hover:text-accent',
          'hover:bg-accent/20',
          'transition-colors duration-150'
        )}
        aria-label={`Remove filter: ${filter.displayLabel}`}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default SmartFilter;
