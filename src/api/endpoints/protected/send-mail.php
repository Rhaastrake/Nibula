<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * NOTA: Non serve require 'vendor/autoload.php' o 'init.php' 
 * perché questo file viene incluso da index.php che ha già caricato tutto.
 */

// 1. Controllo Metodo (Vogliamo solo POST)
if ($method !== 'POST') {
    Response::error('Method not allowed', 405);
}

// 2. Funzioni di Sanitizzazione (Locali o spostabili in un helper)
$clean = fn($v) => htmlspecialchars(trim((string)($v ?? '')), ENT_QUOTES, 'UTF-8');
$safeNum = fn($v) => filter_var($v ?? '', FILTER_SANITIZE_NUMBER_INT);

// 3. Recupero Dati (supporta sia $_POST standard che JSON)
$input = $_POST;
if (empty($input)) {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
}

$formType    = $clean($input['formType'] ?? 'Contatto Generico');
$name        = $clean($input['name'] ?? '');
$phoneNumber = $safeNum($input['phoneNumber'] ?? '');

// Validazione minima
if (empty($name)) {
    Response::error('Il campo nome è obbligatorio');
}

// 4. Configurazione PHPMailer
$mail = new PHPMailer(true);

try {
    // Usiamo le variabili d'ambiente caricate da init.php
    $mail->isSMTP();
    $mail->Host       = $_ENV['MAIL_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['MAIL_USERNAME'];
    $mail->Password   = $_ENV['MAIL_PASSWORD'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)$_ENV['MAIL_PORT'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($_ENV['MAIL_USERNAME'], $_ENV['MAIL_FROM_NAME'] ?? 'API Robot');
    $mail->addAddress($_ENV['MAIL_TO_ADDRESS'], $_ENV['MAIL_TO_NAME'] ?? 'Admin');

    $mail->isHTML(true);
    $mail->Subject = "Nuovo invio modulo: {$formType}";

    // Costruzione Body
    $htmlBody = "<h2>Dettagli Richiesta</h2>";
    $htmlBody .= "<p><strong>Nome:</strong> {$name}</p>";
    if (!empty($phoneNumber)) {
        $htmlBody .= "<p><strong>Telefono:</strong> {$phoneNumber}</p>";
    }

    $mail->Body    = $htmlBody;
    $mail->AltBody = strip_tags(str_replace(['<br>', '</p>'], ["\n", "\n\n"], $htmlBody));

    $mail->send();

    // Risposta JSON di successo
    Response::success(['message' => 'Email inviata con successo']);

} catch (Exception $e) {
    // Risposta JSON di errore
    Response::error("Errore nell'invio della mail: {$mail->ErrorInfo}", 500);
}