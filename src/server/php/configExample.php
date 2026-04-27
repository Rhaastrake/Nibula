<?php

// IMPORTANT!
// You should fill this file with your data and rename it to config.php

// SMTP Configuration
define('MAIL_USERNAME', 'youremail@gmail.com'); // Email address you want to send from (must be configured with the SMTP provider)
define('MAIL_PASSWORD', 'password'); // Password for the above email address (or an app-specific password if using Gmail with 2FA)
define('MAIL_HOST', 'smtp.gmail.com'); // SMPT server host (e.g., smtp.gmail.com for Gmail)
define('MAIL_PORT', 587); // SMPT port (587 for TLS, 465 for SSL)
define('MAIL_TO_ADDRESS', 'youremail@gmail.com'); // Email address you want to send to (you can use the same as MAIL_USERNAME if you want to send to yourself)
define('MAIL_FROM_NAME', 'Your website'); // From: name that will appear in the recipient's inbox
define('MAIL_TO_NAME', 'Receiver'); // To: name that will appear in the recipient's inbox
?>