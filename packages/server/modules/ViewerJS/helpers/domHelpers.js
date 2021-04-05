// Find the react fiber node data
const FindReact = (dom, traverseUp = 0) => {
  const key = Object.keys(dom).find((key) => key.startsWith("__reactFiber$"));
  // console.log('key', key);
  const domFiber = dom[key];
  // console.log('domFiber: ', domFiber);
  if (domFiber == null) return null;

  // react <16
  if (domFiber._currentElement) {
    let compFiber = domFiber._currentElement._owner;
    for (let i = 0; i < traverseUp; i++) {
      compFiber = compFiber._currentElement._owner;
    }
    return compFiber._instance;
  }

  // react 16+
  const GetCompFiber = (fiber) => {
    //return fiber._debugOwner; // this also works, but is __DEV__ only
    let parentFiber = fiber.return;
    while (typeof parentFiber.type === "string") {
      parentFiber = parentFiber.return;
    }
    return parentFiber;
  };
  let compFiber = GetCompFiber(domFiber);
  for (let i = 0; i < traverseUp; i++) {
    compFiber = GetCompFiber(compFiber);
  }
  return compFiber;
};

// Return current document
function GetCurrentDocument() {
  return window.document;
}

// Get all elements within the given element
function GetAllElements(element) {
  var elements = [];

  if (element && element.hasChildNodes()) {
    elements.push(element);

    var childs = element.childNodes;

    for (var i = 0; i < childs.length; i++) {
      if (childs[i].hasChildNodes()) {
        elements = elements.concat(GetAllElements(childs[i]));
      } else if (childs[i].nodeType === 1) {
        elements.push(childs[i]);
      }
    }
  }
  return elements;
}

// Get all input tags in current page
function GetAllInputTags(rootId) {
  let inputTags = [];

  let document = GetCurrentDocument();
  let rootElement = document.getElementById(rootId);
  let elements = GetAllElements(rootElement);

  // loop through and get input tags
  elements.forEach((element) => {
    if (element.tagName === "INPUT") {
      inputTags.push(element);
    }
  });

  return inputTags;
}

export { GetCurrentDocument, GetAllElements, GetAllInputTags, FindReact };
