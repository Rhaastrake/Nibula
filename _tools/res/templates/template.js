//==========================
// JAVASCRIPT MODULES IMPORTS
//==========================

// Call anywhere
import { showNotification } from '../modules/notification.js';

// Example of pre-existing modules
// import { initTextAreaAutoExpand } from '../modules/forms/textAreaAutoExpand.js';
// import { initNormalizePhoneNumber } from '../modules/forms/normalizePhoneNumber.js';

//==========================
// PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
    // initTextAreaAutoExpand();
    // initNormalizePhoneNumber();
});

showNotification("Example notification", "success", 3000);