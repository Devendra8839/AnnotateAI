/**
 * AnnotateAI Core SDK
 * Universal client-side engine for visual annotations.
 */

export interface SourceContext {
  file?: string;
  component?: string;
  line?: string;
  framework?: string;
}

export interface ElementContext {
  tagName: string;
  text: string;
  selector: string;
  source: SourceContext;
  url: string;
  timestamp: string;
}

export interface Annotation {
  id: string;
  elementContext: ElementContext;
  instruction: string;
  priority?: 'low' | 'medium' | 'high';
}

export class AnnotateAI {
  private active = false;
  private annotations: Annotation[] = [];
  private hoverElement: HTMLElement | null = null;
  private selectedElement: HTMLElement | null = null;
  private overlay: HTMLDivElement | null = null;

  constructor() {
    console.log('[AnnotateAI] SDK Initialized');
    this.checkActivation();
  }

  private checkActivation() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('annotate') === 'true' || params.get('annotate_ai') === 'true') {
      console.log('[AnnotateAI] Activation param detected');
      // Use a small timeout to ensure DOM is ready if injected dynamically
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.activate());
      } else {
        this.activate();
      }
    }
  }

  public activate() {
    if (this.active) return;
    this.active = true;
    console.log('[AnnotateAI] SDK Activated');
    this.setupOverlay();
    this.bindEvents();
    this.updateUI();
  }

  private setupOverlay() {
    if (document.getElementById('annotate-ai-overlay')) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'annotate-ai-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '2147483647', // Max z-index
    });

    this.overlay.innerHTML = `
      <style>
        #annotate-ai-highlight {
          position: absolute;
          border: 2px solid #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          display: none;
          transition: all 0.1s ease;
          pointer-events: none;
          box-sizing: border-box;
          border-radius: 4px;
        }
        #annotate-ai-toolbar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 200px;
        }
        .annotate-ai-btn {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
        }
        .annotate-ai-btn:hover {
          background: #2563eb;
        }
        .annotate-ai-btn.secondary {
          background: #10b981;
        }
        .annotate-ai-btn.secondary:hover {
          background: #059669;
        }
      </style>
      <div id="annotate-ai-highlight"></div>
      <div id="annotate-ai-toolbar">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 800; color: #1e40af;">AnnotateAI</span>
          <span id="annotate-count" style="font-size: 12px; color: #64748b;">0 annotations</span>
        </div>
        <button id="annotate-export-md" class="annotate-ai-btn secondary">Copy AI Prompt</button>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Click an element to annotate.</div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    const exportBtn = this.overlay.querySelector('#annotate-export-md');
    exportBtn?.addEventListener('click', () => this.exportMarkdown());
  }

  private bindEvents() {
    // Mouse move for highlighting
    window.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    
    // Click for selection - use capture to intercept
    window.addEventListener('click', this.handleClick.bind(this), true);
    
    // Resize/Scroll to update highlight
    window.addEventListener('scroll', () => this.updateHighlight(), { passive: true });
    window.addEventListener('resize', () => this.updateHighlight(), { passive: true });
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.active) return;
    
    // Find the element at point, excluding our overlay
    const x = e.clientX;
    const y = e.clientY;
    
    // Temporarily disable overlay pointer events to find what's under it
    // Though overlay is already pointer-events: none, its children (toolbar) are auto.
    const target = document.elementFromPoint(x, y) as HTMLElement;
    
    if (!target || target === this.hoverElement || target.closest('#annotate-ai-overlay')) {
      return;
    }

    this.hoverElement = target;
    this.updateHighlight(target);
  }

  private updateHighlight(el: HTMLElement | null = this.hoverElement) {
    if (!el) return;
    const highlight = document.getElementById('annotate-ai-highlight');
    if (!highlight) return;

    const rect = el.getBoundingClientRect();
    
    // Don't highlight empty or invisible elements
    if (rect.width === 0 || rect.height === 0) {
      highlight.style.display = 'none';
      return;
    }

    Object.assign(highlight.style, {
      display: 'block',
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  private handleClick(e: MouseEvent) {
    if (!this.active) return;
    const target = e.target as HTMLElement;
    
    // Ignore clicks on our own UI
    if (target.closest('#annotate-ai-overlay')) return;

    console.log('[AnnotateAI] Element selected:', target);
    
    e.preventDefault();
    e.stopPropagation();

    this.selectedElement = target;
    this.promptAnnotation(target);
  }

  private promptAnnotation(el: HTMLElement) {
    // Show highlight on the selected element specifically
    this.updateHighlight(el);
    
    const instruction = window.prompt(`Requested change for <${el.tagName.toLowerCase()}>:`, "");
    if (instruction) {
      const context = this.getElementContext(el);
      this.annotations.push({
        id: Math.random().toString(36).substr(2, 9),
        elementContext: context,
        instruction
      });
      console.log('[AnnotateAI] Annotation added:', instruction);
      this.updateUI();
    }
  }

  private getElementContext(el: HTMLElement): ElementContext {
    return {
      tagName: el.tagName,
      text: el.innerText ? el.innerText.substring(0, 100) : '',
      selector: this.getSelector(el),
      source: this.getSourceMetadata(el),
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(/\s+/).filter(Boolean).join('.');
      if (classes) selector += `.${classes}`;
    }
    return selector;
  }

  private getSourceMetadata(el: HTMLElement): SourceContext {
    let current: HTMLElement | null = el;
    const context: SourceContext = {};

    while (current && current !== document.body) {
      if (current.dataset && current.dataset.annotateFile) {
        context.file = current.dataset.annotateFile;
        context.component = current.dataset.annotateComponent;
        context.line = current.dataset.annotateLine;
        context.framework = current.dataset.annotateFramework || 'unknown';
        break;
      }
      current = current.parentElement;
    }

    return context;
  }

  private updateUI() {
    const countEl = document.getElementById('annotate-count');
    if (countEl) countEl.innerText = `${this.annotations.length} annotation(s)`;
  }

  private exportMarkdown() {
    if (this.annotations.length === 0) {
      alert('Click on elements to add annotations first!');
      return;
    }

    let md = `# AnnotateAI Prompt\n\n`;
    md += `**URL:** ${window.location.href}\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n\n`;
    md += `--- \n\n`;

    this.annotations.forEach((ann, i) => {
      md += `### Annotation #${i + 1}\n\n`;
      md += `**Element:** \`${ann.elementContext.tagName.toLowerCase()}\`\n`;
      md += `**Selector:** \`${ann.elementContext.selector}\`\n`;
      if (ann.elementContext.text.trim()) {
        md += `**Current Text:** "${ann.elementContext.text.trim()}"\n`;
      }
      
      if (ann.elementContext.source.file) {
        md += `**Source File:** \`${ann.elementContext.source.file}\`\n`;
        if (ann.elementContext.source.component) {
          md += `**Component:** \`${ann.elementContext.source.component}\`\n`;
        }
      } else {
        md += `**Source:** *No framework metadata found (using DOM fallback)*\n`;
      }

      md += `\n**Requested Change:**\n> ${ann.instruction}\n\n`;
      md += `--- \n\n`;
    });

    md += `\n*Generated by AnnotateAI*\n`;

    navigator.clipboard.writeText(md).then(() => {
      console.log('[AnnotateAI] Prompt copied to clipboard');
      alert('AI Prompt copied to clipboard! Paste it into your AI agent.');
    }).catch(err => {
      console.error('[AnnotateAI] Clipboard copy failed:', err);
      alert('Failed to copy to clipboard. Check console.');
    });
  }
}

// Auto-init
if (typeof window !== 'undefined') {
  const init = () => {
    if (!(window as any).AnnotateAI) {
      (window as any).AnnotateAI = new AnnotateAI();
    }
  };
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    window.addEventListener('load', init);
  }
}
