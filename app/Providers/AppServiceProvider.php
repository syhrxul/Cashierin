<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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
        $this->configureDefaults();

        \Illuminate\Support\Facades\Gate::define('viewApiDocs', function (?\App\Models\User $user) {
            return app()->isLocal() || $user?->role === 'superadmin';
        });

        // Konfigurasi Rate Limiting (Anti-Spam Bot)
        $this->configureRateLimiting();
    }

    /**
     * Konfigurasi pembatasan request (Rate Limiting).
     */
    protected function configureRateLimiting(): void
    {
        // Limit umum untuk API (60 request per menit per IP)
        \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by(fn ($request) => $request->ip());

        // Limit ketat untuk login dan register (5 request per menit per IP)
        \Illuminate\Support\Facades\RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->ip());
        });

        // Limit untuk API standard (60 request per menit per User/IP)
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
