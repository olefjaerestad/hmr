type THmrElementType = HTMLLinkElement
| HTMLImageElement
| HTMLObjectElement
| HTMLEmbedElement
| HTMLIFrameElement;

type TDataType = 'css' | 'svg' | 'img' | 'js';

/**
 * Replace nodes which reference filename (e.g. CSS <link>s).
 * Return number of replaced nodes.
 * 
 * Don't attempt to replace non-module scripts.
 * Reason:
 * Potential source of memory leaks,
 * removed scripts will still be in memory.
 * Which in turn will lead to 'Cannot redeclare variable' errors.
 */
export function replaceNodesByFilename(filename: string): void | number {
  if (!filename) {
    return;
  }
  
  const dataType = getDataTypeFromFilename(filename);
  const selector = getSelectorFromFilenameAndDataType(filename, dataType);

  if (!selector) {
    return;
  }

  let replacedNodesCount = 0;

  const elements = document.querySelectorAll(selector);
  elements.forEach((element: THmrElementType) => {
    if (!elementReferencesCurrentOrigin(element)) {
      return; // Move on to next element.
    }

    const newElement = cloneElement(element);

    /**
     * Add timestamp to bust cache.
     * Ref https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url.
     */
    const cachedAttributes = ['src', 'data'];
    cachedAttributes.forEach((attribute: string) => {
      if (newElement.hasAttribute(attribute)) {
        newElement.setAttribute(
          attribute, 
          addTimestampParam(newElement.getAttribute(attribute))
        );
      }
    });

    element.parentElement.replaceChild(newElement, element);
    ++replacedNodesCount;
  });

  return replacedNodesCount;
}

function addTimestampParam(string: string) {
  const [url, params] = string.split('?');
  const searchParams = new URLSearchParams(params);
  searchParams.set('hmr-ts', Date.now().toString());
  return url + '?' + searchParams.toString();
}

/**
 * We're using this to avoid replacing nodes referencing files not from our domain/origin.
 * Ideally we would have the full URL of the changed file available, so we dont accidentally 
 * replace the wrong node in case of multiple nodes referencing files with the same filename, 
 * at different paths (e.g. /dist/style.css and ./vendor/somevendor/style.css). We don't tho.
 */
function elementReferencesCurrentOrigin(element: THmrElementType): boolean {
  const attributesToCheck = ['href', 'src', 'data'];
  let attributeValue = '';

  for (let i = 0; i < attributesToCheck.length; ++i) {
    const attribute = attributesToCheck[i];
    if (element.hasAttribute(attribute)) {
      attributeValue = element.getAttribute(attribute);
      break;
    }
  }

  return attributeValue.startsWith('.') 
  || attributeValue.startsWith('/')
  || attributeValue.includes(location.hostname);
}

function getDataTypeFromFilename(filename: string): TDataType {
  const filenameLowerCase = filename.toLowerCase();

  const isJs = filenameLowerCase.endsWith('.js');
  if (isJs) {
    return 'js';
  }

  const isCss = filenameLowerCase.endsWith('.css');
  if (isCss) {
    return 'css';
  }

  const isSvg = !isCss && filenameLowerCase.endsWith('.svg');
  if (isSvg) {
    return 'svg';
  }
  
  const isImage = !isCss && !isSvg && (
    filenameLowerCase.endsWith('.jpg') || 
    filenameLowerCase.endsWith('.jpeg') || 
    filenameLowerCase.endsWith('.png') || 
    filenameLowerCase.endsWith('.gif') || 
    filenameLowerCase.endsWith('.webp') ||
    filenameLowerCase.endsWith('.heic') ||
    filenameLowerCase.endsWith('.heif') ||
    filenameLowerCase.endsWith('.avif')
  );
  if (isImage) {
    return 'img';
  }
}

function getSelectorFromFilenameAndDataType(filename: string, dataType: TDataType): string {
  if (dataType === 'js') {
    return `script[src*="${filename}"][type="module"]`;
  } else if (dataType === 'css') {
    return `link[href*="${filename}"]`;
  } else if (dataType === 'svg') {
    return `
      img[src*="${filename}"], 
      object[data*="${filename}"], 
      embed[src*="${filename}"], 
      iframe[src*="${filename}"]
    `;
  } else if (dataType === 'img') {
    return `img[src*="${filename}"]`;
  }
}

function cloneElement(element: HTMLElement): HTMLElement {
  /**
   * We can't use Node.cloneNode. Ref:
   * https://stackoverflow.com/questions/28771542/why-dont-clonenode-script-tags-execute
   * https://html.spec.whatwg.org/multipage/scripting.html#script-processing-model
   */
  const newElement = document.createElement(element.tagName.toLowerCase());
  const attributeNames = element.getAttributeNames();
  for (let i = 0; i < attributeNames.length; ++i) {
    newElement.setAttribute(
      attributeNames[i],
      element.getAttribute(attributeNames[i])
    );
  }
  newElement.innerHTML = element.innerHTML;

  return newElement;
}
