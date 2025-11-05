# Personal Brain - Modern UI

A beautiful, minimalist frontend for the Personal Brain MCP application, inspired by Apple's design language and modern AI websites.

## Design Philosophy

### Visual Design
- **Apple-inspired minimalism**: Clean, spacious layouts with generous white space
- **Glass morphism**: Frosted glass effects with backdrop blur for modern aesthetics
- **Smooth animations**: Fluid transitions and hover effects throughout
- **Modern typography**: Inter font family for excellent readability
- **Gradient accents**: Subtle gradients for visual interest

### Color Palette
- **Primary**: #007AFF (Apple blue)
- **Secondary**: #5856D6 (Purple)
- **Success**: #34C759 (Green)
- **Warning**: #FF9500 (Orange)
- **Danger**: #FF3B30 (Red)

### Key Features

#### 🎨 Beautiful Landing Page
- Hero section with animated floating cards
- Feature showcase grid
- Smooth scroll navigation
- Responsive design

#### 💬 AI Chat Interface
- Real-time streaming responses
- Citation support with references
- Model selection (Gemini/Claude)
- Auto-expanding textarea
- Clean message bubbles

#### 📚 Document Management
- Drag-and-drop file upload
- Beautiful document cards
- File type icons
- Document preview modal
- Upload progress notifications

#### 🔍 Semantic Search
- Clean search interface
- Type filtering (Documents/Chats)
- Result cards with relevance scores
- Empty states and loading indicators

## File Structure

```
frontend/
├── index.html          # Main HTML page with all sections
├── css/
│   └── styles.css      # Complete styling with animations
├── js/
│   └── app.js          # Application logic and API integration
└── assets/             # Static assets (future use)
```

## Key Components

### Navigation
- Fixed glass morphism navbar
- Smooth scroll to sections
- Active link highlighting
- Mobile responsive

### Hero Section
- Large heading with gradient text
- Animated floating cards
- Call-to-action buttons
- Background gradient with pulse animation

### Chat Section
- Message history with auto-scroll
- User/Assistant message distinction
- Citations display
- Model and settings controls
- Streaming response support

### Documents Section
- Drag-and-drop upload area
- Document grid layout
- Document preview modal
- File size and date display
- Refresh functionality

### Search Section
- Search input with icon
- Type and limit filters
- Result cards with scores
- Empty and loading states

## CSS Features

### Variables
- Comprehensive CSS variables for easy customization
- Color, spacing, typography, and animation variables
- Consistent design tokens

### Animations
- `float`: Floating cards animation
- `pulse`: Background pulse effect
- `spin`: Loading spinner
- `slideIn`: Message entrance animation

### Responsive Design
- Desktop-first approach
- Tablet breakpoint (1024px)
- Mobile breakpoint (768px)
- Small mobile breakpoint (480px)

## JavaScript Architecture

### Class-based Structure
- `ChatManager`: Handles all chat functionality
- `DocumentManager`: Manages document upload and display
- `SearchManager`: Handles search operations

### API Integration
- Dynamic API_BASE_URL detection
- Fetch API for all requests
- Error handling with notifications
- Loading states

### Key Features
- Auto-resizing textarea
- Drag-and-drop file upload
- Smooth scrolling navigation
- Modal dialogs
- Toast notifications

## Usage

### Starting the Application
```bash
# From the project root
uvicorn main:app --reload

# Visit http://localhost:8000
```

The frontend will automatically load at the root URL (`/`).

### API Endpoints Used
- `GET /` - Serves the frontend
- `POST /chat` - Streaming chat
- `POST /chat/enhanced` - Chat with citations
- `POST /upsert` - Upload documents
- `GET /documents` - List documents
- `GET /documents/{id}` - Get document details
- `GET /search` - Search chats
- `GET /search/documents` - Search documents

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #007AFF;
    --secondary: #5856D6;
    /* ... more colors */
}
```

### Typography
Change font family:
```css
:root {
    --font-family: 'Your Font', sans-serif;
}
```

### Animations
Adjust animation durations:
```css
:root {
    --transition-fast: 150ms;
    --transition-base: 250ms;
    --transition-slow: 350ms;
}
```

## Browser Support
- Modern browsers with ES6+ support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements
- Dark mode toggle
- User preferences storage
- Advanced search filters
- Document categorization
- Chat export functionality
- Keyboard shortcuts
- Accessibility improvements

## Credits
Design inspired by:
- Apple's design language
- Modern AI websites (OpenAI, Anthropic, Perplexity)
- Glass morphism design trends
- Minimalist web design principles
