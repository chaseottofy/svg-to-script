const textarea = document.querySelector('.textarea') as HTMLTextAreaElement;
const display = document.querySelector('.display') as HTMLElement;
const outputSVG = document.querySelector('.output-svg') as HTMLElement;
const floatCopy = document.querySelector('.float-copy') as HTMLElement;
const resetBtn = document.querySelector('.float-reset') as HTMLElement;
const parseOptions = document.querySelectorAll('input[name="parse-options"]') as NodeListOf<HTMLInputElement>;
const toggleOptionsBtn = document.querySelector('.run-options') as HTMLElement;
const optionsModal = document.querySelector('.options-aside') as HTMLElement;
const submitBtn = document.querySelector('.run-btn') as HTMLElement;

export interface ParserOptions { [key: string]: boolean; }
export interface ElementCounts { [key: string]: number; }
export interface ParseOptions {
  ids?: boolean;
  classes?: boolean;
  'data-attributes'?: boolean;
}

const getParserOptions = (parseOptions: NodeListOf<HTMLInputElement>): ParserOptions => {
  const options: ParserOptions = {};
  parseOptions.forEach((option) => {
    options[option.id] = option.checked;
  });
  return options;
};

const svgToScript = (element: Element, elementCounts: ElementCounts = {}, options: ParseOptions = {}): string => {
  elementCounts[element.nodeName] = (elementCounts[element.nodeName] || 0) + 1;
  const elementName = `${element.nodeName}${elementCounts[element.nodeName]}`;
  let output = `const ${elementName} = document.createElementNS('http://www.w3.org/2000/svg', '${element.nodeName}');\n`;

  for (let i = 0; i < element.attributes.length; i++) {
    if ((options.ids && element.attributes[i].name === 'id') ||
      (options.classes && element.attributes[i].name === 'class') ||
      (options['data-attributes'] && element.attributes[i].name.startsWith('data-'))) {
      continue;
    }
    output += `${elementName}.setAttribute('${element.attributes[i].name}', '${element.attributes[i].value}');\n`;
  }

  let childrenOutput = '';
  for (let i = 0; i < element.children.length; i++) {
    const childOutput = svgToScript(element.children[i], elementCounts, options);
    childrenOutput += childOutput;
    output += `${elementName}.append(${element.children[i].nodeName}${elementCounts[element.children[i].nodeName]});\n`;
  }
  return childrenOutput + output;
};

const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text);
};

const colorCorrect = (svgClone: Element): Element => {
  svgClone.removeAttribute('style');
  const fill = svgClone.getAttribute('fill');
  const stroke = svgClone.getAttribute('stroke');

  if (fill && fill !== 'none') {
    svgClone.setAttribute('fill', 'var(--foreground)');
    svgClone.setAttribute('stroke', 'none');
    return svgClone;
  }
  if (stroke && stroke !== 'none') {
    svgClone.setAttribute('stroke', 'var(--foreground)');
    svgClone.setAttribute('fill', 'none');
    return svgClone;
  }

  svgClone.setAttribute('fill', 'none');
  svgClone.setAttribute('stroke', 'var(--foreground)');
  return svgClone;
};

const parseSVG = (svgString: string): string => {
  const parser: DOMParser = new DOMParser();
  const doc: Document = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement: Element = doc.documentElement;

  if (doc.querySelector('parsererror')) {
    outputSVG.innerText = '';
    display.innerText = '';
    return 'Invalid SVG';
  } else {
    const svgClone: Element = svgElement.cloneNode(true) as Element;
    const correctCorrectedSVG: Element = colorCorrect(svgClone);
    if (outputSVG) {
      outputSVG.innerHTML = correctCorrectedSVG.outerHTML;
    }
    return svgToScript(svgElement, {}, getParserOptions(parseOptions) as ParseOptions);
  }
};

const reset = (): void => {
  textarea.value = '';
  outputSVG.innerText = '';
  display.innerText = '';
};

const handleParse = (): void => {
  if (!textarea.value) return;
  outputSVG.innerText = '';
  const svgString: string = textarea.value;
  const jsScript: string = parseSVG(svgString);
  if (jsScript) {
    const fullScript: string = `const createSvgElement = () => {\n${jsScript + 'return svg1'};\n}`;
    display.innerText = fullScript;
  } else {
    outputSVG.innerText = '';
    display.innerText = '';
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (event.target !== optionsModal && !optionsModal.contains(event.target as Node)) {
    closeOptionsModal();
  }
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeOptionsModal();
  }
};

const setOptionsModalPosition = (): void => {
  const btnRect = toggleOptionsBtn.getBoundingClientRect();
  const modalRect = optionsModal.getBoundingClientRect();
  let left = btnRect.left;
  if (left + modalRect.width > window.innerWidth) {
    left = window.innerWidth - modalRect.width - 10;
  }
  optionsModal.style.left = `${left}px`;
};

const openOptionsModal = (): void => {
  optionsModal.classList.remove('disable-modal');
  toggleOptionsBtn.classList.add('options-open');
  document.addEventListener('mouseup', handleClickOutside);
  document.addEventListener('keydown', handleEscapeKey);
  setOptionsModalPosition();
  window.addEventListener('resize', setOptionsModalPosition);
};

const closeOptionsModal = (): void => {
  optionsModal.classList.add('disable-modal');
  toggleOptionsBtn.classList.remove('options-open');
  document.removeEventListener('mouseup', handleClickOutside);
  document.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('resize', setOptionsModalPosition);
};

const toggleOptionsHandler = (): void => {
  if (optionsModal.classList.contains('disable-modal')) {
    openOptionsModal();
  } else {
    closeOptionsModal();
  }
};

submitBtn.addEventListener('click', handleParse);
floatCopy.addEventListener('click', () => copyToClipboard(display.innerText));
resetBtn.addEventListener('click', reset);
toggleOptionsBtn.addEventListener('click', toggleOptionsHandler);
textarea.setAttribute('placeholder', `Input inline svg...\n<svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>`);
