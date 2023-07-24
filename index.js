"use strict";// src/index.ts
var textarea = document.querySelector(".textarea");
var display = document.querySelector(".display");
var outputSVG = document.querySelector(".output-svg");
var floatCopy = document.querySelector(".float-copy");
var resetBtn = document.querySelector(".float-reset");
var parseOptions = document.querySelectorAll('input[name="parse-options"]');
var toggleOptionsBtn = document.querySelector(".run-options");
var optionsModal = document.querySelector(".options-aside");
var submitBtn = document.querySelector(".run-btn");
var getParserOptions = (parseOptions2) => {
  const options = {};
  parseOptions2.forEach((option) => {
    options[option.id] = option.checked;
  });
  return options;
};
var svgToScript = (element, elementCounts = {}, options = {}) => {
  elementCounts[element.nodeName] = (elementCounts[element.nodeName] || 0) + 1;
  const elementName = `${element.nodeName}${elementCounts[element.nodeName]}`;
  let output = `const ${elementName} = document.createElementNS('http://www.w3.org/2000/svg', '${element.nodeName}');
`;
  for (let i = 0; i < element.attributes.length; i++) {
    if (options.ids && element.attributes[i].name === "id" || options.classes && element.attributes[i].name === "class" || options["data-attributes"] && element.attributes[i].name.startsWith("data-")) {
      continue;
    }
    output += `${elementName}.setAttribute('${element.attributes[i].name}', '${element.attributes[i].value}');
`;
  }
  let childrenOutput = "";
  for (let i = 0; i < element.children.length; i++) {
    const childOutput = svgToScript(element.children[i], elementCounts, options);
    childrenOutput += childOutput;
    output += `${elementName}.append(${element.children[i].nodeName}${elementCounts[element.children[i].nodeName]});
`;
  }
  return childrenOutput + output;
};
var copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};
var colorCorrect = (svgClone) => {
  svgClone.removeAttribute("style");
  const fill = svgClone.getAttribute("fill");
  const stroke = svgClone.getAttribute("stroke");
  if (fill && fill !== "none") {
    svgClone.setAttribute("fill", "var(--foreground)");
    svgClone.setAttribute("stroke", "none");
    return svgClone;
  }
  if (stroke && stroke !== "none") {
    svgClone.setAttribute("stroke", "var(--foreground)");
    svgClone.setAttribute("fill", "none");
    return svgClone;
  }
  svgClone.setAttribute("fill", "none");
  svgClone.setAttribute("stroke", "var(--foreground)");
  return svgClone;
};
var parseSVG = (svgString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = doc.documentElement;
  if (doc.querySelector("parsererror")) {
    outputSVG.innerText = "";
    display.innerText = "";
    return "Invalid SVG";
  } else {
    const svgClone = svgElement.cloneNode(true);
    const correctCorrectedSVG = colorCorrect(svgClone);
    if (outputSVG) {
      outputSVG.innerHTML = correctCorrectedSVG.outerHTML;
    }
    return svgToScript(svgElement, {}, getParserOptions(parseOptions));
  }
};
var reset = () => {
  textarea.value = "";
  outputSVG.innerText = "";
  display.innerText = "";
};
var handleParse = () => {
  if (!textarea.value)
    return;
  outputSVG.innerText = "";
  const svgString = textarea.value;
  const jsScript = parseSVG(svgString);
  if (jsScript) {
    const fullScript = `const createSvgElement = () => {
${jsScript + "return svg1"};
}`;
    display.innerText = fullScript;
  } else {
    outputSVG.innerText = "";
    display.innerText = "";
  }
};
var handleClickOutside = (event) => {
  if (event.target !== optionsModal && !optionsModal.contains(event.target)) {
    closeOptionsModal();
  }
};
var handleEscapeKey = (event) => {
  if (event.key === "Escape") {
    closeOptionsModal();
  }
};
var setOptionsModalPosition = () => {
  const btnRect = toggleOptionsBtn.getBoundingClientRect();
  const modalRect = optionsModal.getBoundingClientRect();
  let left = btnRect.left;
  if (left + modalRect.width > window.innerWidth) {
    left = window.innerWidth - modalRect.width - 10;
  }
  optionsModal.style.left = `${left}px`;
};
var openOptionsModal = () => {
  optionsModal.classList.remove("disable-modal");
  toggleOptionsBtn.classList.add("options-open");
  document.addEventListener("mouseup", handleClickOutside);
  document.addEventListener("keydown", handleEscapeKey);
  setOptionsModalPosition();
  window.addEventListener("resize", setOptionsModalPosition);
};
var closeOptionsModal = () => {
  optionsModal.classList.add("disable-modal");
  toggleOptionsBtn.classList.remove("options-open");
  document.removeEventListener("mouseup", handleClickOutside);
  document.removeEventListener("keydown", handleEscapeKey);
  window.removeEventListener("resize", setOptionsModalPosition);
};
var toggleOptionsHandler = () => {
  if (optionsModal.classList.contains("disable-modal")) {
    openOptionsModal();
  } else {
    closeOptionsModal();
  }
};
submitBtn.addEventListener("click", handleParse);
floatCopy.addEventListener("click", () => copyToClipboard(display.innerText));
resetBtn.addEventListener("click", reset);
toggleOptionsBtn.addEventListener("click", toggleOptionsHandler);
textarea.setAttribute("placeholder", `Input inline svg...
<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>`);
