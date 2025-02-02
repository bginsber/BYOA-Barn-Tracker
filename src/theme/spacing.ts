export const spacing = {
  // Base spacing unit (4px)
  base: 4,
  
  // Spacing scale
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  '2xl': 40,// 40px
  '3xl': 48,// 48px
  '4xl': 56,// 56px
  '5xl': 64,// 64px
  
  // Common spacing values
  gutter: 16,     // Standard gutter between components
  section: 40,    // Section spacing
  screenEdge: 16, // Screen edge padding
  
  // Layout specific
  headerHeight: 56,
  bottomTabHeight: 56,
  fabSpacing: 16,
  
  // Form specific
  inputHeight: 48,
  inputPadding: 12,
  inputGap: 16,
  
  // List specific
  listItemHeight: 56,
  listItemPadding: 16,
  listItemGap: 8,
  
  // Card specific
  cardPadding: 16,
  cardGap: 8,
  cardBorderRadius: 8,
  
  // Helper function to get multiple of base spacing
  multiply: (multiplier: number) => 4 * multiplier,
} as const;

export type Spacing = typeof spacing;
