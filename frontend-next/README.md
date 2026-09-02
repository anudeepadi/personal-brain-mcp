# Personal Brain - Next.js Frontend

A beautiful, modern frontend for the Personal Brain MCP application built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and shadcn/ui components.

> **Portfolio Demo Ready**: Optimized for Vercel deployment with graceful offline modes and security hardening.

## ✨ Features

- **🎭 Modern UI**: Glass morphism effects, smooth Framer Motion animations
- **📱 Fully Responsive**: Mobile-first design with Tailwind CSS 4
- **♿ Accessible**: Built on Radix UI primitives with WCAG AA standards
- **⚡ Production Optimized**: Static generation, Turbopack builds
- **🔒 Security Hardened**: No secrets in client bundle, secure headers
- **🌙 Dark Mode Ready**: Pre-configured theme system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file (optional, only if customizing API endpoint):

```bash
# Optional: Override default API proxy
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important**: Never commit `.env.local` or any file containing secrets. The frontend is designed to work standalone as a static demo without backend dependencies.

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

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anudeepadi/personal-brain-mcp&project-name=personal-brain-frontend&root-directory=frontend-next)

### Manual Deploy

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend-next directory**
   ```bash
   cd frontend-next
   vercel
   ```

4. **Configure Environment (Optional)**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` if connecting to a backend API
   - Update `vercel.json` rewrites with your backend URL

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Required Configuration

The included `vercel.json` provides:
- ✅ Next.js framework detection
- ✅ Security headers (CSP, XSS protection)
- ✅ API proxy configuration (update destination URL)

**Before deploying**: Edit `vercel.json` and replace `https://your-backend-api.com` with your actual backend API URL, or remove the rewrites section to deploy as a static demo.

### Vercel Environment Variables

Set these in Vercel Dashboard (if needed):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | No (uses proxy by default) |

### Other Platforms

For deployment to Netlify, Cloudflare Pages, or AWS Amplify:

```bash
npm run build
```

Deploy the `.next` folder following your platform's Next.js deployment guide.

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

## 🛡️ Security & Production Notes

### Client Bundle Safety
- ✅ No API keys or secrets in client code
- ✅ Environment variables properly prefixed with `NEXT_PUBLIC_*`
- ✅ Security headers configured in `vercel.json`
- ✅ No server-side secrets exposed to browser

### Graceful Degradation
The demo frontend works standalone without a backend:
- Empty states for all sections
- No API calls in initial page load
- Interactive UI without backend dependencies
- Ready for integration when backend is available

### What's Included
- ✅ Production-optimized build configuration
- ✅ TypeScript strict mode enabled
- ✅ Tailwind CSS 4 with PostCSS plugin
- ✅ Responsive design (mobile-first)
- ✅ Accessible components (WCAG AA)
- ✅ SEO metadata configured

## 🎯 Roadmap

- [ ] Implement actual API calls with loading states
- [ ] Add error handling and retry logic
- [ ] Dark mode toggle component
- [ ] Authentication flow
- [ ] Real-time updates via WebSocket
- [ ] Progressive Web App features
- [ ] E2E tests with Playwright
