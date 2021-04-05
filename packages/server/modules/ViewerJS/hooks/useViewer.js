import * as domHelper from "../helpers/domHelpers";
import * as React from "react";
const rootId = "root";

/**
 * Custom hook to store all ViewerJS realated
 * data.
 *
 */
export function useViewer() {

  // This needs to swapped with a React.Context Store
  const [data, setData] = React.useState({
    showSidebar: false
  });

  /*
   * Event Listeners
   */

  /**
   * Shows border
   */
  function MouseOver(e) {
    // Outline element
    if (this.tagName !== "BODY") {
      this.style.outline = "1px dashed #f00";

      // log current hover component
      // console.log("current hover component: ", this);

      // logging component fiber data
      // console.log("element fiber data: ", domHelper.FindReact(this));
    }
    e.stopPropagation();
  }

  /**
   * Removes border
   */
  function MouseOut(e) {
    // Remove red outline
    this.style.outline = "";
    e.stopPropagation();
  }

  /**
   * Show modal with all input tags
   */
  function MouseClick() {
    /**
     * Check for button click
     * TODO - need to have a separate button handler function
     */
    if (this.tagName === "BUTTON") {
      console.log("tagName: ", this.tagName);
      console.log("fiber: ", domHelper.FindReact(this));

      let inputElements = [];
      let inputFibers = [];
      inputElements = domHelper.GetAllInputTags(rootId);

      /**
       * Get react fiber data of input tags
       */
      inputElements.forEach((input) => {
        let fiber = domHelper.FindReact(input);
        if (fiber) {
          /**
           * find `Name` and `Src` of input tag
           * No src incase of external module.
           * TODO - Need to figure out logic
           * to find actual component defined in code.
           */
          inputFibers.push({
            name: fiber.type && fiber.type.name ? fiber.type.name : "NotFound",
            src:
              fiber.memoizedProps && fiber.memoizedProps.dhiwiseFilePath
                ? fiber.memoizedProps.dhiwiseFilePath
                : null,
            fiber
          });

          // inputFibers.push(fiber);
        }
      });

      // Update hook data
      setData({
        ...data,
        showSidebar: true,
        inputFibers: [...inputFibers]
      });

      /**
       * Test logging
       */
      // console.log("inputFibers: ", inputFibers);
    }
  }

  /**
   * Add event listeners for all elements in the current document
   */
  const initializeListeners = () => {
    var document = domHelper.GetCurrentDocument();
    var rootElement = document.getElementById(rootId);

    var elements = domHelper.GetAllElements(rootElement);

    for (var i = 0; i < elements.length; i++) {
      if (elements[i].tagName !== "BODY" && elements[i].tagName !== "SCRIPT") {
        elements[i].addEventListener("mouseover", MouseOver, false);
        elements[i].addEventListener("mouseout", MouseOut, false);
        elements[i].addEventListener("click", MouseClick, false);
      }
    }
  };

  React.useEffect(() => {
    initializeListeners();
  }, []);

  return [data, setData];
}

