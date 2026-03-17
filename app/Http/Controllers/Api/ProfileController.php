<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'date', 'before:today', 'after:' . now()->subYears(120)->format('Y-m-d')],
            'weight' => ['sometimes', 'numeric', 'min:20', 'max:300'],
            'gender' => ['sometimes', 'in:male,female'],
        ]);

        $request->user()->update($validated);

        return response()->json($request->user()->fresh());
    }
}
