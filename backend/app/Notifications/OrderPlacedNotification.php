<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    protected $order;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $pdf = Pdf::loadView('exports.invoice', ['order' => $this->order]);
        
        return (new MailMessage)
                    ->subject('Order Confirmation - #' . $this->order->id)
                    ->line('Thank you for your order, ' . $notifiable->name . '!')
                    ->line('Your order #' . $this->order->id . ' has been successfully placed.')
                    ->line('Total Amount: $' . $this->order->total)
                    ->attachData($pdf->output(), "Invoice_{$this->order->id}.pdf", [
                        'mime' => 'application/pdf',
                    ])
                    ->action('Track My Order', url('/orders/' . $this->order->id . '/track'))
                    ->line('Please find your invoice attached to this email.');
    }

    public function sendWhatsApp($phone)
    {
        $sid = env('TWILIO_SID');
        $token = env('TWILIO_TOKEN');
        $from = env('TWILIO_WHATSAPP_NUMBER');
        
        if (!$sid || !$token || !$from) return;

        try {
            $twilio = new Client($sid, $token);
            // Public tracking link
            $trackUrl = url('/orders/' . $this->order->id . '/track');
            // We could also generate a temp public link for the PDF if needed, but for now a text confirmation is best.
            $message = "🎉 Order Confirmed! Hello " . $this->order->user->name . ", your order #" . $this->order->id . " for $" . $this->order->total . " has been placed. You can download your invoice and track your package here: " . $trackUrl;
            
            $twilio->messages->create("whatsapp:" . $phone, ["from" => $from, "body" => $message]);
        } catch (\Exception $e) {
            \Log::error("Twilio Order Placed Error: " . $e->getMessage());
        }
    }
}
