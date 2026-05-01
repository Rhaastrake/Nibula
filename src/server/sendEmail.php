<?php

//==========================
// SECURITY: METHOD CHECK
//==========================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method not allowed (PHP RESPONSE)';
    exit;
}


//==========================
// SECURITY: ORIGIN CHECK
//==========================

// Do not forget to add a ,
$allowedDomains = [
    'www.webfixer.it',
    // 'www.anotherorigin.com',
];

$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

$host = parse_url($origin ?: $referer, PHP_URL_HOST);

if (!$host || !in_array($host, $allowedDomains)) {
    http_response_code(403);
    echo 'Forbidden origin (PHP RESPONSE)';
    exit;
}


//==========================
// DEPENDENCIES
//==========================

use PHPMailer\PHPMailer;
use PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/config.php';


//==========================
// SANITIZATION FUNCTIONS
//==========================

function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

function safeNum($value) {
    return filter_var($value ?? '', FILTER_SANITIZE_NUMBER_INT);
}


//==========================
// POST VARIABLES
//==========================

// If the variable name exists, it will be concatenated in the body of the mail
// If it does not exist, it doesn't matter

$formType = clean($_POST['formType'] ?? '');

$name = clean($_POST['name'] ?? '');
$phoneNumber = safeNum($_POST['phoneNumber'] ?? '');


//==========================
// MAIL SETUP
//==========================

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = MAIL_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = MAIL_USERNAME;
    $mail->Password   = MAIL_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = MAIL_PORT;
    $mail->CharSet    = 'UTF-8';
    $mail->Encoding   = 'base64';

    $mail->setFrom(MAIL_USERNAME, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO_ADDRESS, MAIL_TO_NAME);

    $mail->isHTML(true);


    //==========================
    // MAIL BODY
    //==========================

    $body  = "";


    //==========================
    // DATA CHECKS AND CONCATENATION
    //==========================

    if (!empty($name)) {
        $body .= "<p><strong>Name:</strong> {$name}</p>";
    }
    if (!empty($phoneNumber)) {
        $body .= "<p><strong>Phone Number:</strong> {$phoneNumber}</p>";
    }

    //==========================
    // MAIL CONTENT
    //==========================

    $mail->Subject = "New form submission ({$formType})";

    $mail->Body    = $body;
    $mail->AltBody = strip_tags(str_replace('<br>', "\n", $body));

    $mail->send();

    http_response_code(200);
    echo "success";

} catch (Exception $e) {
    http_response_code(500);
    echo "{$mail->ErrorInfo}";
}