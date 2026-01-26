import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Viral Articles - Trending content from X';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0d10 0%, #1a1d24 50%, #0f1218 100%)',
        position: 'relative',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(52, 211, 153, 0.15)',
            borderRadius: '20px',
            marginBottom: '30px',
            border: '1px solid rgba(52, 211, 153, 0.3)',
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}
        >
          Viral Articles
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '28px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: '0',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Discover the most shared content on X, updated hourly
        </p>

        {/* Stats badges */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          {['Trending', 'Real-time', 'Analytics'].map(text => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ color: '#34d399', fontSize: '18px' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* URL at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '20px' }}>
          viralarticles.app
        </span>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
