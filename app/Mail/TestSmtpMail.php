<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TestSmtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('Test email from :app', ['app' => config('app.name')]),
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.test-smtp-text',
        );
    }
}
