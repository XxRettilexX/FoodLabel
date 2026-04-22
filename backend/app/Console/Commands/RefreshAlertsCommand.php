<?php

namespace App\Console\Commands;

use App\Services\Modules\Alerts\AlertService;
use Illuminate\Console\Command;

class RefreshAlertsCommand extends Command
{
    protected $signature = 'alerts:refresh';
    protected $description = 'Aggiorna stato lotti e alert operativi';

    public function handle(AlertService $alertService): int
    {
        $alertService->refresh();
        $this->info('Alert aggiornati.');

        return self::SUCCESS;
    }
}
