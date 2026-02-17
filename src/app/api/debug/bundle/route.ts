/**
 * Bundle Information API Endpoint
 * Provides bundle statistics and build information for monitoring
 */

import { NextResponse } from "next/server";

// ===========================================
// Vercel Runtime Configuration
// ===========================================
export const runtime = 'nodejs';

interface BundleInfo {
  buildId: string;
  timestamp: string;
  environment: string;
  version: string;
  bundles: {
    pages: string;
    static: string;
    framework: string;
    total: string;
  };
  optimization: {
    gzipEnabled: boolean;
    compressionEnabled: boolean;
    treeShakingEnabled: boolean;
    codeSplittingEnabled: boolean;
  };
}

/**
 * GET /api/debug/bundle
 * Returns bundle information for monitoring
 */
export async function GET() {
  try {
    // Get build info from environment
    const buildId = process.env.NEXT_BUILD_ID || 'development';
    const environment = process.env.NODE_ENV || 'development';
    const timestamp = new Date().toISOString();

    // Calculate approximate bundle sizes (this is a simplified version)
    // In production, you'd parse the actual build manifests
    const bundleInfo: BundleInfo = {
      buildId,
      timestamp,
      environment,
      version: require('../../../package.json').version,
      bundles: {
        pages: '~250KB (estimated)',
        static: '~150KB (estimated)',
        framework: '~100KB (estimated)',
        total: '~500KB (estimated)',
      },
      optimization: {
        gzipEnabled: true,
        compressionEnabled: true,
        treeShakingEnabled: true,
        codeSplittingEnabled: true,
      },
    };

    return NextResponse.json(bundleInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Bundle-Info': 'available',
      },
    });
  } catch (error) {
    console.error('[Bundle API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve bundle information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
