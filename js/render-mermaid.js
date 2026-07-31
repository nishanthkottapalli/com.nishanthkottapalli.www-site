'use strict';

(() => {
  const diagramContainer = document.getElementById('diagram');
  const sourceElement = document.getElementById('mermaid-source');

  const diagramSection = diagramContainer?.closest(
    'section[data-mermaid-theme], section[data-mermaid-security-level]',
  );

  function decodeBase64Utf8(encodedValue) {
    const binary = window.atob(encodedValue.trim());

    const bytes = Uint8Array.from(
      binary,
      (character) => character.charCodeAt(0),
    );

    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  function createRenderId() {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === 'function'
    ) {
      return `mermaid-${window.crypto.randomUUID()}`;
    }

    return `mermaid-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  function getMermaidConfiguration() {
    return {
      theme:
        diagramSection?.dataset.mermaidTheme ||
        'default',

      securityLevel:
        diagramSection?.dataset.mermaidSecurityLevel ||
        'strict',
    };
  }

  function configureRenderedSvg() {
    const svgElement = diagramContainer.querySelector('svg');

    if (!svgElement) {
      return;
    }

    svgElement.removeAttribute('height');
    svgElement.removeAttribute('width');

    svgElement.setAttribute('role', 'img');
    svgElement.setAttribute('aria-label', 'Mermaid diagram');
    svgElement.setAttribute('focusable', 'false');
  }

  function showRenderError(error) {
    console.error(error);

    if (!diagramContainer) {
      return;
    }

    diagramContainer.replaceChildren();

    const errorElement = document.createElement('pre');

    errorElement.className = 'diagram-error';
    errorElement.textContent =
      `Unable to render Mermaid diagram:\n${error.message}`;

    diagramContainer.appendChild(errorElement);
  }

  async function renderDiagram() {
    if (!window.mermaid) {
      throw new Error(
        'Mermaid failed to load from ./vendor/mermaid.min.js.',
      );
    }

    if (!diagramContainer || !sourceElement) {
      throw new Error(
        'The generated HTML is missing a required diagram element.',
      );
    }

    if (!diagramSection) {
      throw new Error(
        'The diagram must be contained inside a section element.',
      );
    }

    const encodedSource = sourceElement.textContent || '';

    if (!encodedSource.trim()) {
      throw new Error('The Mermaid source is empty.');
    }

    const source = decodeBase64Utf8(encodedSource);
    const { theme, securityLevel } =
      getMermaidConfiguration();

    window.mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel,
      suppressErrorRendering: true,
    });

    await window.mermaid.parse(source);

    const { svg, bindFunctions } =
      await window.mermaid.render(
        createRenderId(),
        source,
      );

    diagramContainer.innerHTML = svg;

    configureRenderedSvg();

    if (typeof bindFunctions === 'function') {
      bindFunctions(diagramContainer);
    }
  }

  renderDiagram().catch(showRenderError);
})();
