# Personal Brain - Modern Next.js UI

A beautiful, modern frontend for the Personal Brain MCP application built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🎨 Design Philosophy

### Modern Stack
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible component library
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library

### Design Inspired By
- **Apple**: Minimalist design, glass morphism, spacious layouts
- **OpenAI/Anthropic**: Modern AI website aesthetics
- **Perplexity**: Clean, focused interfaces

## 🚀 Features

### Component Library
Built with shadcn/ui components:
- Button, Card, Input, Textarea, Tabs
- Fully accessible with Radix UI primitives
- Customizable with Tailwind CSS
- Type-safe with TypeScript

### Sections
1. **Hero Section**: Animated landing with gradient text and floating cards
2. **Features Grid**: Showcase of key capabilities
3. **Chat Interface**: AI-powered chat with model selection
4. **Document Management**: Upload and view documents
5. **Semantic Search**: Advanced search functionality

### Key Features
- 🎭 Glass morphism effects
- 🌊 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🎨 Beautiful gradient text effects
- ⚡ Optimized performance
- ♿ Accessible components
- 🌙 Dark mode ready (configured)

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Navigate to the frontend directory
cd frontend-next

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Project Structure

```
frontend-next/
├── app/
│   ├── globals.css         # Global styles with Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page with all sections
├── components/
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── tabs.tsx
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🎨 Design System

### Colors
The design uses HSL color variables for easy theming:
- **Primary**: Blue (#007AFF) - Apple-inspired
- **Secondary**: Purple (#5856D6)
- **Muted**: Subtle grays for backgrounds
- **Accent**: Interactive elements

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale from xs to 6xl
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
Consistent spacing scale using Tailwind's default system

### Border Radius
- sm, md, lg variants
- Custom variables for consistency

## 🔌 API Integration

The frontend is configured to proxy API requests to the FastAPI backend:

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/:path*',
    },
  ];
}
```

### API Endpoints Used
- `POST /chat` - Streaming chat
- `POST /chat/enhanced` - Chat with citations
- `POST /upsert` - Upload documents
- `GET /documents` - List documents
- `GET /documents/{id}` - Get document details
- `GET /search` - Search chats
- `GET /search/documents` - Search documents

## 🎭 Components

### shadcn/ui Components
All components are built following shadcn/ui patterns:
- Fully typed with TypeScript
- Accessible with Radix UI
- Customizable with className
- Consistent API across components

### Custom Animations
Using Framer Motion for:
- Page section animations
- Hover effects
- Scroll animations
- Entrance animations

## 🎨 Customization

### Colors
Edit `app/globals.css` CSS variables:

```css
:root {
  --primary: 211 100% 50%;
  --secondary: 243 75% 59%;
  /* ... more colors */
}
```

### Components
Customize shadcn/ui components in `components/ui/`:

```tsx
// Example: Modify button styles
const buttonVariants = cva(
  "your-base-classes",
  {
    variants: {
      // Your variants
    }
  }
);
```

### Tailwind
Extend Tailwind config in `tailwind.config.ts`:

```typescript
extend: {
  colors: {
    // Your custom colors
  },
  animation: {
    // Your custom animations
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
Build the application:
```bash
npm run build
```

Then deploy the `.next` folder to your preferred hosting platform.

## 🔧 Development

### Adding New Components
Use shadcn/ui CLI (when available) or manually create components following the pattern in `components/ui/`.

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Type Safety
The project uses strict TypeScript. Run type checking:
```bash
npm run build
```

## 📱 Responsive Design

Breakpoints:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## ♿ Accessibility

- All interactive elements are keyboard accessible
- ARIA labels and roles implemented
- Focus indicators visible
- Color contrast meets WCAG AA standards

## 🌙 Dark Mode

Dark mode is configured and ready. Toggle with:
```tsx
<html className="dark">
```

Or implement a theme toggle component.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion)
- [Lucide Icons](https://lucide.dev)

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and component patterns.

## 📄 License

MIT

## 🎯 Future Enhancements

- [ ] Implement actual API calls
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add dark mode toggle
- [ ] Create more page routes
- [ ] Add authentication
- [ ] Implement real-time updates
- [ ] Add progressive web app features
- [ ] Optimize images with next/image
- [ ] Add E2E tests
