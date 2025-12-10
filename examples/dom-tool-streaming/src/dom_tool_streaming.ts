import * as webllm from "@mlc-ai/web-llm";

// DOM Command interface
interface DOMCommand {
  type: 'inspect' | 'setStyle' | 'setText' | 'addClass' | 'removeClass' | 'setAttribute' | 'createElement' | 'removeElement';
  selector?: string;
  elementId?: string;
  styles?: Record<string, string>;
  text?: string;
  className?: string;
  attributes?: Record<string, string>;
  tagName?: string;
  parentSelector?: string;
  html?: string;
}

// DOM Tool class - handles all DOM operations
class DOMTool {
  private static instance: DOMTool;
  
  public static getInstance(): DOMTool {
    if (!DOMTool.instance) {
      DOMTool.instance = new DOMTool();
    }
    return DOMTool.instance;
  }

  public inspect(selector: string): any[] {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => {
      const computedStyle = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.substring(0, 100),
        styles: this.getComputedStyles(el),
        attributes: this.getAttributes(el)
      };
    });
  }

  public setStyle(selector: string, styles: Record<string, string>): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      Object.entries(styles).forEach(([prop, value]) => {
        (el as HTMLElement).style.setProperty(prop, value);
      });
    });
  }

  public setText(selector: string, text: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.textContent = text;
    });
  }

  public addClass(selector: string, className: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add(className);
    });
  }

  public removeClass(selector: string, className: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove(className);
    });
  }

  public setAttribute(selector: string, attributes: Record<string, string>): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      Object.entries(attributes).forEach(([attr, value]) => {
        el.setAttribute(attr, value);
      });
    });
  }

  public createElement(tagName: string, parentSelector: string, attributes?: Record<string, string>, html?: string): void {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;
    
    const element = document.createElement(tagName);
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (html) {
      element.innerHTML = html;
    }
    
    parent.appendChild(element);
  }

  public removeElement(selector: string): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.remove();
    });
  }

  private getComputedStyles(el: Element): Record<string, string> {
    const computedStyle = window.getComputedStyle(el);
    const styles: Record<string, string> = {};
    const importantStyles = ['color', 'backgroundColor', 'fontSize', 'padding', 'margin', 'border', 'display'];
    importantStyles.forEach(prop => {
      styles[prop] = computedStyle.getPropertyValue(prop);
    });
    return styles;
  }

  private getAttributes(el: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
}

// Command Scheduler - processes commands in batches per animation frame
class DOMCommandScheduler {
  private commandQueue: DOMCommand[] = [];
  private animationFrameId: number | null = null;
  private isProcessing = false;
  private commandsPerFrame = 3; // Process up to 3 commands per frame
  private stopFlag = false;

  constructor(private domTool: DOMTool, private statusCallback: (status: string) => void) {}

  public addCommand(command: DOMCommand): void {
    this.commandQueue.push(command);
    this.statusCallback(`Queue: ${this.commandQueue.length} commands`);
    if (!this.isProcessing && !this.stopFlag) {
      this.startProcessing();
    }
  }

  public clearQueue(): void {
    this.commandQueue = [];
    this.stopProcessing();
    this.statusCallback('Queue cleared');
  }

  public stop(): void {
    this.stopFlag = true;
    this.clearQueue();
    this.statusCallback('Stopped');
  }

  public start(): void {
    this.stopFlag = false;
    if (this.commandQueue.length > 0) {
      this.startProcessing();
    }
  }

  private startProcessing(): void {
    if (!this.isProcessing && !this.stopFlag) {
      this.isProcessing = true;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.stopFlag || this.commandQueue.length === 0) {
      this.isProcessing = false;
      this.statusCallback('Ready');
      return;
    }

    // Process a batch of commands
    const batch = this.commandQueue.splice(0, this.commandsPerFrame);
    batch.forEach(command => this.executeCommand(command));

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.processQueue());
  }

  private stopProcessing(): void {
    this.isProcessing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private executeCommand(command: DOMCommand): void {
    try {
      switch (command.type) {
        case 'inspect':
          // Inspect commands are handled immediately since they return data
          break;
        case 'setStyle':
          if (command.selector && command.styles) {
            this.domTool.setStyle(command.selector, command.styles);
          }
          break;
        case 'setText':
          if (command.selector && command.text !== undefined) {
            this.domTool.setText(command.selector, command.text);
          }
          break;
        case 'addClass':
          if (command.selector && command.className) {
            this.domTool.addClass(command.selector, command.className);
          }
          break;
        case 'removeClass':
          if (command.selector && command.className) {
            this.domTool.removeClass(command.selector, command.className);
          }
          break;
        case 'setAttribute':
          if (command.selector && command.attributes) {
            Object.entries(command.attributes).forEach(([attr, value]) => {
              this.domTool.setAttribute(command.selector!, { [attr]: value });
            });
          }
          break;
        case 'createElement':
          if (command.tagName && command.parentSelector) {
            this.domTool.createElement(
              command.tagName,
              command.parentSelector,
              command.attributes,
              command.html
            );
          }
          break;
        case 'removeElement':
          if (command.selector) {
            this.domTool.removeElement(command.selector);
          }
          break;
      }
    } catch (error) {
      console.error('Error executing command:', error, command);
    }
  }
}

// Main application class
class DOMToolStreamingApp {
  private engine: webllm.MLCEngineInterface;
  private domTool: DOMTool;
  private scheduler: DOMCommandScheduler;
  private isGenerating = false;
  private currentAbortController: AbortController | null = null;

