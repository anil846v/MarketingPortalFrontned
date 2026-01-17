# Admin Dashboard Documentation

## Overview
The Admin Dashboard is a comprehensive management interface for the Marketing Team Portal, providing full control over users, school visits, orders, modules, announcements, and real-time messaging.

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Modules](#modules)
4. [Security](#security)
5. [API Endpoints](#api-endpoints)
6. [Performance](#performance)
7. [Deployment](#deployment)

---

## Features

### Core Capabilities
- **User Management**: Register, update, delete, and manage marketing team members
- **School Visits**: Track and manage school visit requests with detailed information
- **Order Management**: Monitor and process orders with status tracking
- **Module Control**: Enable/disable platform modules dynamically
- **Announcements**: Create and manage system-wide announcements
- **Real-time Messaging**: Direct communication with marketing team members
- **Role-based Access**: Secure authentication with ADMIN role requirement

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: Custom CSS with modern gradients and animations
- **Build Tool**: Vite with code splitting and minification

### Project Structure
```
src/
├── AdminDashboard.jsx           # Main dashboard container
├── AdminDashboard/
│   ├── Home.jsx                 # Dashboard overview with stats
│   ├── Users.jsx                # User management module
│   ├── SchoolVisits.jsx         # School visits module
│   ├── Order.jsx                # Order management module
│   ├── Modules.jsx              # Module control panel
│   ├── Announcemnts.jsx         # Announcements module
│   ├── Messages.jsx             # Real-time messaging
│   └── SideMenu.jsx             # Collapsible navigation sidebar
├── ProtectedRoute.jsx           # Authentication wrapper
├── LoginPage.jsx                # Login interface
├── config.js                    # Environment configuration
├── utils/
│   ├── authFetch.js             # Authenticated API calls
│   └── security.js              # Input validation & sanitization
├── hooks/
│   └── useApiError.js           # Error handling hook
└── components/
    └── LoadingSpinner.jsx       # Reusable loading component
```

---

## Modules

### 1. Home Dashboard
**File**: `AdminDashboard/Home.jsx`

**Features**:
- 4 stat cards showing counts for users, visits, orders, and modules
- Quick action buttons to navigate to each module
- Modern gradient design with SVG icons
- Real-time data fetching on mount

**API Endpoints**:
- `GET /admin/marketing-users` - Fetch user count
- `GET /admin/school-visits` - Fetch visit count
- `GET /admin/orders` - Fetch order count
- `GET /admin/modules` - Fetch module count

**Design**:
- Purple gradient for users (#667eea → #764ba2)
- Blue gradient for visits (#4facfe → #00f2fe)
- Green gradient for orders (#43e97b → #38f9d7)
- Pink gradient for modules (#f093fb → #f5576c)

---

### 2. Users Management
**File**: `AdminDashboard/Users.jsx`

**Features**:
- View all marketing team members in a table
- Register new users with comprehensive form
- Update existing user information
- Delete users with confirmation
- Change user status (Enable/Disable/Block)

**User Fields**:
- Full Name, Email, Password
- Phone Number, Age, Gender
- Address, Assigned Region, Target Districts

**API Endpoints**:
- `GET /admin/marketing-users` - List all users
- `POST /admin/register-marketing-user` - Create new user
- `PUT /admin/update-marketing-user/:id` - Update user
- `DELETE /admin/delete-marketing-user/:id` - Delete user
- `PUT /admin/change-user-status/:id` - Change status

**Status Options**:
- **Approved**: User can access the system
- **Pending**: User access disabled
- **Rejected**: User blocked from system

---

### 3. School Visits
**File**: `AdminDashboard/SchoolVisits.jsx`

**Features**:
- View all school visit requests in a table
- Detailed modal with tabbed interface (Details/Contact/Additional)
- Back button with purple gradient and SVG icon
- Modern table styling with hover effects

**Visit Information**:
- School name, principal name, contact details
- Visit date, time, purpose
- Number of students, infrastructure details
- Status tracking

**API Endpoints**:
- `GET /admin/school-visits` - List all visits

**Design Pattern**:
- Purple gradient theme (#667eea → #764ba2)
- Tabbed modal for organized information display
- Responsive table with proper spacing

---

### 4. Order Management
**File**: `AdminDashboard/Order.jsx`

**Features**:
- View all orders in a table
- Detailed modal with tabbed interface (Order Info/Customer/Items)
- Back button with blue gradient and SVG icon
- Order status tracking

**Order Information**:
- Order ID, customer details
- Order items and quantities
- Total amount, payment status
- Delivery information

**API Endpoints**:
- `GET /admin/orders` - List all orders

**Design Pattern**:
- Blue gradient theme (#4facfe → #00f2fe)
- Consistent modal structure with other modules

---

### 5. Module Control
**File**: `AdminDashboard/Modules.jsx`

**Features**:
- Enable/disable platform modules dynamically
- Toggle switches for quick status changes
- Edit module details with green gradient button
- Real-time module status updates

**Module Fields**:
- Module name, description
- Status (Active/Inactive)
- Configuration options

**API Endpoints**:
- `GET /admin/modules` - List all modules
- `PUT /admin/modules/:id` - Update module status

**Design Pattern**:
- Green gradient theme (#43e97b → #38f9d7)
- Toggle switches for intuitive control

---

### 6. Announcements
**File**: `AdminDashboard/Announcemnts.jsx`

**Features**:
- View all announcements in a list
- Create new announcements
- Delete announcements with confirmation
- Pagination support
- Delete button with pink gradient and SVG icon

**Announcement Fields**:
- Title, content
- Created date, author
- Target audience

**API Endpoints**:
- `GET /admin/announcements` - List announcements
- `POST /admin/announcements` - Create announcement
- `DELETE /admin/announcements/:id` - Delete announcement

**Design Pattern**:
- Pink gradient theme (#f093fb → #f5576c)
- Card-based layout for announcements

---

### 7. Real-time Messaging
**File**: `AdminDashboard/Messages.jsx`

**Features**:
- Two-panel layout (user list + chat area)
- Real-time message polling (10s interval)
- Unread message count (30s interval)
- Read status indicators (single/double checkmarks)
- Message deletion (for me / for everyone)
- Auto-scroll to latest message
- Collapsible sidebar integration

**Message Features**:
- Send text messages
- View conversation history
- Read receipts (✓ = sent, ✓✓ = read)
- Delete options with confirmation
- User avatars with initials

**API Endpoints**:
- `GET /admin/marketing-users` - Fetch user list
- `GET /admin/messages/conversation/:userId` - Get conversation
- `POST /admin/messages/send` - Send message
- `DELETE /admin/messages/:id?deleteType=FOR_ME|FOR_EVERYONE` - Delete message
- `GET /admin/messages/unread-count` - Get unread count

**Design Specifications**:
- Sidebar header: 72px height
- Chat header: 72px height (aligned with sidebar)
- Sidebar collapses to 60px when chat opens
- Purple gradient avatars (#667eea → #764ba2)
- Sent messages: Purple background (#667eea)
- Received messages: White background

**Performance Optimization**:
- Conversation polling: 10 seconds (reduced from 3s)
- Unread count polling: 30 seconds (reduced from 5s)
- Auto-cleanup on component unmount

---

### 8. Side Menu
**File**: `AdminDashboard/SideMenu.jsx`

**Features**:
- Collapsible sidebar (240px ↔ 60px)
- Hamburger menu toggle
- Icon-only mode when collapsed
- Active tab highlighting
- Smooth transitions

**Navigation Items**:
- Home, Users, Visits, Orders, Modules, Announcements, Messages

**Design**:
- Width: 240px (expanded), 60px (collapsed)
- Transition: 0.3s ease
- Active state: Purple highlight

---

## Security

### Authentication Flow
1. User logs in via `/login`
2. Backend validates credentials and creates session
3. Session cookie stored with `httpOnly` flag
4. `ProtectedRoute` validates session on mount
5. All API calls include `credentials: 'include'`
6. Auto-redirect to `/login` on 401/403 errors

### Security Features
- **Session-based Authentication**: Secure cookie-based sessions
- **Role-based Access Control**: ADMIN role required for dashboard
- **Input Sanitization**: XSS protection via `security.js`
- **Rate Limiting**: 5 login attempts max (client-side)
- **Auto-logout**: Session expiry handling with redirect
- **CSRF Protection**: Backend implements CSRF tokens
- **SQL Injection Prevention**: Parameterized queries on backend

### Protected Routes
```javascript
<ProtectedRoute requiredRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>
```

### Input Validation
- Username: 3-100 characters, sanitized
- Password: 6-100 characters
- All inputs: HTML tag removal, length limits

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/validate` | Validate session |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/marketing-users` | List all users |
| POST | `/admin/register-marketing-user` | Create user |
| PUT | `/admin/update-marketing-user/:id` | Update user |
| DELETE | `/admin/delete-marketing-user/:id` | Delete user |
| PUT | `/admin/change-user-status/:id` | Change status |

### School Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/school-visits` | List all visits |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/orders` | List all orders |

### Modules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/modules` | List all modules |
| PUT | `/admin/modules/:id` | Update module |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/announcements` | List announcements |
| POST | `/admin/announcements` | Create announcement |
| DELETE | `/admin/announcements/:id` | Delete announcement |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/messages/conversation/:userId` | Get conversation |
| POST | `/admin/messages/send` | Send message |
| DELETE | `/admin/messages/:id` | Delete message |
| GET | `/admin/messages/unread-count` | Get unread count |

**Request Format**:
```javascript
// All requests include credentials
fetch(`${API_BASE_URL}/endpoint`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data)
});
```

---

## Performance

### Optimization Strategies
1. **Lazy Loading**: Routes loaded on-demand
2. **Code Splitting**: Vendor and app bundles separated
3. **Minification**: Production build removes whitespace and comments
4. **Console Removal**: All console.log removed in production
5. **Polling Optimization**: Reduced API call frequency
6. **Error Boundaries**: Graceful error handling without crashes

### Build Configuration
**File**: `vite.config.js`
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom']
      }
    }
  },
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true
    }
  }
}
```

### Performance Metrics
- Initial bundle size: ~150KB (gzipped)
- Lazy-loaded routes: ~30KB each
- API response time: <200ms (local)
- Message polling: 10s interval
- Unread count polling: 30s interval

### Caching Strategy
- Session validation cached on mount
- No aggressive re-fetching on route changes
- Manual refresh triggers for data updates

---

## Deployment

### Environment Configuration
**File**: `.env`
```
VITE_API_URL=http://localhost:9090
```

**Production**:
```
VITE_API_URL=https://api.yourdomain.com
```

### Build Process
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      # Main app bundle
│   ├── vendor-[hash].js     # React & dependencies
│   └── [module]-[hash].js   # Lazy-loaded routes
└── assets/
    └── [styles]-[hash].css  # Compiled CSS
```

### Deployment Checklist
- ✅ Set production API URL in `.env`
- ✅ Run `npm run build`
- ✅ Test production build with `npm run preview`
- ✅ Configure CORS on backend for production domain
- ✅ Enable HTTPS for secure cookie transmission
- ✅ Set up CDN for static assets
- ✅ Configure backend session settings (secure, sameSite)
- ✅ Set up monitoring and error tracking
- ✅ Configure database connection pooling
- ✅ Enable backend rate limiting

### Server Requirements
- **Node.js**: v18+ (for build process)
- **Backend**: Java 17+ with Spring Boot
- **Database**: MySQL/PostgreSQL
- **Web Server**: Nginx/Apache (for serving static files)
- **SSL Certificate**: Required for production

### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/admin-dashboard/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:9090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Error Handling

### Error Boundaries
**File**: `ErrorBoundary.jsx`
- Catches React component crashes
- Displays user-friendly error message
- Provides reload option

### API Error Handling
**File**: `utils/authFetch.js`
- 401/403: Auto-redirect to login
- 500: Server error message
- 503: Service unavailable message
- Network errors: Connection error message

### User Feedback
- Loading states on all async operations
- Success/error alerts for user actions
- Confirmation dialogs for destructive actions
- Inline validation for form inputs

---

## Styling

### Design System
**File**: `assets/AdminDashboard.css`

**Color Palette**:
- Purple: `#667eea → #764ba2` (Users, Visits)
- Blue: `#4facfe → #00f2fe` (Orders)
- Green: `#43e97b → #38f9d7` (Modules)
- Pink: `#f093fb → #f5576c` (Announcements)

**Layout**:
- Sidebar: 240px (expanded), 60px (collapsed)
- Top header: 60px height
- Message headers: 72px height
- Content area: `zoom: 0.9` for better fit

**Responsive Design**:
- Collapsible sidebar for smaller screens
- Responsive tables with horizontal scroll
- Mobile-friendly forms with proper spacing

---

## Troubleshooting

### Common Issues

**1. Login fails with "Username can only contain..."**
- **Cause**: Strict username validation
- **Fix**: Username validation relaxed to allow emails

**2. Logout doesn't work**
- **Cause**: Backend logout endpoint not clearing session
- **Fix**: Ensure backend `/auth/logout` invalidates session

**3. 401 errors in console after logout**
- **Cause**: ProtectedRoute checking auth after logout
- **Fix**: This is expected behavior, not an error

**4. Messages not updating in real-time**
- **Cause**: Polling intervals too long
- **Fix**: Adjust intervals in Messages.jsx (currently 10s/30s)

**5. Data not loading**
- **Cause**: Backend not running or CORS issues
- **Fix**: Verify backend is running on port 9090, check CORS config

---

## Future Enhancements

### Recommended Improvements
1. **WebSocket Integration**: Replace polling with real-time WebSocket connections
2. **Pagination**: Add pagination for large datasets (users, visits, orders)
3. **Search & Filters**: Advanced search and filtering capabilities
4. **Export Functionality**: Export data to CSV/Excel
5. **Analytics Dashboard**: Charts and graphs for data visualization
6. **Notification System**: Push notifications for important events
7. **Audit Logs**: Track all admin actions for compliance
8. **Bulk Operations**: Bulk user updates, message broadcasts
9. **File Uploads**: Support for attachments in messages
10. **Dark Mode**: Theme toggle for user preference

---

## Support

### Getting Help
- Check this documentation first
- Review error messages in browser console
- Verify backend API is running and accessible
- Check network tab for failed requests
- Ensure proper authentication and session management

### Development Team
- Frontend: React + Vite
- Backend: Spring Boot + MySQL
- Authentication: Session-based with cookies
- Deployment: Nginx + Node.js

---

## Version History

### v1.0.0 (Current)
- Initial production release
- All core modules implemented
- Security features enabled
- Performance optimizations applied
- Production-ready deployment

---

**Last Updated**: 2024
**Documentation Version**: 1.0.0
