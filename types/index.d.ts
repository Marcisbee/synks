export interface Scope {
  _c: Scope[];
  mounted: boolean;
  next: () => Promise<void>;
  nextProps: (props: VNodeProps) => Promise<void>;
  destroy: () => Promise<void>;

  onMount: () => Promise<void>;
  onDestroy: () => Promise<void>;

  [key: string]: unknown;
}

export type TargetElement = HTMLElement | SVGElement | Text;

interface VNodeHelpers {
  target?: TargetElement;
  instance?: VNode | VNode[];
  scope?: Scope;
}

export type VNodeProps = {
  key?: string;

  [key: string]: unknown;
} | null;

export interface VNode extends VNodeHelpers {
  type: string | Function;
  props: VNodeProps;
  children: VNode[];
  key?: string;
}

export interface NodeContext {
  scope?: Scope;
  [key: string]: unknown;
}
