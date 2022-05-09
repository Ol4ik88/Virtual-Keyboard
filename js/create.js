export default function create(elem, classNames, childElement, parentElement, ...attributes) {
  let element = null;
  element = document.createElement(elem);

  if (classNames) {
    element.classList.add(...classNames.split(' '));
  }

  if (childElement && Array.isArray(childElement)) {
    childElement.forEach((child) => child && element.appendChild(child));
  } else if (childElement && typeof childElement === 'object') {
    element.appendChild(childElement);
  } else if (childElement && typeof childElement === 'string') {
    element.innerHTML = childElement;
  }

  if (parentElement) {
    parentElement.appendChild(element);
  }

  if (attributes.length) {
    attributes.forEach(([name, value]) => {
      if (value === '') {
        element.setAttribute(name, '');
      }
      if (name.match(/id|value|cols|rows|placeholder|spellcheck|autocorrect/)) {
        element.setAttribute(name, value);
      } else {
        element.dataset[name] = value;
      }
    });
  }
  return element;
}
