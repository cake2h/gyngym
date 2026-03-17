<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'registerStep1']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/register/complete', [AuthController::class, 'registerStep2']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/measurements', [MeasurementController::class, 'index']);
    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::get('/measurements/chart/{type}', [MeasurementController::class, 'chart']);
    Route::delete('/measurements/{measurement}', [MeasurementController::class, 'destroy']);

    Route::get('/exercises', [ExerciseController::class, 'index']);
    Route::get('/workout-templates', [WorkoutController::class, 'templates']);
    Route::post('/workout-templates', [WorkoutController::class, 'storeTemplate']);
    Route::put('/workout-templates/{template}', [WorkoutController::class, 'updateTemplate']);
    Route::delete('/workout-templates/{template}', [WorkoutController::class, 'deleteTemplate']);
    Route::get('/workout/calendar', [WorkoutController::class, 'calendar']);
    Route::get('/workout/sessions', [WorkoutController::class, 'sessions']);
    Route::post('/workout/sessions', [WorkoutController::class, 'storeSession']);
    Route::get('/workout/sessions/{session}', [WorkoutController::class, 'showSession']);
    Route::delete('/workout/sessions/{session}', [WorkoutController::class, 'deleteSession']);

    Route::get('/notes', [NoteController::class, 'index']);
    Route::post('/notes', [NoteController::class, 'store']);
    Route::get('/notes/{note}', [NoteController::class, 'show']);
    Route::put('/notes/{note}', [NoteController::class, 'update']);
    Route::delete('/notes/{note}', [NoteController::class, 'destroy']);
});
