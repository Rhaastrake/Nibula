//==========================
// JAVASCRIPT MODULES IMPORTS
//==========================

// Call inside DOMContentLoaded
import { initLangSwitcher } from '../modules/langSwitcher.js';

// Call anywhere
import { showNotification } from '../modules/notification.js';

// Uncomment to enable optional modules (call inside DOMContentLoaded)
// import { initTextAreaAutoExpand } from '../modules/textAreaAutoExpand.js';
// import { initNormalizePhoneNumber } from '../modules/normalizePhoneNumber.js';

//==========================
// "prova-pagina" PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
});

showNotification("prova-pagina notification", "success", 3000);