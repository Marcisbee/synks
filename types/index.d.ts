interface Scope {
  name: string;
  _c: Scope[];
  mounted: boolean;
  rendering: boolean;
  next: () => Promise<void>;
  nextProps: (props: null | Record<string, any>) => Promise<void>;
  destroy: () => Promise<void>;

  [key: string]: any;
}

type TargetElement = HTMLElement | SVGElement | Text;

interface VNodeHelpers {
  target?: TargetElement;
  instance?: VNode | VNode[];
  scope?: Scope;
}

interface VNode extends VNodeHelpers {
  type: string | Function;
  props: null | Record<string, any>;
  children: VNode[];
  key?: string;
}

interface Context {
  [key: string]: any;
}
