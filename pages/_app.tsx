import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { SocketProvider } from '@/contexts/SocketContext';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Deep Talk Oracle - Meaningful Conversations</title>
        <meta name="description" content="Foster genuine connections through guided conversations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <AuthProvider>
        <SocketProvider>
          <GameProvider>
            <Component {...pageProps} />
          </GameProvider>
        </SocketProvider>
      </AuthProvider>
    </>
  );
}
