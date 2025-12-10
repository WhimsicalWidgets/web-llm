# DOM Tool Streaming Demo

This example demonstrates how an LLM can manipulate DOM elements using structured JSON commands with streaming and animation frame scheduling.

## Features

- **DOM Tool**: Single tool interface for DOM inspection and manipulation
- **Structured Commands**: JSON-based commands for DOM operations
- **Streaming**: Processes model output as a stream of commands
- **Animation Frame Scheduling**: Applies changes gradually per frame for responsive UI
- **Command Queue**: Buffers and executes commands in batches
- **Stop Control**: Ability to stop execution and clear queued commands

## Available DOM Commands

- `inspect`: Get information about DOM elements
- `setStyle`: Apply CSS styles to elements
- `setText`: Change text content
- `addClass`/`removeClass`: Modify CSS classes
- `setAttribute`: Set HTML attributes
- `createElement`: Add new elements
- `removeElement`: Delete elements

## Usage

### Option 1: Development Mode

1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Open http://localhost:8888 in a WebGPU-enabled browser
4. Enter a prompt describing the DOM changes you want
5. Click "Start" to begin generation
6. Watch as the LLM streams DOM commands that are applied gradually
7. Use "Stop" to halt execution or "Clear" to reset the page

### Option 2: Production Build

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start simple server: `./start-server.sh` (or serve `lib/` directory with any HTTP server)
4. Open http://localhost:8080 in a WebGPU-enabled browser
5. Follow steps 4-7 from above

### Option 3: Direct File Access

1. Open `src/index.html` directly in a WebGPU-enabled browser (may have CORS issues with WebLLM)

## Example Prompts

- "Make the first box blue and add text 'Hello World'"
- "Highlight all target elements with yellow background"
- "Add a new paragraph with the text 'Dynamic content'"
- "Remove the span element and make all boxes green"

## Architecture

The implementation consists of:

1. **DOMTool**: Core DOM manipulation class
2. **DOMCommandScheduler**: Animation frame-based command processor
3. **DOMToolStreamingApp**: Main application handling LLM interaction
4. **Command Queue**: In-memory buffer for streaming commands

The scheduler processes up to 3 commands per animation frame, ensuring the UI remains responsive while changes appear gradually.
