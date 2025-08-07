# Mug Painter 🎨

A professional web-based tool for creating custom sublimation mug wrap templates. Design, preview, and export high-quality templates with precise dimensions, artwork placement, and comprehensive formatting options.

## ✨ Features

### 🎯 **Professional Design System**
- **Precision Templates** - Generate templates based on exact mug dimensions
- **Real-time Preview** - See your design update instantly as you make changes  
- **Guide Boxes** - Visual guides show safe artwork placement zones
- **Multiple Export Formats** - SVG (vector), PNG (300 DPI), and PDF (Letter size)

### 🖼️ **Advanced Artwork Management**
- **Dual-Side Design** - Separate artwork for front and back of mug
- **Image Support** - Upload and transform images with flip, rotate controls
- **Smart Scaling** - Automatic scaling to fit within design boundaries
- **Background Options** - Transparent, solid colors, or custom images with multiple display styles

### 🔤 **Professional Typography**
- **Custom Font Selector** - Live preview of 13+ Google Fonts in dropdown
- **Rich Text Formatting** - Bold, Italic, Underline, Strikethrough
- **Text Contours** - Add customizable outlines to text
- **Multi-line Support** - Automatic scaling and centering for text blocks
- **Real-time Typography** - See exactly how fonts look before applying

### 💾 **Project Management**
- **Save & Load Projects** - Export files with embedded project data for re-editing
- **Version Control** - Timestamped project data with version tracking  
- **Cross-Session Editing** - Load previously exported files to continue editing
- **Optional Data Embedding** - Toggle project data inclusion in exports

### 🔧 **Technical Excellence**
- **Client-Side Processing** - No server required, works offline
- **High-Quality Output** - Vector SVG, 300 DPI PNG, professional PDF
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean interface built with Tailwind CSS

## 🚀 Quick Start

### Installation
No installation required! Simply open the `index.html` file in any modern web browser.

```bash
# Clone the repository
git clone [repository-url]
cd mug-painter

# Open in browser (or use any local server)
open index.html
```

### Basic Usage
1. **Set Dimensions** - Enter your mug's height, diameter, and handle width
2. **Choose Background** - Select transparent, solid color, or upload an image
3. **Add Artwork** - Upload images or add formatted text to front/back
4. **Preview & Export** - Review your design and download in your preferred format

## 📋 Detailed Features

### Mug Specifications
- **Height** - Precise mug height in millimeters
- **Diameter** - Mug circumference calculation from diameter
- **Handle Area** - Customizable handle cutout width
- **Template Generation** - Automatic wrap template with proper cutouts

### Background System
- **Transparent** - Checkerboard preview for transparent backgrounds
- **Solid Colors** - Full color picker with hex support
- **Image Backgrounds** - Upload custom images with scaling options:
  - **Fill** - Cover entire area (may crop image)
  - **Fit** - Scale to fit entirely visible (may have empty space)
  - **Stretch** - Stretch to fill exactly (may distort)
  - **Tile** - Repeat image as pattern
  - **Center** - Center image with original size
- **Size Options** - XS, Small, Medium, Large, XL, or Original dimensions

### Artwork Tools
#### Image Artwork
- **File Upload** - Support for common image formats
- **Transformations** - Flip horizontal/vertical, rotate left/right
- **Smart Placement** - Automatic positioning within guide boundaries

#### Text Artwork
- **Font Selection** - Live preview dropdown with Google Fonts integration
- **Text Formatting** - Bold, Italic, Underline, Strikethrough
- **Text Contours** - Customizable outline colors and thickness
- **Multi-line Support** - Automatic line spacing and centering
- **Color Control** - Full color picker for text and contours
- **Dynamic Sizing** - Automatic scaling to fit available space

### Export Options
#### SVG Export
- **Vector Format** - Scalable graphics for any size
- **Font Embedding** - Embedded fonts for consistent rendering
- **Clean Code** - Optimized SVG output

