import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  config: {
    embeddedWallets: {
      createOnLogin: 'off' as const,
      noPromptOnSignature: false,
    },
    loginMethods: ['wallet'],
    appearance: {
      theme: 'light' as const,
      accentColor: '#6366F1' as `#${string}`,
      logo: '/logo.png',
    },
  } as PrivyClientConfig,
};