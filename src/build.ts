import { TargetElement, VNode, VNodeProps } from '../types';

function getChildNodes(node: Node): ChildNode[] {
  return Array.prototype.slice.call(node.childNodes);
}

export async function build(
  currentNode: VNode,
  previousNode: VNode = {} as VNode,
  container: Node,
): Promise<TargetElement> {
  if (currentNode.target) {
    return currentNode.target;
  }

  const underSameParent = container
    ? !!getChildNodes(container)
      .find((child) => child === previousNode.target)
    : false;

  // Text node
  if (currentNode.type === '') {
    const p = currentNode.props;
    if (p === undefined || p === null || typeof p === 'boolean') {
      currentNode.props = '' as unknown as VNodeProps;
    }

    // Patch text node
    if (underSameParent && previousNode && previousNode.type === '' && previousNode.target) {
      // Patch node content
      if (currentNode.props !== previousNode.props) {
        previousNode.target.nodeValue = String(currentNode.props);
      }

      return previousNode.target;
    }

    // New text node
    return new Text(String(currentNode.props));
  }

  if (!underSameParent) {
    previousNode.props = {};
    previousNode.key = null;
  }

  // Patch node
  if (underSameParent && previousNode && previousNode.target && currentNode.type === previousNode.type) {
    return previousNode.target;
  }

  const type = String(currentNode.type);

  if (currentNode.type === 'svg' || container instanceof SVGElement) {
    return document.createElementNS(
      'http://www.w3.org/2000/svg',
      type
    );
  }

  // New node
  return document.createElement(String(type));
}
