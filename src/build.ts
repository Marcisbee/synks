import { VNode, TargetElement } from '../types';

export async function build(
  currentNode: VNode,
  previousNode: VNode,
  container: Node,
): Promise<TargetElement> {
  const underSameParent = !!Array.prototype.slice.call(container.childNodes).find(t => t === previousNode.target);

  if (!underSameParent) {
    previousNode.props = {};
    previousNode.key = null;
  }

  if (currentNode.target) {
    return currentNode.target;
  }

  // Text node
  if (currentNode.type === '') {
    const p = currentNode.props;
    if (p === undefined || p === null || typeof p === 'boolean') {
      currentNode.props = '' as any;
    }

    // Patch text node
    if (underSameParent && previousNode && previousNode.type === '' && previousNode.target
      && previousNode.target.parentNode === container) {
      // Patch node content
      if (currentNode.props !== previousNode.props) {
        previousNode.target.nodeValue = String(currentNode.props);
      }

      return previousNode.target;
    }

    // New text node
    return new Text(String(currentNode.props));
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
