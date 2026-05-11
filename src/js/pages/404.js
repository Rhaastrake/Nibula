//==========================
// JAVASCRIPT MODULES IMPORTS
//==========================


// Call anywhere
import { showNotification } from '../modules/notification.js';

// Uncomment to enable optional modules (call inside DOMContentLoaded)
// import { initTextAreaAutoExpand } from '../modules/forms/textAreaAutoExpand.js';
// import { initNormalizePhoneNumber } from '../modules/forms/normalizePhoneNumber.js';

//==========================
// "404" PAGE CUSTOM JAVASCRIPT
//==========================

document.addEventListener("DOMContentLoaded", () => {
});

showNotification("404 notification", "success", 3000);