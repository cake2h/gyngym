<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $measurements = $request->user()
            ->measurements()
            ->orderBy('measured_at', 'desc')
            ->get();

        return response()->json($measurements);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $types = Measurement::typesForGender($user->gender ?? 'male');

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:'.implode(',', $types)],
            'value' => ['required', 'numeric', 'min:0', 'max:999'],
            'measured_at' => ['required', 'date'],
        ]);

        $measurement = $user->measurements()->create($validated);

        return response()->json($measurement, 201);
    }

    public function chart(Request $request, string $type): JsonResponse
    {
        $user = $request->user();
        $types = Measurement::typesForGender($user->gender ?? 'male');

        if (! in_array($type, $types)) {
            return response()->json(['message' => 'Invalid type'], 422);
        }

        $data = $user->measurements()
            ->where('type', $type)
            ->orderBy('measured_at')
            ->get(['measured_at', 'value'])
            ->map(fn ($m) => [
                'date' => $m->measured_at->format('Y-m-d'),
                'value' => (float) $m->value,
            ]);

        return response()->json($data);
    }

    public function destroy(Request $request, Measurement $measurement): JsonResponse
    {
        if ($measurement->user_id !== $request->user()->id) {
            abort(404);
        }

        $measurement->delete();

        return response()->json(null, 204);
    }
}
