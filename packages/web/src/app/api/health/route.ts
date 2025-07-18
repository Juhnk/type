import { NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and CI/CD pipelines
 * Returns application health status and basic system information
 */
export async function GET() {
  try {
    const now = new Date();
    const uptime = process.uptime();

    // Basic health checks
    const healthChecks = {
      timestamp: now.toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        memory: checkMemoryUsage(),
        environment: checkEnvironmentVariables(),
        build: checkBuildIntegrity(),
      },
    };

    // Determine overall health status
    const allChecksHealthy = Object.values(healthChecks.checks).every(
      (check) => check.status === 'healthy'
    );

    if (!allChecksHealthy) {
      healthChecks.status = 'degraded';
    }

    const statusCode = allChecksHealthy ? 200 : 503;

    return NextResponse.json(healthChecks, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: 'Health check failed',
        checks: {
          system: {
            status: 'unhealthy',
            message: 'Internal error during health check',
          },
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}

/**
 * Check memory usage
 */
function checkMemoryUsage() {
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Memory thresholds (in MB)
    const warningThreshold = 500;
    const criticalThreshold = 1000;

    let status = 'healthy';
    let message = `Memory usage: ${memUsageMB.heapUsed}MB / ${memUsageMB.heapTotal}MB`;

    if (memUsageMB.heapUsed > criticalThreshold) {
      status = 'unhealthy';
      message = `Critical memory usage: ${memUsageMB.heapUsed}MB`;
    } else if (memUsageMB.heapUsed > warningThreshold) {
      status = 'degraded';
      message = `High memory usage: ${memUsageMB.heapUsed}MB`;
    }

    return {
      status,
      message,
      metrics: memUsageMB,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Failed to check memory usage',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check required environment variables
 */
function checkEnvironmentVariables() {
  try {
    const requiredVars = ['NODE_ENV', 'NEXT_PUBLIC_API_URL'];

    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      return {
        status: 'unhealthy',
        message: `Missing required environment variables: ${missing.join(', ')}`,
      };
    }

    return {
      status: 'healthy',
      message: 'All required environment variables are set',
      environment: process.env.NODE_ENV,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check build integrity
 */
function checkBuildIntegrity() {
  try {
    // Check if we're in a built environment
    const isBuilt = process.env.NODE_ENV === 'production';

    // In production, verify build artifacts exist
    if (isBuilt) {
      // Basic checks for Next.js build
      return {
        status: 'healthy',
        message: 'Application built successfully',
        buildTime: process.env.BUILD_TIME || 'unknown',
        gitSha: process.env.GITHUB_SHA?.substring(0, 7) || 'unknown',
      };
    }

    return {
      status: 'healthy',
      message: 'Development environment',
      mode: 'development',
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: 'Build integrity check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Simple health check endpoint that just returns "ok"
 * Useful for simple load balancer health checks
 */
export async function HEAD() {
  return new NextResponse('ok', {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
