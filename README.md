# Lake Tapps Permit Workflow Application

A guided workflow application to help Lake Tapps property owners navigate the permit process for improvements on Lake Tapps Reservoir.

## Features

- **Guided Workflow**: Step-by-step guidance through every permit requirement
- **Document Generation**: Automatically generate properly formatted application documents
- **Local Storage**: All data stays on your computer - nothing is uploaded to servers
- **Auto-Save**: Progress is saved automatically so you can return at any time

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NuclearEng/LakeTappsImprovements.git
   cd LakeTappsImprovements
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Desktop Application

To run as a desktop application with Electron:

```bash
npm run electron:dev
```

To build the desktop application:

```bash
npm run electron:build
```

## Testing

Run end-to-end tests with Playwright:

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed
```

## Project Structure

```
├── electron/           # Electron main process
├── src/
│   ├── app/           # Next.js pages and layout
│   ├── components/    # React components
│   │   ├── layout/    # Layout components
│   │   ├── ui/        # UI components
│   │   ├── workflow/  # Workflow stage components
│   │   └── forms/     # Form components
│   ├── lib/           # Utility functions
│   ├── store/         # Zustand state management
│   └── types/         # TypeScript type definitions
├── tests/             # Playwright tests
├── public/            # Static assets
└── docs/              # Documentation
```

## License

MIT
