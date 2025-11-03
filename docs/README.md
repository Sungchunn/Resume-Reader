# Resume Analyzer Documentation

Welcome to the Resume Analyzer documentation! This folder contains comprehensive guides for understanding, configuring, and troubleshooting the application.

## 📚 Documentation Index

### 🚀 Getting Started

**[DUAL_WEBHOOK_GUIDE.md](DUAL_WEBHOOK_GUIDE.md)** ⭐ **Start here!**
- Dual webhook architecture overview
- How parallel processing works
- n8n workflow configuration for both webhooks
- Testing with curl examples
- Error handling and troubleshooting
- Performance benefits and migration guide

### 🛣️ Application Architecture

**[ROUTING_GUIDE.md](ROUTING_GUIDE.md)**
- Multi-page routing with React Router
- Navigation flow between pages
- Dark mode implementation with system sync
- Data flow through router state
- Browser support and troubleshooting

### 🔧 n8n Configuration

**[N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md)**
- Webhook node configuration
- Form data access in n8n
- Expected response formats
- CORS settings
- Common issues and solutions

**[N8N_RESPONSE_GUIDE.md](N8N_RESPONSE_GUIDE.md)**
- How to include PDF in webhook response
- Multiple response format options
- Storage integration (Google Drive, S3, Cloudinary)
- Base64 encoding guide
- Example n8n workflow structure

### 🎨 Frontend Display

**[DISPLAY_GUIDE.md](DISPLAY_GUIDE.md)**
- Split-screen layout structure
- Response parsing logic
- PDF source detection
- Debugging tips
- Mobile responsiveness

## 🗂️ Documentation Organization

```
docs/
├── README.md                    # This file - documentation index
├── DUAL_WEBHOOK_GUIDE.md       # ⭐ Main architecture guide
├── ROUTING_GUIDE.md            # Multi-page routing & dark mode
├── N8N_WEBHOOK_SETUP.md        # Webhook configuration
├── N8N_RESPONSE_GUIDE.md       # Response format options
└── DISPLAY_GUIDE.md            # Frontend display details
```

## 🎯 Quick Links by Task

### I want to...

**Set up the webhooks**
→ Read [DUAL_WEBHOOK_GUIDE.md](DUAL_WEBHOOK_GUIDE.md) first, then [N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md)

**Understand the routing**
→ Read [ROUTING_GUIDE.md](ROUTING_GUIDE.md)

**Configure n8n responses**
→ Read [N8N_RESPONSE_GUIDE.md](N8N_RESPONSE_GUIDE.md)

**Debug display issues**
→ Read [DISPLAY_GUIDE.md](DISPLAY_GUIDE.md)

**Learn about dark mode**
→ Read [ROUTING_GUIDE.md](ROUTING_GUIDE.md) - Dark Mode section

**Optimize performance**
→ Read [DUAL_WEBHOOK_GUIDE.md](DUAL_WEBHOOK_GUIDE.md) - Performance section

## 🔍 Key Concepts

### Dual Webhook Architecture

The app uses **two separate webhooks** called in parallel:
- **Analysis webhook**: Returns JSON with insights
- **PDF webhook**: Returns improved resume binary

This design provides:
- ⚡ Faster processing (parallel execution)
- 🛡️ Better resilience (graceful degradation)
- 🔧 Easier maintenance (separation of concerns)

### Multi-Page Routing

Three separate pages with React Router:
- `/` - Home/Form page
- `/analysis` - Analysis insights page
- `/pdf` - PDF viewer page

### System-Synced Dark Mode

Automatic theme switching based on OS preference using CSS variables and `prefers-color-scheme` media query.

## 📖 Reading Order

**For first-time setup:**

1. [DUAL_WEBHOOK_GUIDE.md](DUAL_WEBHOOK_GUIDE.md) - Understand the architecture
2. [N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md) - Configure your webhooks
3. [N8N_RESPONSE_GUIDE.md](N8N_RESPONSE_GUIDE.md) - Set up response format
4. Test and deploy!

**For understanding the frontend:**

1. [ROUTING_GUIDE.md](ROUTING_GUIDE.md) - Page structure and navigation
2. [DISPLAY_GUIDE.md](DISPLAY_GUIDE.md) - Display logic and components

## 🆘 Troubleshooting

**Something not working?**

1. Check browser console for errors
2. Verify both webhooks are responding correctly
3. Review relevant documentation above
4. Check the troubleshooting sections in each guide

## 🔄 Updates

All documentation is kept up-to-date with the latest implementation. Last major update: Dual webhook architecture implementation.

---

**Need help?** Review the guides above or check the main [README.md](../README.md) in the project root.
