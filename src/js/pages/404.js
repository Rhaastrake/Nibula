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
// "404" PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
});

showNotification("404 notification", "success", 3000);