# Project Overview

This project is a web-based tool for generating SVG templates for mug wraps. It allows users to define mug dimensions, add background colors or images, and include artwork on the face and back of the mug. The application then generates a downloadable SVG or PNG file of the design.

## Technologies

*   **Frontend:** HTML, CSS, JavaScript
*   **Styling:** Tailwind CSS
*   **Fonts:** Google Fonts

## Architecture

The application is a single-page web application. The user interface is defined in `index.html`, with styling in `css/style.css` and the core logic in `js/script.js`. The JavaScript code handles user input, generates the SVG template dynamically, and provides functionality for downloading the final design.

# Building and Running

This is a static web project. To run the application, simply open the `index.html` file in a web browser.

# Development Conventions

*   The project uses Tailwind CSS for styling, with custom styles defined in `css/style.css`.
*   JavaScript code is organized into functions for specific tasks, such as handling image uploads, generating the SVG template, and triggering downloads.
*   The code uses modern JavaScript features, including `async`/`await` for handling asynchronous operations.
