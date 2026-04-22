//==========================
// AUTO-EXPAND TEXTAREA MODULE
//==========================

export function initTextAreaAutoExpand() {
  
  function setup(element) {
    if (element.dataset.autoExpand) return;
    element.dataset.autoExpand = true;
    element.style.resize = "none";
    element.style.overflow = "hidden";
    element.dataset.minRows = element.rows || 1;
    element.addEventListener("input", () => expand(element));
    if (element.value) expand(element);
  }

  function expand(element) {
    element.rows = element.dataset.minRows;
    while (element.scrollHeight > element.clientHeight) {
      element.rows += 1;
    }
  }

  document.querySelectorAll("textarea").forEach(setup);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches("textarea")) setup(node);
        node.querySelectorAll?.("textarea").forEach(setup);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}