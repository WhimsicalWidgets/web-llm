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

1. Open `src/index.html` in a WebGPU-enabled browser
2. Enter a prompt describing the DOM changes you want
3. Click "Start" to begin generation
4. Watch as the LLM streams DOM commands that are applied gradually
5. Use "Stop" to halt execution or "Clear" to reset the page

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