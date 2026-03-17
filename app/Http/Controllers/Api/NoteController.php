<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()
            ->notes()
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:text,link,video'],
            'url' => ['nullable', 'url', 'max:2048'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'url', 'max:2048'],
        ]);

        $note = $request->user()->notes()->create($validated);

        return response()->json($note, 201);
    }

    public function show(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(404);
        }

        return response()->json($note);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'type' => ['sometimes', 'string', 'in:text,link,video'],
            'url' => ['nullable', 'url', 'max:2048'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'url', 'max:2048'],
        ]);

        $note->update($validated);

        return response()->json($note->fresh());
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            abort(404);
        }

        $note->delete();

        return response()->json(null, 204);
    }
}
