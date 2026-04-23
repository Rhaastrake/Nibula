# Email

Berna-Stencil uses [PHPMailer](https://github.com/PHPMailer/PHPMailer) to handle form submissions server-side.

## Setup

1. Copy `src/php/configExample.php` to `src/php/config.php`
2. Fill in your SMTP credentials:

```php
define('MAIL_USERNAME', 'you@gmail.com');
define('MAIL_PASSWORD', 'your-app-password');
define('MAIL_HOST',     'smtp.gmail.com');
define('MAIL_PORT',     587);
define('MAIL_TO_ADDRESS', 'you@gmail.com');
define('MAIL_FROM_NAME',  'My Site');
define('MAIL_TO_NAME',    'Receiver');
```

> `config.php` is gitignored — never commit it.

## Allowed origins

In `sendEmail.php`, whitelist your domain to block requests from other origins:

```php
$allowedDomains = [
    'www.mysite.com',
];
```

## Adding form fields

Sanitize new POST fields and append them to the email body in `sendEmail.php`:

```php
$myField = clean($_POST['myField'] ?? '');

if (!empty($myField)) {
    $body .= "<p><strong>My Field:</strong> {$myField}</p>";
}
```

Use `clean()` for text fields and `safeNum()` for numeric fields.

## Form integration

Any `<form>` on the page is automatically handled by `initFormListener()` in `src/js/modules/forms/form.js` — no extra setup needed. Add a hidden input to identify the form type in the email:

```html
<input type="hidden" name="formType" value="contact">
```

Notifications (sending, success, error) are shown automatically using the notification module.