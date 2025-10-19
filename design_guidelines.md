# Design Guidelines: News Aggregator Web Application

## Design Approach

**Selected System**: Material Design with inspiration from Google News and Feedly
**Rationale**: Information-dense news consumption requires clear hierarchy, efficient scanning, and trustworthy presentation. Material Design's elevation system and typography scale excel at organizing complex content.

**Core Principles**:
- Content-first: News articles are the hero, UI recedes
- Scannable hierarchy: Users should quickly identify relevant content
- Trust signals: Professional, clean aesthetic builds credibility
- Efficient workflows: Minimal clicks to find, filter, and subscribe

---

## Color Palette

### Light Mode
- **Background**: 0 0% 98% (near-white)
- **Surface**: 0 0% 100% (pure white cards)
- **Primary**: 210 100% 50% (trustworthy blue for actions)
- **Secondary**: 210 20% 30% (dark blue-gray for text)
- **Accent**: 15 90% 55% (warm coral for notifications/alerts)
- **Border**: 210 15% 90% (subtle card separation)
- **Text Primary**: 210 20% 15%
- **Text Secondary**: 210 10% 50%

### Dark Mode
- **Background**: 210 20% 10%
- **Surface**: 210 15% 15% (elevated cards)
- **Primary**: 210 100% 60%
- **Secondary**: 210 10% 70%
- **Accent**: 15 85% 60%
- **Border**: 210 10% 25%
- **Text Primary**: 210 5% 95%
- **Text Secondary**: 210 5% 70%

---

## Typography

**Font Stack**: 
- Headlines: Inter (700, 600 weights)
- Body: Inter (400, 500 weights)
- Metadata: Inter (400 weight)

**Scale**:
- H1 (Page Title): 2.5rem / 700 / tight leading
- H2 (Section Headers): 1.875rem / 600 / tight leading
- H3 (Card Headlines): 1.25rem / 600 / snug leading
- Body (Article Summaries): 0.938rem / 400 / relaxed leading
- Caption (Source/Date): 0.813rem / 400 / normal leading
- Button Text: 0.938rem / 500 / normal leading

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16, 24
- Card padding: p-6
- Section spacing: gap-8, py-12
- Component margins: mb-4, mt-6
- Grid gaps: gap-6

**Grid Structure**:
- Desktop: 3-column news grid (grid-cols-3)
- Tablet: 2-column (md:grid-cols-2)
- Mobile: 1-column (grid-cols-1)
- Max container width: max-w-7xl

---

## Component Library

### Navigation Bar
- Fixed top position with backdrop blur
- Logo left, search bar center (w-96), user menu right
- Height: h-16
- Shadow: subtle drop shadow on scroll
- Search icon, filter button, profile avatar

### Trending Dashboard (Top Section)
- Full-width banner below navigation
- Horizontal scroll of trending category chips
- Each chip: category name, trend indicator (↑/↓), article count
- Background: subtle gradient from primary/10 to transparent
- Height: py-8

### News Card
- White/elevated surface with rounded corners (rounded-lg)
- Structure: Image top (16:9 aspect), content below
- Image: w-full, h-48, object-cover
- Content padding: p-6
- Headline: text-lg font-semibold, line-clamp-2
- Summary: text-sm text-secondary, line-clamp-3, mt-2
- Metadata row: source logo (h-4), source name, dot separator, timestamp
- Read more link: text-primary, text-sm, mt-4
- Hover: subtle lift (transform translateY), shadow increase

### Search & Filter Panel
- Sticky below trending dashboard
- Background: surface color
- Layout: Keyword input (flex-1), date range picker, source filter dropdown
- Input: rounded border, focus ring in primary color
- Filter chips: rounded-full, selected state with primary background
- Apply/Clear buttons: right-aligned

### Subscription Management Modal
- Center overlay with backdrop blur
- Card: max-w-2xl, p-8
- Sections: Email input, keyword tags (add/remove), time picker, frequency selector
- Action buttons: Save (primary), Cancel (outline)
- Keyword tags: removable chips with X icon

### Article Detail View
- Max-width prose container (max-w-3xl)
- Large headline: text-3xl, mb-6
- Source banner: flex row with logo, name, publication date
- Summary card: bg-surface, p-6, rounded, border-l-4 primary
- External link button: prominent, primary color, opens in new tab
- Related articles: 2-column grid at bottom

### Email Status Indicator
- Top-right corner notification
- Small badge: subscription count, next delivery time
- Expandable panel: list of active subscriptions
- Quick actions: pause, edit, delete

---

## Images

### Hero Section: NO
This is a utility-focused news app - no traditional hero image. Start with trending dashboard.

### Article Cards: YES
- Each news card requires a thumbnail image (16:9 aspect ratio, h-48)
- Use article featured images from API responses
- Fallback: gradient placeholder with news source logo overlay
- Images should be: object-cover, w-full, rounded-t-lg

### Source Logos: YES
- Small source icons (h-4 w-4) in metadata row
- Displayed next to source name for recognition
- Colored logos preferred for brand identification

---

## Interaction Patterns

**Micro-interactions**:
- Card hover: 2px lift, shadow expansion (duration-200)
- Button hover: brightness increase (no elaborate effects)
- Filter selection: immediate visual feedback with pill background
- Search input: focus ring animation

**Loading States**:
- Skeleton screens for news cards during fetch
- Shimmer animation on card placeholders
- Linear progress bar at top during background refresh

**Animations**: Minimal
- Page transitions: fade only
- Modal enter/exit: scale + opacity
- Filter apply: smooth scroll to results
- Avoid distracting carousel or parallax effects

---

## Accessibility

- Dark mode toggle in user menu (persistent preference)
- All form inputs: consistent dark mode treatment
- Focus indicators: 2px primary color ring
- Alt text for all article images
- Keyboard navigation: arrow keys for card grid
- Screen reader labels for all interactive elements
- Minimum touch target: 44px × 44px

---

## Key Screens Layout

**Main Feed**:
1. Navigation (fixed top)
2. Trending dashboard (full-width banner)
3. Search/filter panel (sticky)
4. News grid (3-col desktop, responsive)
5. Load more button (centered, bottom)

**Subscription Settings**:
1. Modal overlay (center screen)
2. Header: "Manage Email Subscriptions"
3. Form sections: stacked vertically with clear labels
4. Preview panel: shows sample email timing
5. Footer: action buttons

**Article Detail**:
1. Back button (top-left)
2. Article header (title, source, date)
3. Summary card (highlighted)
4. Link to full article (prominent CTA)
5. Related articles grid (bottom)