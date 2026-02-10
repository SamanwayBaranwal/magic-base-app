import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NEYNAR_API_KEY not configured', displayName: null, pfp_url: null, bio: null },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fidParam = searchParams.get('fid');
  if (!fidParam) {
    return NextResponse.json(
      { error: 'Missing fid', displayName: null, pfp_url: null, bio: null },
      { status: 400 }
    );
  }

  const fid = Number(fidParam);
  if (!Number.isInteger(fid) || fid < 1) {
    return NextResponse.json(
      { error: 'Invalid fid', displayName: null, pfp_url: null, bio: null },
      { status: 400 }
    );
  }

  try {
    const config = new Configuration({ apiKey });
    const client = new NeynarAPIClient(config);
    const user = await client.lookupUserByFid({ fid });

    return NextResponse.json({
      displayName: user.result?.user?.display_name || null,
      pfp_url: user.result?.user?.pfp_url || null,
      bio: user.result?.user?.profile?.bio?.text || null,
    });
  } catch (err) {
    console.error('[profile] Neynar error:', err);
    return NextResponse.json(
      { error: 'Profile lookup failed', displayName: null, pfp_url: null, bio: null },
      { status: 500 }
    );
  }
}
