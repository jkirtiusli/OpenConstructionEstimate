/**
 * Navigation Components - OpenConstructionEstimate
 *
 * This module exports navigation-related components that follow
 * the zero-click philosophy: users should never navigate menus,
 * they should simply ask for what they want.
 */

// Command Menu - Global command palette with Ctrl+K / Cmd+K activation
export {
  CommandMenu,
  type CommandItem,
  type CommandGroup,
  type CommandMenuProps,
} from './CommandMenu';

// Smart Filter - Natural language filter input with badge display
export {
  SmartFilter,
  parseNaturalLanguageQuery,
  type ParsedFilter,
  type ParseResult,
  type FilterOperator,
  type FilterUnit,
  type SmartFilterProps,
} from './SmartFilter';

// Region Selector - Dropdown for selecting active region/locale
export { RegionSelector } from './RegionSelector';
