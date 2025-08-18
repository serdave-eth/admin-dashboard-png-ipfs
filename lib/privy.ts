import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  config: {
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
      noPromptOnSignature: false,
    },
    loginMethods: ['wallet', 'email', 'farcaster'],
    appearance: {
      theme: 'light' as const,
      accentColor: '#6366F1' as `#${string}`,
      logo: '/logo.png',
    },
    crossAppWallets: {
      enabled: true,
      supportedApps: [process.env.NEXT_PUBLIC_ZORA_APP_ID || 'clpgf04wn04hnkw0fv1m11mnb']
    }
  } as PrivyClientConfig,
};