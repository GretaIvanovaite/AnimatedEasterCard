# Animated Easter Card Creator

This application is a university project developed for the CIS3413 Advanced Web Portfolio module at Edge Hill University. It is a technical prototype designed to demonstrate client-side data handling and complex CSS animations, rather than a commercial live service.

The tool provides a multi-step "Wizard" for small businesses to personalise and send animated Easter cards to customer lists.

## Key Features
*   Dynamic Theme Engine: Users can choose between two distinct animation styles (Easter Bunny or Spring Garden).
*   Live Personalisation: Real-time text preview with support for custom phrases and dynamic placeholders.
*   Interactive Reordering: A custom UI allows users to reorder message elements (phrase, body, company name) before sending.
*   Robust Data Parsing: Client-side parsing for CSV, JSON, and Excel files using regex to handle complex data like quoted values.
*   Bulk Sending: Integration with the EmailJS API to automate the delivery of personalised links.
*   Accessibility: Audited for WCAG 2.1 AAA contrast and full keyboard/screen-reader compatibility.

## Tech Stack
*   Frontend: Vanilla JavaScript (ES6+), HTML5, CSS3.
*   APIs: EmailJS API for email dispatch.
*   Libraries: SheetJS for Excel file processing.
*   Architecture: Modular CSS and a "stateless" URL-parameter based rendering system.

## How to Run
Open index.html in a modern web browser. As this is a client-side prototype, no server installation is required.
