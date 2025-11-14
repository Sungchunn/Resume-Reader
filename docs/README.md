# Resume Analyzer Documentation

Welcome to the Resume Analyzer documentation! This folder contains comprehensive guides for understanding, configuring, and troubleshooting the application.

## 📚 Documentation Index

### 🚀 Getting Started

**[N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md)** ⭐ **Start here!**
- Webhook node configuration
- Form data access in n8n
- Expected response formats
- CORS settings
- Common issues and solutions

### 🔧 n8n Configuration

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
├── N8N_WEBHOOK_SETUP.md        # Webhook configuration
├── N8N_RESPONSE_GUIDE.md       # Response format options
└── DISPLAY_GUIDE.md            # Frontend display details
```

## 🎯 Quick Links by Task

### I want to...

**Set up the webhook**
→ Read [N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md)

**Configure n8n responses**
→ Read [N8N_RESPONSE_GUIDE.md](N8N_RESPONSE_GUIDE.md)

**Debug display issues**
→ Read [DISPLAY_GUIDE.md](DISPLAY_GUIDE.md)

## 🔍 Key Concepts

### Single Webhook Architecture

The app uses a **single webhook** that can return either JSON with analysis and LaTeX code, or a PDF file directly.

### Multi-Page Routing

Three separate pages with React Router:
- `/` - Home/Form page
- `/analysis` - Analysis insights page
- `/pdf` - PDF viewer page

### System-Synced Dark Mode

Automatic theme switching based on OS preference using CSS variables and `prefers-color-scheme` media query.

## 📖 Reading Order

**For first-time setup:**

1. [N8N_WEBHOOK_SETUP.md](N8N_WEBHOOK_SETUP.md) - Configure your webhook
2. [N8N_RESPONSE_GUIDE.md](N8N_RESPONSE_GUIDE.md) - Set up response format
3. Test and deploy!

**For understanding the frontend:**

1. [DISPLAY_GUIDE.md](DISPLAY_GUIDE.md) - Display logic and components

## 🆘 Troubleshooting

**Something not working?**

1. Check browser console for errors
2. Verify the webhook is responding correctly
3. Review relevant documentation above
4. Check the troubleshooting sections in each guide

## 🔄 Updates

All documentation is kept up-to-date with the latest implementation.

---

**Need help?** Review the guides above or check the main [README.md](../README.md) in the project root.
