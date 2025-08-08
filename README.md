# Mug Painter 🎨

A professional web-based tool for creating custom sublimation mug wrap templates. Design, preview, and export high-quality templates with precise dimensions, artwork placement, and comprehensive formatting options.

## ✨ Features

### 🎯 **Professional Design System**
- **Precision Templates** - Generate templates based on exact mug dimensions
- **Real-time Preview** - See your design update instantly as you make changes  
- **Guide Boxes** - Visual guides show safe artwork placement zones
- **Dual View Modes** - Toggle between 2D template view and realistic 3D mug preview
- **Undo/Redo** - Revert or reapply up to 100 previous design actions using the Undo/Redo buttons
- **Multiple Export Formats** - SVG (vector), PNG (300 DPI), and PDF (Letter size)

### 🖼️ **Advanced Artwork Management**
- **Dual-Side Design** - Separate artwork for front and back of mug
- **Image Support** - Upload and transform images with flip, rotate controls
- **Smart Scaling** - Automatic scaling to fit within design boundaries
- **Background Options** - Transparent, solid colors, or custom images with multiple display styles
- **Image Transformations** - Horizontal/vertical flip and 90° rotation controls

### 🔤 **Professional Typography**
- **Custom Font Selector** - Interactive dropdown with live preview of 13+ Google Fonts
- **Rich Text Formatting** - Bold, Italic, Underline, Strikethrough support
- **Text Contours** - Add customizable stroke outlines with color control
- **Multi-line Support** - Automatic scaling and centering for text blocks
- **Real-time Typography** - See exactly how fonts render before applying
- **Font Embedding** - Fonts embedded in exports for consistent rendering

### 🌐 **3D Visualization System**
- **Realistic 3D Mug Model** - Accurate ceramic mug with handle and proper thickness
- **Interactive Controls** - Mouse rotation, panning, and zoom functionality  
- **Texture Mapping** - Real-time application of 2D designs onto 3D mug surface
- **Professional Lighting** - Shadows and realistic material rendering
- **Seamless Toggle** - Switch between 2D and 3D views instantly
- **Handle Positioning** - Accurate handle placement opposite the design seam

### 💾 **Project Management System**
- **Save & Load Projects** - Export files with embedded project data for re-editing
- **Metadata Embedding** - Project data stored invisibly in SVG files
- **Version Control** - Timestamped project data with version tracking  
- **Cross-Session Editing** - Load previously exported files to continue editing
- **Selective Data Export** - Toggle project data inclusion in exports
- **File Format Support** - Load .svg and .mugproj project files

### 🔧 **Technical Excellence**
- **Client-Side Processing** - No server required, works completely offline
- **High-Quality Output** - Vector SVG, 300 DPI PNG, professional PDF exports
- **Advanced Rendering** - Three.js 3D engine integration for realistic previews
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI Framework** - Clean interface built with Tailwind CSS and custom components

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
4. **Preview Design** - Toggle between 2D template view and realistic 3D mug preview
5. **Export Files** - Download your design and optional cutout template in preferred format

## 📋 Detailed Features

### Mug Specifications
- **Height** - Precise mug height in millimeters
- **Diameter** - Mug circumference calculation from diameter
- **Handle Area** - Customizable handle cutout width
- **Template Generation** - Automatic wrap template with proper cutouts
- **Real-time Updates** - Instant template regeneration when dimensions change

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

### 3D Visualization System
- **Realistic 3D Model** - Professionally rendered mug with accurate proportions
- **Interactive Navigation** - Left-click drag to rotate, right-click drag to pan
- **Zoom Controls** - Mouse wheel scrolling for smooth zoom in/out
- **Material Rendering** - Ceramic-like material with proper shadows and lighting
- **Texture Application** - Live preview of 2D design wrapped onto 3D mug surface
- **Handle Integration** - Accurate C-shaped handle positioned at template seam
- **Multi-part Geometry** - Separate outer wall, inner cavity, bottom, and rim components
- **Real-time Updates** - 3D model updates instantly when design or dimensions change
- **Professional Lighting** - Directional and ambient lighting for realistic appearance

### Artwork Tools
#### Image Artwork
- **File Upload** - Support for common image formats
- **Transformations** - Flip horizontal/vertical, rotate left/right
- **Smart Placement** - Automatic positioning within guide boundaries

