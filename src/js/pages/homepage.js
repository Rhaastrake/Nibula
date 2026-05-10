//==========================
// JAVASCRIPT MODULES IMPORTS
//==========================

// Call inside DOMContentLoaded
import { initFormListener } from '../modules/forms/form.js';
import { initLangSwitcher } from '../modules/langSwitcher.js';

// Call anywhere
import { showNotification } from '../modules/notification.js';

// Uncomment to enable optional modules (call inside DOMContentLoaded)
// import { initTextAreaAutoExpand } from '../modules/forms/textAreaAutoExpand.js';
// import { initNormalizePhoneNumber } from '../modules/forms/normalizePhoneNumber.js';

//==========================
// PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
  initFormListener();
});

showNotification("Example notification", "success", 3000);