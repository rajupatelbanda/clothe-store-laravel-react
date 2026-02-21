<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'The provided email was not found.'], 422);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        $resetUrl = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($request->email);

        // Send Email (Using a simple anonymous mailable or standard Mail)
        try {
            Mail::send([], [], function ($message) use ($request, $resetUrl) {
                $message->to($request->email)
                    ->subject('Reset Your Password - Gemini Cloth Store')
                    ->html("
                        <div style='font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;'>
                            <h2 style='color: #FF5E78;'>Password Reset Request</h2>
                            <p>Hello,</p>
                            <p>You are receiving this email because we received a password reset request for your account.</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{$resetUrl}' style='background-color: #FF5E78; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold;'>Reset Password</a>
                            </div>
                            <p>This password reset link will expire in 60 minutes.</p>
                            <p>If you did not request a password reset, no further action is required.</p>
                            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
                            <p style='font-size: 12px; color: #777;'>If you're having trouble clicking the \"Reset Password\" button, copy and paste the URL below into your web browser:</p>
                            <p style='font-size: 12px; color: #777;'>{$resetUrl}</p>
                        </div>
                    ");
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send email. Please check your configuration.'], 500);
        }

        return response()->json(['message' => 'We have emailed your password reset link!']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $reset = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->token, $reset->token)) {
            return response()->json(['message' => 'This password reset token is invalid or expired.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Your password has been reset!']);
    }
}