#### Text Artwork
- **Font Selection** - Interactive dropdown with Google Fonts integration and live preview
- **Text Formatting** - Bold, Italic, Underline, Strikethrough with toggle buttons
- **Text Contours** - Customizable stroke outlines with independent color control
- **Multi-line Support** - Automatic line spacing and centering for paragraph text
- **Color Control** - Full color picker for text fill and separate contour color
- **Dynamic Sizing** - Automatic scaling to fit available guide box space
- **Font Embedding** - Fonts embedded in exports for consistent cross-platform rendering
- **Real-time Preview** - See font changes applied immediately in both 2D and 3D views

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
- **Styling** - Tailwind CSS with custom components and interactive elements
- **2D Graphics** - SVG manipulation, Canvas API for high-resolution rendering
- **3D Engine** - Three.js r128 for realistic 3D mug visualization and texture mapping
- **Fonts** - Google Fonts with dynamic loading, caching, and embedding system
- **PDF Generation** - jsPDF library for client-side PDF creation with proper layouts
- **Data Storage** - Base64 encoding for project persistence and metadata embedding

### Browser Compatibility
- **Modern Browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **3D Requirements** - WebGL 2.0 support for 3D visualization features
- **Features Used** - File API, Canvas API, WebGL, SVG manipulation, CSS Grid/Flexbox
- **Performance** - Optimized for real-time updates, 3D rendering, and large image handling
- **Fallback Support** - 2D mode available if 3D features are unsupported

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
  "mugDimensions": { 
    "height": number, 
    "diameter": number, 
    "handleAreaWidth": number 
  },
  "background": { 
    "type": "transparent|color|image", 
    "color": "hex-color", 
    "imageData": "base64-data", 
    "imageStyle": "fill|fit|stretch|tile|center",
    "imageSize": "original|xs|s|m|l|xl"
  },
  "faceArt": { 
    "type": "transparent|image|text", 
    "imageData": "base64-data",
    "isFlippedH": boolean,
    "isFlippedV": boolean,
    "rotation": number,
    "text": "string",
    "font": "font-name",
    "color": "hex-color",
    "bold": boolean,
    "italic": boolean,
    "underline": boolean,
    "strikethrough": boolean,
    "contour": boolean,
    "contourColor": "hex-color"
  },
  "backArt": { 
    "type": "transparent|image|text", 
    "imageData": "base64-data",
    "isFlippedH": boolean,
    "isFlippedV": boolean,
    "rotation": number,
    "text": "string",
    "font": "font-name",
    "color": "hex-color",
    "bold": boolean,
    "italic": boolean,
    "underline": boolean,
    "strikethrough": boolean,
    "contour": boolean,
    "contourColor": "hex-color"
  }
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
3. Enter your text and choose a font from the dropdown
4. Apply formatting (bold, colors, text contours)
5. Toggle to 3D view to see realistic preview
6. Export as SVG, PNG, or PDF

### Complex Design with Images and 3D Preview
1. Configure mug specifications and enter project name
2. Upload background image, set to "Fill" style with size "Large"
3. Add front image artwork, apply flip/rotate transformations
4. Add back text with custom font, formatting, and contour effects
5. Use 3D view to inspect design from all angles with interactive controls
6. Export design and cutout files in preferred formats

### Professional Workflow with Project Management
1. Design your mug template with all artwork and formatting
2. Export with "Include project data" enabled to save an editable SVG
3. Share the project file or archive for client review
4. Load the project file back anytime using the "Load" button
5. Make client revisions and re-export updated versions
6. Generate final production files (design + cutout) for printing

## 🤝 Contributing

This is a client-side web application built with vanilla JavaScript. To contribute:

1. Fork the repository
2. Make your changes to the HTML, CSS, or JavaScript files
3. Test thoroughly in multiple browsers
4. Submit a pull request with a clear description

### Development Notes
- No build process required - direct file editing
- Use browser developer tools for debugging and 3D performance analysis
- Follow existing code style and patterns
- Test with various mug dimensions, artwork types, and both 2D/3D modes
- Ensure WebGL compatibility when modifying 3D features
- Test project save/load functionality with different export formats

## 📝 License

This project is open source. See the license file for details.

## 🎯 Future Enhancements

- **Template Library** - Pre-made design templates for common use cases
- **Batch Processing** - Multiple mug designs in one session with batch export
- **Advanced Text Effects** - Gradients, drop shadows, and curved text paths
- **Shape Tools** - Built-in geometric shapes, lines, and vector drawing tools
- **Animation Preview** - 360° rotation animation export for product showcases  
- **Material Variations** - Different mug materials and surface textures in 3D view
- **Measurement Tools** - Rulers and dimension guides for precision placement
- **Cloud Storage** - Online project storage, sharing, and collaboration features
- **Print Integration** - Direct connections to sublimation printing services
- **Mobile Optimization** - Enhanced touch controls for tablet and mobile design

---

**Made with ❤️ for sublimation professionals and hobbyists alike**
