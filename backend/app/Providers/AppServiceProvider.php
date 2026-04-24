<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email', '');
            return Limit::perMinute(10)->by($request->ip().'|'.mb_strtolower($email));
        });

        RateLimiter::for('scan', function (Request $request) {
            $userId = $request->user()?->id;
            $key = $userId ? ('user|'.$userId) : ('ip|'.$request->ip());
            return Limit::perMinute(60)->by($key);
        });
    }
}
