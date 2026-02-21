<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;

class LowStockNotification extends Notification
{
    use Queueable;

    protected $product;
    protected $variation;

    public function __construct($product, $variation = null)
    {
        $this->product = $product;
        $this->variation = $variation;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $itemName = $this->product->name;
        if ($this->variation) {
            $itemName .= " (Color: {$this->variation->color}, Size: {$this->variation->size})";
        }
        $stock = $this->variation ? $this->variation->stock : $this->product->stock;

        return (new MailMessage)
                    ->error()
                    ->subject('⚠️ Low Stock Alert: ' . $this->product->name)
                    ->line('Alert: The stock level for an item has dropped below the threshold.')
                    ->line('Item: ' . $itemName)
                    ->line('Current Stock: ' . $stock)
                    ->action('Manage Inventory', url('/admin/products'))
                    ->line('Please restock as soon as possible to avoid order cancellations.');
    }

    public function sendWhatsApp($phone)
    {
        $sid = env('TWILIO_SID');
        $token = env('TWILIO_TOKEN');
        $from = env('TWILIO_WHATSAPP_NUMBER');
        
        if (!$sid || !$token || !$from) return;

        try {
            $twilio = new Client($sid, $token);
            $itemName = $this->product->name;
            if ($this->variation) {
                $itemName .= " ({$this->variation->color}/{$this->variation->size})";
            }
            $stock = $this->variation ? $this->variation->stock : $this->product->stock;
            
            $message = "⚠️ LOW STOCK ALERT!\nItem: $itemName\nCurrent Stock: $stock\nPlease restock immediately.";
            
            $twilio->messages->create("whatsapp:" . $phone, ["from" => $from, "body" => $message]);
        } catch (\Exception $e) {
            \Log::error("Twilio Low Stock Error: " . $e->getMessage());
        }
    }
}
