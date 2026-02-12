import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const testUser = 'karpathy';
  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${testUser}`;

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    testUser,
    url,
  };

  try {
    const start = Date.now();
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    diagnostics.fetchMs = Date.now() - start;
    diagnostics.status = response.status;
    diagnostics.statusText = response.statusText;
    diagnostics.headers = Object.fromEntries(response.headers.entries());

    const html = await response.text();
    diagnostics.htmlLength = html.length;
    diagnostics.htmlSnippet = html.substring(0, 500);

    // Try to parse __NEXT_DATA__
    const nextDataPattern = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(nextDataPattern);
    diagnostics.hasNextData = !!match;

    if (match?.[1]) {
      try {
        const data = JSON.parse(match[1]);
        const entries = data?.props?.pageProps?.timeline?.entries ?? [];
        diagnostics.totalEntries = entries.length;

        const tweets = entries.filter((e: { type?: string }) => e.type === 'tweet');
        diagnostics.tweetEntries = tweets.length;

        if (tweets.length > 0) {
          const first = tweets[0]?.content?.tweet;
          diagnostics.sampleTweet = {
            id: first?.id_str,
            text: (first?.text || '').substring(0, 100),
            likes: first?.favorite_count,
            retweets: first?.retweet_count,
            author: first?.user?.screen_name,
            created: first?.created_at,
          };
        }
      } catch (parseErr) {
        diagnostics.jsonParseError = String(parseErr);
      }
    }
  } catch (err) {
    diagnostics.error = String(err);
    diagnostics.errorName = err instanceof Error ? err.name : 'unknown';
    diagnostics.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
