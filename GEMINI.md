# Vienna/Germany Trip Manager Development Guidelines

## MUST READ Before Development
- Read `要件定義書.md` (Requirements Specification) thoroughly. Implement ALL requirements and features defined there.
- Use `FunctionTest.md` as the final checklist to verify that all implemented features are present and correct.

## Key Documents
| Path | Description |
| :--- | :--- |
| `要件定義書.md` | Core requirements, design concepts (Vienna Secession), and technical stack. |
| `FunctionTest.md` | Functional test battery. Every item MUST pass before completion. |

## Technical Requirements

### Tech Stack (Preferred)
- **Frontend**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

### Design & UX
- **Theme**: "Vienna Secession" aesthetic. Use Bordeaux (Wine Red), Gold, Cream, and Dark Brown.
- **Typography**: Serif (Mincho) based elegant design.
- **Performance**: Instant interaction (0.5s visual feedback).
- **Navigation**: Simple 2-tab (Schedule / Accounting) + FAB layout.

### Platform & PWA
- **Mobile-First**: Primary target is smartphone.
- **PWA Features**: Must be installable and support offline viewing (caching).
- **Responsive**: Fully functional on both Mobile and Desktop (Responsive Design).

## Core Feature Logic
1. **Schedule**:
   - Timeline view with auto-scroll to current time.
   - Quick integration with external map apps via address/coordinates.
2. **Accounting**:
   - Split-bill logic based on "Who Paid" and "For Whom" (multi-select).
   - Separate balances for EUR and JPY (no automatic currency conversion).
   - Persistent balance display (Net +/- per person).
3. **Info/Knowledge**:
   - Support for rendering raw HTML/CSS (Infographics created by LLMs).

## Final Verification Checklist
1. Go through `FunctionTest.md` line by line.
2. Verify EVERY listed feature is implemented and working as expected.
3. Ensure the "Vienna Secession" theme is consistently applied throughout the app.
