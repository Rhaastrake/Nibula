//==========================
// AUTO-EXPAND TEXTAREA MODULE
//==========================

export function initTextAreaAutoExpand() {
  const MAX_ROWS = 10;

  function setup(element) {
    if (element.dataset.autoExpand) return;
    element.dataset.autoExpand = "true";
    element.style.resize = "none";
    element.style.overflow = "hidden";
    element.dataset.minRows = element.rows || 1;
    element.addEventListener("input", () => expand(element));
    if (element.value) expand(element);
  }
  
  function expand(element) {
    element.rows = element.dataset.minRows;
    while (element.scrollHeight > element.clientHeight && element.rows < MAX_ROWS) {
      element.rows += 1;
    }
  }
  
  document.querySelectorAll("textarea").forEach(setup);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches("textarea")) setup(node);
        node.querySelectorAll?.("textarea").forEach(setup);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}