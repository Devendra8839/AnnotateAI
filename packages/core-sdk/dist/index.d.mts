/**
 * AnnotateAI Core SDK
 * Universal client-side engine for visual annotations.
 */
interface SourceContext {
    file?: string;
    component?: string;
    line?: string;
    framework?: string;
}
interface ElementContext {
    tagName: string;
    text: string;
    selector: string;
    source: SourceContext;
    url: string;
    timestamp: string;
}
interface Annotation {
    id: string;
    elementContext: ElementContext;
    instruction: string;
    priority?: 'low' | 'medium' | 'high';
}
declare class AnnotateAI {
    private active;
    private annotations;
    private hoverElement;
    private selectedElement;
    private overlay;
    constructor();
    private checkActivation;
    activate(): void;
    private setupOverlay;
    private bindEvents;
    private handleMouseMove;
    private updateHighlight;
    private handleClick;
    private promptAnnotation;
    private getElementContext;
    private getSelector;
    private getSourceMetadata;
    private updateUI;
    private exportMarkdown;
}

export { AnnotateAI, type Annotation, type ElementContext, type SourceContext };
