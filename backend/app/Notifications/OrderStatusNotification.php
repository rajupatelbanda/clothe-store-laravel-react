<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class OrderStatusNotification extends Notification
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
        return (new MailMessage)
                    ->subject('Order Status Update - #' . $this->order->id)
                    ->line('Hello ' . $notifiable->name . ',')
                    ->line('The status of your order #' . $this->order->id . ' has been updated to: ' . strtoupper($this->order->status))
                    ->action('Track Order', url('/orders/' . $this->order->id . '/track'))
                    ->line('Thank you for choosing Gemini Cloth Store!');
    }

    public function sendWhatsApp($phone)
    {
        $sid = env('TWILIO_SID');
        $token = env('TWILIO_TOKEN');
        $from = env('TWILIO_WHATSAPP_NUMBER');
        
        if (!$sid || !$token || !$from) {
            \Log::warning("Twilio credentials missing. WhatsApp status update skipped.");
            return;
        }

        try {
            $twilio = new Client($sid, $token);
            $message = "🚚 Order Update! Your order #" . $this->order->id . " is now " . strtoupper($this->order->status) . ". Track your delivery live: " . url('/orders/' . $this->order->id . '/track');
            
            $twilio->messages->create(
                "whatsapp:" . $phone,
                [
                    "from" => $from,
                    "body" => $message
                ]
            );
            \Log::info("WhatsApp (Status Update) sent to $phone");
        } catch (\Exception $e) {
            \Log::error("Twilio Error (Status Update): " . $e->getMessage());
        }
    }
}
