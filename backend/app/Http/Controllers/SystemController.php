<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;

class SystemController extends Controller
{
    public function getLogs()
    {
        $logPath = storage_path('logs');
        $files = File::files($logPath);
        
        $logs = [];
        foreach ($files as $file) {
            if ($file->getExtension() === 'log') {
                $logs[] = [
                    'name' => $file->getFilename(),
                    'size' => round($file->getSize() / 1024, 2) . ' KB',
                    'last_modified' => date("Y-m-d H:i:s", $file->getMTime()),
                ];
            }
        }

        // Sort by last modified descending
        usort($logs, function($a, $b) {
            return strcmp($b['last_modified'], $a['last_modified']);
        });

        return response()->json($logs);
    }

    public function viewLog($filename)
    {
        $path = storage_path('logs/' . $filename);
        if (!File::exists($path)) {
            return response()->json(['message' => 'Log file not found'], 404);
        }

        $content = File::get($path);
        // Return last 500 lines for performance
        $lines = explode("
", $content);
        $lastLines = array_slice($lines, -500);
        
        return response()->json([
            'filename' => $filename,
            'content' => implode("
", $lastLines)
        ]);
    }

    public function deleteLog($filename)
    {
        $path = storage_path('logs/' . $filename);
        if (File::exists($path)) {
            File::delete($path);
            return response()->json(['message' => 'Log file deleted']);
        }
        return response()->json(['message' => 'Log file not found'], 404);
    }

    public function backupDatabase()
    {
        $dbPath = database_path('database.sqlite');
        if (!File::exists($dbPath)) {
            return response()->json(['message' => 'Database file not found'], 404);
        }

        $backupName = 'backup-' . date('Y-m-d-H-i-s') . '.sqlite';
        $backupPath = storage_path('app/backups/' . $backupName);

        if (!File::exists(storage_path('app/backups'))) {
            File::makeDirectory(storage_path('app/backups'), 0755, true);
        }

        File::copy($dbPath, $backupPath);

        return response()->json([
            'message' => 'Backup created successfully',
            'filename' => $backupName,
            'download_url' => url('api/admin/system/backup/download/' . $backupName)
        ]);
    }

    public function downloadBackup($filename)
    {
        $path = storage_path('app/backups/' . $filename);
        if (File::exists($path)) {
            return Response::download($path);
        }
        return response()->json(['message' => 'Backup not found'], 404);
    }

    public function clearCache($type)
    {
        try {
            switch ($type) {
                case 'all':
                    Artisan::call('optimize:clear');
                    break;
                case 'cache':
                    Artisan::call('cache:clear');
                    break;
                case 'config':
                    Artisan::call('config:clear');
                    break;
                case 'route':
                    Artisan::call('route:clear');
                    break;
                case 'view':
                    Artisan::call('view:clear');
                    break;
                default:
                    return response()->json(['message' => 'Invalid cache type'], 400);
            }
            return response()->json(['message' => ucfirst($type) . ' cleared successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error clearing cache: ' . $e->getMessage()], 500);
        }
    }
}
