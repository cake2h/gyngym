<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function registerStep1(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        $user = User::create([
            'email' => $validated['email'],
            'password' => Hash::make(Str::random(32)),
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function registerStep2(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before:today', 'after:' . now()->subYears(120)->format('Y-m-d')],
            'weight' => ['required', 'numeric', 'min:20', 'max:300'],
            'gender' => ['required', 'in:male,female'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();
        $user->update([
            'name' => $validated['name'],
            'birth_date' => $validated['birth_date'],
            'weight' => $validated['weight'],
            'gender' => $validated['gender'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['user' => $user->fresh()]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! auth()->attempt($validated)) {
            return response()->json(['message' => 'Неверный email или пароль'], 401);
        }

        $user = auth()->user();
        $user->tokens()->delete();
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Выход выполнен']);
    }
}
