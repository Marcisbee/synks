export function setProps(element, props) {
  if (!props || element instanceof Text) {
    return;
  }

  Object.keys(props).forEach(name => {
    const value = props[name];

    if (typeof value === "function") {
      element.setAttribute(name, value);
      element[name.toLowerCase()] = value;
      return;
    }

    if (value !== false) {
      element.setAttribute(name, value);
    }
  });
}
