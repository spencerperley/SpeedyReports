# Design Guidelines: Light Speed Order Manager

## Design Approach
**System-Based Approach**: Using a clean, utility-focused design system optimized for data-dense productivity applications. This tool prioritizes efficiency and usability over visual flair.

**Design System**: Material Design principles with modern form controls and clear visual hierarchy for enterprise productivity applications.

## Core Design Elements

### Color Palette
**Light Mode:**
- Primary: 219 84% 39% (Professional blue)
- Surface: 0 0% 98% (Clean white background)
- Border: 220 13% 91% (Subtle gray borders)
- Text: 224 71% 4% (Dark charcoal)

**Dark Mode:**
- Primary: 217 91% 60% (Lighter blue for contrast)
- Surface: 224 71% 4% (Dark charcoal background)
- Border: 217 32% 17% (Muted dark borders)
- Text: 210 40% 98% (Off-white text)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headers**: 600 weight, sizes 24px (h1), 20px (h2), 16px (h3)
- **Body Text**: 400 weight, 14px
- **Labels**: 500 weight, 13px
- **Buttons**: 500 weight, 14px

### Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8, etc.)
- Consistent 6-unit gaps between form sections
- 4-unit padding for form controls
- 8-unit margins for major layout separations

### Component Library

**Layout Structure:**
- Fixed sidebar (280px width) for saved reports on the right
- Main content area with generous padding (p-8)
- Card-based containers for report sections with subtle shadows

**Form Controls:**
- Text inputs with clean borders and focused states
- Date pickers with calendar icons
- Multi-select dropdowns with search functionality
- Checkboxes with subtle hover states
- Primary action buttons with solid fills
- Secondary buttons with outline styles

**Navigation & Actions:**
- Prominent "Generate Report" button (primary color)
- "Save Report" secondary button
- Small icon buttons for delete actions (trash icons)
- Clear visual separation between form sections

**Data Display:**
- Saved reports list with hover states
- Clean typography hierarchy
- Subtle dividers between list items
- Status indicators where applicable

**Interactive Elements:**
- Dropdown menus with search bars
- Select all/deselect all toggle controls
- Checkbox groups with proper spacing
- Loading states for API calls
- Success/error feedback for actions

## Key Design Principles
1. **Clarity Over Decoration**: Minimal visual noise, focus on content
2. **Consistent Spacing**: Uniform gaps and padding throughout
3. **Logical Grouping**: Related controls visually grouped together
4. **Accessible Interactions**: Clear focus states and adequate contrast
5. **Efficient Workflow**: Form controls optimized for quick data entry

## Special Considerations
- Ensure dropdowns handle long supplier/category lists efficiently
- Provide clear visual feedback during report generation
- Maintain consistent dark mode implementation across all form inputs
- Use subtle animations only for state changes (loading, success/error)