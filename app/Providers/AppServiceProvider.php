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

    protected function configureRateLimiting(): void
    {
        // Limit ketat untuk login dan register (Tetap IP karena belum login)
        \Illuminate\Support\Facades\RateLimiter::for('auth', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
        });

        // Limit untuk API standard (Mengutamakan User ID agar tidak bentrok di 1 IP WiFi Toko)
        // Dinaikkan menjadi 500 agar lancar saat refresh dashboard yang banyak component
        \Illuminate\Support\Facades\RateLimiter::for('api', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            return $user 
                ? \Illuminate\Cache\RateLimiting\Limit::perMinute(500)->by($user->id) 
                : \Illuminate\Cache\RateLimiting\Limit::perMinute(60)->by($request->ip());
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
