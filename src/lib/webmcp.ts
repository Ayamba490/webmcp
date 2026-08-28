/**
 * WebMCP Specification Polyfill and Host Implementation
 * Complies with the official WebMCP standard:
 * document.modelContext.registerTool({ name, description, inputSchema, execute })
 */

import { WebMCPTool, ToolInvocationLog } from "../types";

declare global {
  interface Document {
    modelContext?: WebMCPHost;
  }
  interface Navigator {
    modelContext?: WebMCPHost;
  }
  interface Window {
    __WEBMCP_INITIALIZED__?: boolean;
    __WEBMCP_TOOLS__?: Record<string, WebMCPTool>;
    __WEBMCP_LOGS__?: ToolInvocationLog[];
  }
}

export class WebMCPHost {
  private tools: Map<string, WebMCPTool> = new Map();
  private logs: ToolInvocationLog[] = [];
  private listeners: ((tools: WebMCPTool[]) => void)[] = [];
  private logListeners: ((log: ToolInvocationLog) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      window.__WEBMCP_TOOLS__ = window.__WEBMCP_TOOLS__ || {};
      window.__WEBMCP_LOGS__ = window.__WEBMCP_LOGS__ || [];
    }
  }

  /**
   * Register a new tool onto document.modelContext
   * Required by the WebMCP standard
   */
  public registerTool(tool: WebMCPTool): void {
    if (!tool.name) {
      throw new Error("WebMCP: Tool must possess a valid 'name' property.");
    }
    if (!tool.description) {
      throw new Error("WebMCP: Tool must possess a valid 'description' property.");
    }
    if (!tool.inputSchema || typeof tool.inputSchema !== "object") {
      throw new Error("WebMCP: Tool must possess a valid JSON Schema 'inputSchema'.");
    }
    if (typeof tool.execute !== "function") {
      throw new Error("WebMCP: Tool must provide an executable 'execute' async handler.");
    }

    this.tools.set(tool.name, tool);
    if (typeof window !== "undefined") {
      window.__WEBMCP_TOOLS__![tool.name] = tool;

      // Dispatch spec event
      window.dispatchEvent(
        new CustomEvent("modelcontext:toolregistered", {
          detail: { toolName: tool.name, schema: tool.inputSchema },
        })
      );
    }

    this.notifyListeners();
  }

  /**
   * Unregister an existing tool
   */
  public unregisterTool(toolName: string): void {
    this.tools.delete(toolName);
    if (typeof window !== "undefined" && window.__WEBMCP_TOOLS__) {
      delete window.__WEBMCP_TOOLS__[toolName];
    }
    this.notifyListeners();
  }

  /**
   * Return array of all active tools exposed to agents
   */
  public getRegisteredTools(): WebMCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   */
  public getTool(toolName: string): WebMCPTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Programmatically invoke a WebMCP tool with schema validation and telemetry logging
   */
  public async invokeTool(
    toolName: string,
    input: any,
    invoker: "agent" | "human_inspector" | "external_webmcp" = "agent"
  ): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      const errLog: ToolInvocationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName,
        input,
        output: { error: `Tool '${toolName}' not found in document.modelContext` },
        durationMs: 0,
        status: "error",
        invoker,
      };
      this.addLog(errLog);
      throw new Error(`WebMCP: Tool '${toolName}' is not registered on document.modelContext.`);
    }

    const startTime = performance.now();

    // Dispatch invocation start event
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("modelcontext:toolcalled", {
          detail: { toolName, input, invoker },
        })
      );
    }

    try {
      const result = await Promise.resolve(tool.execute(input));
      const durationMs = Math.round(performance.now() - startTime);

      const successLog: ToolInvocationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName,
        input,
        output: result,
        durationMs,
        status: "success",
        invoker,
      };

      this.addLog(successLog);

      // Dispatch invocation completion event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("modelcontext:toolcompleted", {
            detail: { toolName, input, output: result, durationMs },
          })
        );
      }

      return result;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorLog: ToolInvocationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString(),
        toolName,
        input,
        output: { error: err.message || String(err) },
        durationMs,
        status: "error",
        invoker,
      };

      this.addLog(errorLog);
      throw err;
    }
  }

  public subscribeTools(cb: (tools: WebMCPTool[]) => void): () => void {
    this.listeners.push(cb);
    cb(this.getRegisteredTools());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public subscribeLogs(cb: (log: ToolInvocationLog) => void): () => void {
    this.logListeners.push(cb);
    return () => {
      this.logListeners = this.logListeners.filter((l) => l !== cb);
    };
  }

  public getLogs(): ToolInvocationLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    if (typeof window !== "undefined") {
      window.__WEBMCP_LOGS__ = [];
    }
  }

  private addLog(log: ToolInvocationLog): void {
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop();
    if (typeof window !== "undefined") {
      window.__WEBMCP_LOGS__ = this.logs;
    }
    this.logListeners.forEach((cb) => cb(log));
  }

  private notifyListeners(): void {
    const list = this.getRegisteredTools();
    this.listeners.forEach((cb) => cb(list));
  }
}

// Global Singleton for WebMCP
export const webMCPHost = new WebMCPHost();

/**
 * Initialize WebMCP polyfill on browser window
 */
export function initWebMCP(): WebMCPHost {
  if (typeof window === "undefined") return webMCPHost;

  if (!document.modelContext) {
    document.modelContext = webMCPHost;
  }
  if (!navigator.modelContext) {
    navigator.modelContext = webMCPHost;
  }

  window.__WEBMCP_INITIALIZED__ = true;
  return webMCPHost;
}

/**
 * Helper to trigger UI visual spotlight from agent
 */
export function triggerSpotlight(elementId: string, durationMs: number = 3000): void {
  if (typeof window === "undefined") return;
  const el = document.getElementById(elementId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-4", "ring-emerald-500", "ring-offset-2", "transition-all", "duration-500");
    setTimeout(() => {
      el.classList.remove("ring-4", "ring-emerald-500", "ring-offset-2");
    }, durationMs);
  }
}