#### PNG Export  
- **High Resolution** - 300 DPI for professional printing
- **Transparent Support** - Proper alpha channel handling
- **Color Accuracy** - Precise color reproduction

#### PDF Export
- **Professional Layout** - Letter size (8.5" x 11") in landscape
- **Print Ready** - 6.3mm margins on all sides
- **Vector Quality** - High-resolution embedded images

#### Cutout Files
- **Sublimation Ready** - Black template on transparent background
- **Multiple Formats** - Available in SVG and PNG
- **Perfect Registration** - Exact match to design template

## 🛠️ Technical Details

### Technologies Used
- **Frontend** - HTML5, CSS3, Modern JavaScript (ES6+)
- **Styling** - Tailwind CSS with custom components
- **Graphics** - SVG manipulation, Canvas API for rendering
- **Fonts** - Google Fonts with dynamic loading
- **PDF Generation** - jsPDF library for client-side PDF creation
- **Data Storage** - Base64 encoding for project persistence

### Browser Compatibility
- **Modern Browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features Used** - File API, Canvas API, SVG manipulation, CSS Grid/Flexbox
- **Performance** - Optimized for real-time updates and large image handling

### File Formats Supported
#### Input
- **Images** - JPG, PNG, GIF, WebP
- **Project Files** - SVG files with embedded project data

#### Output
- **SVG** - Scalable vector graphics with embedded fonts and images
- **PNG** - High-resolution raster images (300 DPI)
- **PDF** - Print-ready documents with proper margins
- **Project Files** - SVG with metadata for re-editing

### Project Data Structure
```json
{
  "version": "1.0",
  "timestamp": "ISO-8601",
  "projectName": "string",
  "mugDimensions": { "height": number, "diameter": number, "handleAreaWidth": number },
  "background": { "type": string, "color": string, "imageData": string, "style": string },
  "faceArt": { "type": string, "imageData": string, "transformations": object, "text": object },
  "backArt": { "type": string, "imageData": string, "transformations": object, "text": object }
}
```

## 📁 Project Structure

```
mug-painter/
├── index.html          # Main application entry point
├── css/
│   └── style.css       # Custom styles and component definitions
├── js/
│   └── script.js       # Core application logic and functionality
├── README.md           # This documentation
├── CLAUDE.md          # Claude Code development guidance
└── GEMINI.md          # Additional project documentation
```

## 🎨 Usage Examples

### Creating a Simple Text Mug
1. Set mug dimensions (e.g., 96.2mm height, 84mm diameter)
2. Select "Text" for front artwork
3. Enter your text and choose a font
4. Apply formatting (bold, colors, contours)
5. Export as SVG or PNG

### Complex Design with Images
1. Configure mug specifications
2. Upload background image, set to "Fill" style
3. Add front image artwork, apply transformations
4. Add back text with custom formatting
5. Preview and export as PDF for printing

### Project Workflow
1. Design your mug template
2. Export with "Include project data" enabled
3. Share the SVG file or archive for later
4. Load the file back anytime to continue editing
5. Make adjustments and re-export as needed

## 🤝 Contributing

This is a client-side web application built with vanilla JavaScript. To contribute:

1. Fork the repository
2. Make your changes to the HTML, CSS, or JavaScript files
3. Test thoroughly in multiple browsers
4. Submit a pull request with a clear description

### Development Notes
- No build process required - direct file editing
- Use browser developer tools for debugging
- Follow existing code style and patterns
- Test with various mug dimensions and artwork types

## 📝 License

This project is open source. See the license file for details.

## 🎯 Future Enhancements

- **Template Library** - Pre-made design templates
- **Batch Processing** - Multiple mug designs in one session  
- **Advanced Text Effects** - Gradients, shadows, and curved text
- **Shape Tools** - Built-in geometric shapes and drawing tools
- **Cloud Storage** - Online project storage and sharing
- **Print Integration** - Direct printing service connections

---

**Made with ❤️ for sublimation professionals and hobbyists alike**