export interface Scope {
  _c: Scope[];
  mounted: boolean;
  rendering: boolean;
  next: () => Promise<void>;
  nextProps: (props: null | Record<string, any>) => Promise<void>;
  destroy: () => Promise<void>;

  [key: string]: any;
}

export type TargetElement = HTMLElement | SVGElement | Text;

interface VNodeHelpers {
  target?: TargetElement;
  instance?: VNode | VNode[];
  scope?: Scope;
}

export interface VNode extends VNodeHelpers {
  type: string | Function;
  props: null | Record<string, any>;
  children: VNode[];
  key?: string;
}

export interface NodeContext {
  [key: string]: any;
}
