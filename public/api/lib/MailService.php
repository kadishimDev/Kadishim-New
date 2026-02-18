<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

class MailService
{
    private $config;
    private $accountConfig;

    /**
     * @param array $config The full configuration array
     * @param string $accountName The specific account to use (default: 'service')
     */
    public function __construct($config, $accountName = 'service')
    {
        $this->config = $config;
        $this->accountConfig = $config['accounts'][$accountName] ?? $config['accounts']['service'];
    }

    public function send($to, $subject, $body, $isHtml = true)
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->SMTPDebug = $this->config['debug'] ?? 0;
            $mail->isSMTP();
            $mail->Host = $this->accountConfig['host'];
            $mail->SMTPAuth = true;
            $mail->Username = $this->accountConfig['username'];
            $mail->Password = $this->accountConfig['password'];
            $mail->SMTPSecure = $this->accountConfig['secure'] ?? PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = $this->accountConfig['port'];
            $mail->CharSet = 'UTF-8';

            // Recipients
            $mail->setFrom($this->accountConfig['from_email'], $this->accountConfig['from_name'] ?? '');

            // Handle multiple recipients (comma separated or array)
            if (is_array($to)) {
                foreach ($to as $recipient) {
                    $mail->addAddress(trim($recipient));
                }
            } else {
                $recipients = explode(',', $to);
                foreach ($recipients as $recipient) {
                    $email = trim($recipient);
                    if (!empty($email)) {
                        $mail->addAddress($email);
                    }
                }
            }

            // Content
            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = strip_tags($body);

            $mail->send();
            return ['success' => true];
        } catch (Exception $e) {
            error_log("Mail Error: " . $mail->ErrorInfo);
            return [
                'success' => false,
                'error' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}"
            ];
        }
    }
}
