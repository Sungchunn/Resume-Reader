# Documentation Index

Complete documentation for the Resume Analyzer application with LaTeX editor.

## Quick Links

### Core Documentation
- **[LaTeX Workflow Guide](LATEX_WORKFLOW.md)** - How the LaTeX-based resume system works
- **[LaTeX Compilation Setup](LATEX_COMPILATION_SETUP.md)** - Enable real-time PDF preview (⚠️ Read this if preview unavailable)
- **[n8n Webhook Setup](N8N_WEBHOOK_SETUP.md)** - Setting up and configuring the webhook backend
- **[Display Structure Guide](DISPLAY_GUIDE.md)** - Frontend architecture and UI components

## Getting Started

New to the project? Start here:

1. **[LaTeX Workflow Guide](LATEX_WORKFLOW.md)** - Understand the overall workflow
2. **[n8n Webhook Setup](N8N_WEBHOOK_SETUP.md)** - Set up your backend
3. **[Display Structure Guide](DISPLAY_GUIDE.md)** - Learn about the frontend

## Documentation Overview

### LaTeX Workflow Guide
Learn how the application processes resumes and generates LaTeX code:
- User input flow
- Webhook processing
- Response format
- Editor features
- LaTeX compilation options
- Error handling
- Customization tips

### n8n Webhook Setup
Complete guide to configuring the n8n webhook:
- Webhook configuration
- Request format
- Response format
- Workflow recommendations
- Testing procedures
- Security considerations

### Display Structure Guide
Frontend architecture and UI design:
- Page structure
- Component hierarchy
- Responsive design
- Color schemes
- CSS classes
- State management
- Navigation flow
- Accessibility features

## Key Features

### User Features
- Interactive LaTeX editor with syntax highlighting
- Real-time code editing
- Dark mode support
- Copy to clipboard
- Download as .tex file
- Comprehensive resume analysis
- Split-panel view for analysis and editing

### Technical Features
- React with React Router
- Monaco Editor integration
- Responsive design (mobile, tablet, desktop)
- CSS variables for theming
- FormData API for file uploads
- Blob URL lifecycle management
- Error handling and validation

## Common Tasks

### Change Webhook URL
Edit `src/App.js` line 6:
```javascript
const UPLOAD_WEBHOOK = 'YOUR_WEBHOOK_URL';
```

### Customize Editor Theme
Edit `src/components/LatexEditor.js`:
```javascript
const [theme, setTheme] = useState('vs-dark'); // or 'vs-light'
```

### Modify Response Format
See [n8n Webhook Setup](N8N_WEBHOOK_SETUP.md) for response format details.

### Update UI Colors
Edit CSS variables in `src/App.css`:
```css
:root {
  --accent-blue: #1890ff;
  --accent-green: #10b981;
  /* ... */
}
```

## Architecture

### Frontend Stack
- React 18
- React Router v6
- Monaco Editor
- CSS with CSS Variables

### Backend
- n8n workflow automation
- Webhook-based API
- AI analysis (OpenAI/Claude/similar)
- LaTeX generation

### File Structure
```
src/
├── App.js                 # Main form and routing
├── App.css               # Global styles
├── index.js              # React entry point
├── components/
│   └── LatexEditor.js    # LaTeX editor component
└── pages/
    ├── AnalysisPage.js   # Analysis + editor view
    └── PDFPage.js        # Legacy PDF viewer
```

## Development

### Running Locally
```bash
npm install
npm start
```

### Building for Production
```bash
npm run build
```

### Testing
Test the webhook integration:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -F "job_title=Senior Software Engineer" \
  -F "job_description=..." \
  -F "file=@resume.pdf"
```

## Troubleshooting

### Common Issues

**LaTeX editor not showing**
- Check browser console for errors
- Verify webhook returns `latex` or `latex_code` field
- Ensure JSON is properly formatted

**Dark mode not working**
- Verify system theme preferences
- Check browser supports `prefers-color-scheme`
- Try manual theme toggle

**Upload fails**
- Check file is PDF format
- Verify file size < 10MB
- Test webhook URL is accessible
- Check network tab for errors

**Editor performance issues**
- Disable minimap in editor options
- Reduce font size
- Check for memory leaks

## Support

For issues or questions:
1. Check this documentation first
2. Review browser console errors
3. Test webhook independently
4. Verify n8n workflow is active

## Contributing

When making changes:
1. Update relevant documentation
2. Test on multiple browsers
3. Verify responsive design
4. Check accessibility
5. Update CHANGELOG

## Version History

See main README.md for version history and changelog.

## Additional Resources

### LaTeX Resources
- [Overleaf Documentation](https://www.overleaf.com/learn)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)
- [LaTeX Templates](https://www.latextemplates.com/)

### React Resources
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

### n8n Resources
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [Webhook Guide](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
