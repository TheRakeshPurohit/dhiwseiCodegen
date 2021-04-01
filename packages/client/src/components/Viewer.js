// Find the react fiber node data
const FindReact = (dom, traverseUp = 0) => {
  // console.log('calling FindReact...', Object.keys(dom));
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

/*
  Event Listeners
*/
function MouseOver(e) {
  // Outline element
  if (this.tagName !== "BODY") {
    this.style.outline = "1px dashed #f00";

    // log current hover component
    // console.log("current hover component: ", this);

    // logging component fiber data
    console.log("element fiber data: ", FindReact(this));
  }
  e.stopPropagation();
}

function MouseOut(e) {
  // Remove red outline
  this.style.outline = "";
  e.stopPropagation();
}

// Add event listeners for all elements in the current document
function AddEventListeners() {
  var document = GetCurrentDocument();
  var rootElement = document.getElementById("root");
  var elements = GetAllElements(rootElement);

  for (var i = 0; i < elements.length; i++) {
    if (elements[i].tagName !== "BODY" && elements[i].tagName !== "SCRIPT") {
      elements[i].addEventListener("mouseover", MouseOver, false);
      elements[i].addEventListener("mouseout", MouseOut, false);
    }
  }
}

// add hover listner to all elements
export { AddEventListeners };