  constructor() {
    this.domTool = DOMTool.getInstance();
    this.scheduler = new DOMCommandScheduler(this.domTool, (status) => this.updateStatus(status));
    this.engine = new webllm.MLCEngine();
    this.initializeUI();
  }

  private initializeUI(): void {
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const promptInput = document.getElementById('prompt-input') as HTMLInputElement;

    startBtn.onclick = () => this.startGeneration();
    stopBtn.onclick = () => this.stopGeneration();
    clearBtn.onclick = () => this.clearAll();
    
    promptInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.startGeneration();
      }
    });
  }

  public async startGeneration(): Promise<void> {
    if (this.isGenerating) return;

    const promptInput = document.getElementById('prompt-input') as HTMLInputElement;
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
      this.updateStatus('Please enter a prompt');
      return;
    }

    this.isGenerating = true;
    this.currentAbortController = new AbortController();
    this.scheduler.start();
    this.updateStatus('Initializing model...');

    try {
      const initProgressCallback = (report: webllm.InitProgressReport) => {
        this.updateStatus(`Initializing: ${report.text}`);
      };
      
      const selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
      await this.engine.reload(selectedModel, { initProgressCallback });

      const tools: Array<webllm.ChatCompletionTool> = [
        {
          type: 'function',
          function: {
            name: 'dom_tool',
            description: 'Manipulate DOM elements with structured commands',
            parameters: {
              type: 'object',
              description: 'Execute DOM manipulation commands',
              properties: {
                command: {
                  type: 'object',
                  description: 'DOM command to execute',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['inspect', 'setStyle', 'setText', 'addClass', 'removeClass', 'setAttribute', 'createElement', 'removeElement'],
                      description: 'Type of DOM operation'
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector to target elements'
                    },
                    styles: {
                      type: 'object',
                      description: 'CSS styles to apply (for setStyle command)',
                      additionalProperties: { type: 'string' }
                    },
                    text: {
                      type: 'string',
                      description: 'Text content to set (for setText command)'
                    },
                    className: {
                      type: 'string',
                      description: 'CSS class name to add/remove'
                    },
                    attributes: {
                      type: 'object',
                      description: 'HTML attributes to set',
                      additionalProperties: { type: 'string' }
                    },
                    tagName: {
                      type: 'string',
                      description: 'HTML tag name for new elements'
                    },
                    parentSelector: {
                      type: 'string',
                      description: 'Parent selector for creating new elements'
                    },
                    html: {
                      type: 'string',
                      description: 'HTML content for new elements'
                    }
                  },
                  required: ['type']
                }
              },
              required: ['command']
            }
          }
        }
      ];

      const request: webllm.ChatCompletionRequest = {
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          {
            role: 'user',
            content: `You are a DOM manipulation assistant. The page contains:
- A div with class "target-element" and ids "box1", "box2", "box3"
- A paragraph with id "text1"
- A span with id "span1"

Available commands:
- inspect: Get information about elements
- setStyle: Apply CSS styles
- setText: Change text content
- addClass/removeClass: Modify CSS classes
- setAttribute: Set HTML attributes
- createElement: Add new elements
- removeElement: Delete elements

User request: ${prompt}

Respond with a stream of JSON objects, each representing a DOM command to execute.`
          }
        ],
        tools: tools,
        tool_choice: "auto"
      };

      let buffer = "";
      const completion = await this.engine.chat.completions.create(request);

      for await (const chunk of completion) {
        if (this.currentAbortController?.signal.aborted) {
          break;
        }

        const content = chunk.choices[0]?.delta?.content || "";
        buffer += content;

        // Process buffered content for potential JSON commands
        this.processBufferedCommands(buffer);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.updateStatus('Generation stopped');
      } else {
        this.updateStatus(`Error: ${error.message}`);
        console.error(error);
      }
    } finally {
      this.isGenerating = false;
      this.currentAbortController = null;
    }
  }

  private processBufferedCommands(buffer: string): void {
    // Try to extract and parse JSON objects from the buffer
    const lines = buffer.split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const jsonMatch = line.match(/({.*})/);
          if (jsonMatch) {
            const command = JSON.parse(jsonMatch[1]);
            if (command.command) {
              this.scheduler.addCommand(command.command);
              this.logCommand(command.command);
            }
          }
        } catch (e) {
          // Ignore parsing errors, might be incomplete JSON
        }
      }
    }
  }

  private stopGeneration(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.scheduler.stop();
  }

  private clearAll(): void {
    this.scheduler.clearQueue();
    this.clearLog();
    
    // Reset DOM to initial state
    const playground = document.getElementById('playground');
    if (playground) {
      playground.innerHTML = `
        <div class="target-element" id="box1" data-id="box1">Box 1 - Target Element</div>
        <div class="target-element" id="box2" data-id="box2">Box 2 - Target Element</div>
        <div class="target-element" id="box3" data-id="box3">Box 3 - Target Element</div>
        <p id="text1" style="margin: 10px;">This is a paragraph that can be modified.</p>
        <span id="span1" style="background: #e0e0e0; padding: 5px;">Span Element</span>
      `;
    }
    
    this.updateStatus('Ready');
  }

  private updateStatus(status: string): void {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = `Status: ${status}`;
    }
  }

  private logCommand(command: DOMCommand): void {
    const logEl = document.getElementById('output-log');
    if (logEl) {
      const timestamp = new Date().toLocaleTimeString();
      logEl.innerHTML += `<div>[${timestamp}] ${command.type}: ${command.selector || ''}</div>`;
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  private clearLog(): void {
    const logEl = document.getElementById('output-log');
    if (logEl) {
      logEl.innerHTML = 'Output log will appear here...';
    }
  }
}

// Initialize the application
new DOMToolStreamingApp();
