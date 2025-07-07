'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Database,
  Server,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastChecked: string;
  icon: React.ReactNode;
}

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  uptime: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export default function DevStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Frontend (Next.js)',
      url: 'http://localhost:3000',
      status: 'unknown',
      lastChecked: 'Never',
      icon: <Globe className="h-4 w-4" />,
    },
    {
      name: 'Backend API',
      url: 'http://localhost:8080/health',
      status: 'unknown',
      lastChecked: 'Never',
      icon: <Server className="h-4 w-4" />,
    },
    {
      name: 'Database',
      url: 'http://localhost:8080/api/status',
      status: 'unknown',
      lastChecked: 'Never',
      icon: <Database className="h-4 w-4" />,
    },
  ]);

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Never');

  const checkService = async (
    service: ServiceStatus
  ): Promise<ServiceStatus> => {
    const startTime = Date.now();

    try {
      const response = await fetch(service.url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        return {
          ...service,
          status: 'healthy',
          responseTime,
          lastChecked: new Date().toLocaleTimeString(),
        };
      } else {
        return {
          ...service,
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date().toLocaleTimeString(),
        };
      }
    } catch {
      return {
        ...service,
        status: 'unhealthy',
        lastChecked: new Date().toLocaleTimeString(),
      };
    }
  };

  const checkAllServices = useCallback(async () => {
    setIsChecking(true);

    try {
      const updatedServices = await Promise.all(
        services.map((service) => checkService(service))
      );

      setServices(updatedServices);
      setLastUpdate(new Date().toLocaleTimeString());

      // Get system info from API if available
      try {
        const systemResponse = await fetch('/api/health');
        if (systemResponse.ok) {
          const healthData = await systemResponse.json();
          setSystemInfo({
            nodeVersion: process.version,
            platform: navigator.platform,
            uptime: healthData.uptime || 'Unknown',
            memory: {
              used: 0,
              total: 0,
              percentage: 0,
            },
          });
        }
      } catch (error) {
        console.log('Could not fetch system info:', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [services]);

  useEffect(() => {
    checkAllServices();

    // Auto-refresh every 30 seconds
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, [checkAllServices]);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      healthy: 'default',
      unhealthy: 'destructive',
      unknown: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const overallStatus = services.every((s) => s.status === 'healthy')
    ? 'healthy'
    : services.some((s) => s.status === 'healthy')
      ? 'partial'
      : 'down';

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TypeAmp Development Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your development environment
          </p>
        </div>

        <Button
          onClick={checkAllServices}
          disabled={isChecking}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overallStatus === 'healthy' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {overallStatus === 'partial' && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            {overallStatus === 'down' && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Overall Status
          </CardTitle>
          <CardDescription>
            {overallStatus === 'healthy' && 'All systems operational'}
            {overallStatus === 'partial' && 'Some services experiencing issues'}
            {overallStatus === 'down' && 'Multiple services are down'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Last updated: {lastUpdate}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                {service.icon}
                {service.name}
              </CardTitle>
              {getStatusIcon(service.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(service.status)}

                {service.responseTime && (
                  <div className="text-muted-foreground text-xs">
                    Response time: {service.responseTime}ms
                  </div>
                )}

                <div className="text-muted-foreground text-xs">
                  Last checked: {service.lastChecked}
                </div>

                <div className="text-xs">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {service.url}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-sm font-medium">Node.js Version</div>
                <div className="text-muted-foreground text-sm">
                  {systemInfo.nodeVersion}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Platform</div>
                <div className="text-muted-foreground text-sm">
                  {systemInfo.platform}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Uptime</div>
                <div className="text-muted-foreground text-sm">
                  {systemInfo.uptime}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Environment</div>
                <div className="text-muted-foreground text-sm">Development</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common development tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" size="sm" asChild>
              <a
                href="http://localhost:8080/health"
                target="_blank"
                rel="noopener noreferrer"
              >
                API Health
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="http://localhost:8080/api/words/english1k"
                target="_blank"
                rel="noopener noreferrer"
              >
                Test API
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/')}
            >
              Go to App
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Development Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Development Commands</CardTitle>
          <CardDescription>Useful commands for development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-muted rounded px-2 py-1">
                npm run dev:health
              </code>{' '}
              - Check service health
            </div>
            <div>
              <code className="bg-muted rounded px-2 py-1">
                npm run dev:reset
              </code>{' '}
              - Reset environment
            </div>
            <div>
              <code className="bg-muted rounded px-2 py-1">
                npm run troubleshoot
              </code>{' '}
              - Fix common issues
            </div>
            <div>
              <code className="bg-muted rounded px-2 py-1">
                npm run db:studio
              </code>{' '}
              - Open database GUI
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
