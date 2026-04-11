<?php

namespace App\Mail;

use App\Models\CarTransfer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TransferInvitation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public CarTransfer $transfer,
        public string $transferUrl,
    ) {
        $this->transfer->loadMissing(['fromUser', 'car']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Вам передают автомобиль — CaRStory',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.transfer_invitation',
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
