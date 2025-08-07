# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mug Painter is a web-based tool for generating SVG templates for mug wraps. It's a static single-page application that allows users to design custom sublimation templates by defining mug dimensions, adding backgrounds, and placing artwork on both faces of the mug.

## Architecture

This is a vanilla JavaScript single-page application with no build process:

- **index.html**: Main UI with Tailwind CSS styling and comprehensive form controls
- **js/script.js**: Core application logic handling SVG generation, image processing, and downloads
- **css/style.css**: Custom CSS styles complementing Tailwind classes

### Key Components

- **Template Generation**: Dynamic SVG creation based on mug dimensions (height, diameter, handle width)
- **Image Handling**: File uploads with transformation controls (flip, rotate) for face/back artwork
- **Background System**: Support for transparent, solid color, or image backgrounds with various scaling options
- **Font Loading**: Dynamic Google Fonts integration with @font-face embedding for SVG export
- **Export System**: Downloads in SVG or PNG format with optional cutout masks for sublimation

## Running the Application

Since this is a static web project with no dependencies or build process:
- Open `index.html` directly in a web browser
- All external dependencies are loaded via CDN (Tailwind CSS, Google Fonts)

## Development

### Core Functions (js/script.js)
- `generateTemplate()`: Main function that orchestrates SVG generation based on all inputs
- `createArtElement()`: Handles artwork placement (images or text) with proper scaling and transformations
- `loadAndEmbedFonts()`: Manages dynamic font loading and embedding for text elements
- `handleImageUpload()`: Processes file uploads and converts to data URLs
- `updateControlsVisibility()`: Shows/hides UI controls based on selected options

### SVG Generation Logic
The application calculates mug circumference from diameter and creates a template with:
- Cutout areas for handle placement
- Guide boxes showing safe artwork zones
- Proper coordinate system for face/back artwork positioning
- Background patterns or fills based on user selection

### Image Processing
Images are processed client-side using:
- FileReader API for uploads
- Canvas API for PNG export and cutout mask generation  
- CSS transforms for flip/rotate operations
- Data URLs for embedding in SVG

No server-side processing or external APIs are required beyond CDN resources.