import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const HASHTAG = '#MagicInPublic';
const CAST_LIMIT = 10;

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NEYNAR_API_KEY not configured', verified: false },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fidParam = searchParams.get('fid');
  if (!fidParam) {
    return NextResponse.json(
      { error: 'Missing fid', verified: false },
      { status: 400 }
    );
  }

  const fid = Number(fidParam);
  if (!Number.isInteger(fid) || fid < 1) {
    return NextResponse.json(
      { error: 'Invalid fid', verified: false },
      { status: 400 }
    );
  }

  try {
    const config = new Configuration({ apiKey });
    const client = new NeynarAPIClient(config);
    const feed = await client.fetchCastsForUser({
      fid,
      limit: CAST_LIMIT,
    });

    const casts = feed.casts ?? [];
    const hasMagicInPublic = casts.some(
      (cast) => cast.text && cast.text.includes(HASHTAG)
    );

    return NextResponse.json({ verified: hasMagicInPublic });
  } catch (err) {
    console.error('[verify] Neynar error:', err);
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    );
  }
}
