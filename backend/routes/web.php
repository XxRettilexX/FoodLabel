<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Modules\Labels\Controllers\LabelController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/labels/{label}/print', [LabelController::class, 'printView'])
    ->middleware('signed')
    ->name('labels.print');
