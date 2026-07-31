'use strict';

(() => {
  const diagramContainer = document.getElementById('diagram');
  const sourceElement = document.getElementById('mermaid-source');
  const documentElement = document.documentElement;

  function decodeBase64Utf8(encodedValue) {
    const binary = window.atob(encodedValue.trim());
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  function createRenderId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `mermaid-${window.crypto.randomUUID()}`;
    }

    return `mermaid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function renderDiagram() {
    if (!window.mermaid) {
      throw new Error('Mermaid failed to load from ./vendor/mermaid.min.js.');
    }

    if (!diagramContainer || !sourceElement) {
      throw new Error('The generated HTML is missing a required diagram element.');
    }

    const source = decodeBase64Utf8(sourceElement.textContent || '');
    const theme = documentElement.dataset.mermaidTheme || 'default';
    const securityLevel =
      documentElement.dataset.mermaidSecurityLevel || 'strict';

    window.mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel,
      suppressErrorRendering: true,
    });

    await window.mermaid.parse(source);

    const { svg, bindFunctions } = await window.mermaid.render(
      createRenderId(),
      source,
    );

    diagramContainer.innerHTML = svg;

    const svgElement = diagramContainer.querySelector('svg');
    if (svgElement) {
      svgElement.removeAttribute('height');
      svgElement.removeAttribute('width');
      svgElement.setAttribute('role', 'img');
    }

    if (typeof bindFunctions === 'function') {
      bindFunctions(diagramContainer);
    }
  }

  renderDiagram().catch((error) => {
    console.error(error);

    if (diagramContainer) {
      diagramContainer.innerHTML = '';
      const errorElement = document.createElement('pre');
      errorElement.className = 'diagram-error';
      errorElement.textContent = `Unable to render Mermaid diagram:\n${error.message}`;
      diagramContainer.appendChild(errorElement);
    }
  });
})();
