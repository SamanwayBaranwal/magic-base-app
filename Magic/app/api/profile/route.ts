import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.NEYNAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'NEYNAR_API_KEY not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const fidParam = searchParams.get('fid');
  if (!fidParam) {
    return NextResponse.json(
      { error: 'Missing fid' },
      { status: 400 }
    );
  }

  const fid = Number(fidParam);
  if (!Number.isInteger(fid) || fid < 1) {
    return NextResponse.json(
      { error: 'Invalid fid' },
      { status: 400 }
    );
  }

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': apiKey
      },
      next: { revalidate: 3600 } // Cache for 1 hour to reduce API calls
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      displayName: user.display_name,
      pfp_url: user.pfp_url,
      bio: user.profile?.bio?.text,
    });
  } catch (err) {
    console.error('[profile] Neynar error:', err);
    return NextResponse.json(
      { error: 'Profile lookup failed' },
      { status: 500 }
    );
  }
}
