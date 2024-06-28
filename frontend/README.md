# Canvas Archiver - Frontend

## Overview

The frontend of the Canvas Archiver is a React application that allows users to interact with the `Canvas Archiver Backend`. The frontend is responsible for fetching course changes, and providing a overview of said course changes. It also provides the ability to restore courses to a previous state.

## Installation

To install the frontend, you will need to have Node.js installed on your machine. You can download Node.js from [here](https://nodejs.org/en/download/). After installing Node.js, you can install the frontend by running the following commands:

```bash
cd frontend
npm install

# To start the frontend run one of the following commands.

# Start the frontend in development mode with HTTP.
npm run dev

# Start the frontend in development mode with HTTPS.
# This mode requires a self-signed certificate to be present in the frontend directory.
npm run secure

# Build the frontend and starts it in production mode.
npm run build && npm run preview

# Start the frontend in mock mode. With this mode no backend is required.
npm run mock
```

## Environment Variables

The frontend requires one environment variable to be set:

-   VITE_BACKEND_URL: The URL of the backend server.

## Testing

To run the tests for the frontend, you can run the following command:

```bash
# Run all tests in the console.
npm run test:console

# Run all tests in the browser.
npm run test:ui
```
