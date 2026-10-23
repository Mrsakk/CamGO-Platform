<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends ApiController
{
    /**
     * Register a new Tourist user.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'country' => $validated['country'] ?? null,
            'is_active' => true,
            'email_verified_at' => now(), // Auto verify for demo
        ]);

        $user->assignRole('Tourist');

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLog::record('register', $user, null, ['name' => $user->name, 'email' => $user->email]);

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Registration successful', 201);
    }

    /**
     * Login user and issue API token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed', [], 'en')],
            ]);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Your account has been deactivated. Please contact support.', 403);
        }

        if ($user->must_change_password) {
            return $this->errorResponse('Your account setup is not complete. Open the setup link from your administrator to create a password.', 403);
        }

        // Revoke previous tokens optionally or keep multiple devices
        $deviceName = $request->device_name ?? 'web_browser';
        $token = $user->createToken($deviceName)->plainTextToken;

        AuditLog::record('login', $user);

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    /**
     * Logout and revoke current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            AuditLog::record('logout', $user);
            $user->currentAccessToken()?->delete();
        }

        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Get authenticated user details.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->successResponse([
            'user' => new UserResource($request->user()),
        ], 'User profile retrieved');
    }

    /**
     * Send password reset link / notification.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            // For security, return success even if user not found
            return $this->successResponse(null, 'If your email is registered, you will receive password reset instructions.');
        }

        // Generate reset token
        $token = Password::broker()->createToken($user);

        return $this->successResponse([
            'reset_token' => $token, // Provided in response for easy testing/demo
        ], 'Password reset instructions have been generated.');
    }

    /**
     * Reset password with token.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:10|confirmed',
        ]);

        $status = Password::reset(
            [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'password_confirmation' => $request->input('password_confirmation'),
                'token' => $validated['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'must_change_password' => false,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ])->save();

                $user->tokens()->delete();

                AuditLog::record('password_reset', $user);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            $message = match ($status) {
                Password::INVALID_TOKEN => 'This setup link is invalid or has expired. Ask an administrator for a new link.',
                Password::RESET_THROTTLED => 'Please wait a moment before trying again.',
                default => 'Unable to set the password. Please request a new setup link.',
            };

            return $this->errorResponse($message, 422);
        }

        return $this->successResponse(null, 'Password has been set successfully. You can now login with your new password.');
    }
}
