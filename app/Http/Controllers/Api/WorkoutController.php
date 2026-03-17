<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\WorkoutSession;
use App\Models\WorkoutTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function templates(Request $request): JsonResponse
    {
        $templates = $request->user()
            ->workoutTemplates()
            ->with('exercises')
            ->orderBy('sort_order')
            ->get();

        return response()->json($templates);
    }

    public function storeTemplate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'exercise_ids' => ['array'],
            'exercise_ids.*' => ['exists:exercises,id'],
        ]);

        $template = $request->user()->workoutTemplates()->create([
            'name' => $validated['name'],
            'sort_order' => $request->user()->workoutTemplates()->count(),
        ]);

        foreach ($validated['exercise_ids'] ?? [] as $i => $exerciseId) {
            $template->exercises()->attach($exerciseId, ['order' => $i]);
        }

        return response()->json($template->load('exercises'), 201);
    }

    public function updateTemplate(Request $request, WorkoutTemplate $template): JsonResponse
    {
        if ($template->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:50'],
            'exercise_ids' => ['sometimes', 'array'],
            'exercise_ids.*' => ['exists:exercises,id'],
        ]);

        if (isset($validated['name'])) {
            $template->update(['name' => $validated['name']]);
        }
        if (isset($validated['exercise_ids'])) {
            $template->exercises()->detach();
            foreach ($validated['exercise_ids'] as $i => $exerciseId) {
                $template->exercises()->attach($exerciseId, ['order' => $i]);
            }
        }

        return response()->json($template->fresh()->load('exercises'));
    }

    public function deleteTemplate(Request $request, WorkoutTemplate $template): JsonResponse
    {
        if ($template->user_id !== $request->user()->id) {
            abort(404);
        }
        $template->delete();
        return response()->json(null, 204);
    }

    public function calendar(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));
        $start = \Carbon\Carbon::parse($month.'-01')->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $sessions = $request->user()
            ->workoutSessions()
            ->with('template')
            ->whereBetween('date', [$start, $end])
            ->get()
            ->groupBy(fn ($s) => $s->date->format('Y-m-d'));

        $dates = [];
        foreach ($sessions as $date => $items) {
            $dates[$date] = $items->map(fn ($s) => ['id' => $s->id, 'template' => $s->template->name])->values();
        }

        return response()->json($dates);
    }

    public function sessions(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $sessions = $request->user()
            ->workoutSessions()
            ->with(['template', 'sets.exercise'])
            ->whereDate('date', $date)
            ->get();

        return response()->json($sessions);
    }

    public function storeSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'workout_template_id' => ['required', 'exists:workout_templates,id'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'sets' => ['required', 'array'],
            'sets.*.exercise_id' => ['required', 'exists:exercises,id'],
            'sets.*.set_number' => ['required', 'integer', 'min:1'],
            'sets.*.weight' => ['nullable', 'numeric', 'min:0'],
            'sets.*.reps' => ['nullable', 'integer', 'min:0'],
        ]);

        $template = WorkoutTemplate::findOrFail($validated['workout_template_id']);
        if ($template->user_id !== $request->user()->id) {
            abort(404);
        }

        $session = $request->user()->workoutSessions()->create([
            'workout_template_id' => $validated['workout_template_id'],
            'date' => $validated['date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['sets'] as $set) {
            $session->sets()->create([
                'exercise_id' => $set['exercise_id'],
                'set_number' => $set['set_number'],
                'weight' => $set['weight'] ?? null,
                'reps' => $set['reps'] ?? null,
            ]);
        }

        return response()->json($session->load(['template', 'sets.exercise']), 201);
    }

    public function showSession(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            abort(404);
        }
        $session->load(['template', 'sets.exercise']);
        return response()->json($session);
    }

    public function deleteSession(Request $request, WorkoutSession $session): JsonResponse
    {
        if ($session->user_id !== $request->user()->id) {
            abort(404);
        }
        $session->delete();
        return response()->json(null, 204);
    }
}
