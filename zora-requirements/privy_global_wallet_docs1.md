# Integrate a global wallet

## Overview

Privy allows you to easily integrate embedded wallets from other apps, to verify ownership of users' wallet addresses or even request signatures and transactions from.

This reduces friction around having users transact onchain in your app, as users can easily pull in their assets and identity from other apps where they may already have embedded wallets.

Within this setup, your app is known as the **requester** app.

### Finding available providers

To integrate embedded wallets from another app, first visit the **Privy Dashboard** and navigate to User management > Global Wallet > **Integrations** tab to see a list of provider app IDs that consent to sharing their wallets with other apps.

For any providers you'd like to integrate, note down the provider's Privy app ID, as you will use this value in the interfaces outlined below.

> **Note:** Some providers may only consent to sharing their users' wallets in read-only mode, in which case your app can verify that the user owns a particular address, but cannot request signatures or transactions from it.

## Login with a global wallet

**Platforms:** React | React Native

To prompt users to log into your app with an account from a provider app, use the `loginWithCrossAppAccount` method from the `useCrossAppAccounts` hook:

### Code Example

```javascript
import {usePrivy, useCrossAppAccounts} from '@privy-io/react-auth';

function Button() {
  const {ready, authenticated} = usePrivy();
  const {loginWithCrossAppAccount} = useCrossAppAccounts();

  return (
    <button
      onClick={() => loginWithCrossAppAccount({appId: 'insert-provider-app-id'})}
      disabled={!ready || !authenticated}
    >
      Log in with [insert-provider-app-name]
    </button>
  );
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appId` | string | required | The Privy app ID of the provider app from which you'd like a user to link their account. You can find a list of Privy app IDs for provider apps in the Cross-app ecosystem page of the Privy Dashboard. |

### Behavior

When `loginWithCrossAppAccount` is invoked, the user will be redirected to a page hosted on the domain of the provider app you specified to authorize access to your own app.

If the user successfully authorizes access, the user will be redirected back to your app, and an account of `type: 'cross_app'` will be added to the `linkedAccounts` array of their `user` object.

#### Error Conditions

`loginWithCrossAppAccount` will throw an error if:

- The user does not authorize access to your app or exits the flow prematurely.
- The provider app you request has not opted-in to share their wallets.
- The user does not already have an account with the provider app.

> **Note:** If the user is already logged in on the domain of the source `appId` you specify in `loginWithCrossAppAccount`, they will not have to login again and will only have to consent to sharing access to that account in your app.

### Using the Privy login modal

You can add any provider app to the list of login options in the Privy login modal by adding `"privy:"` + the provider's app ID to `loginMethodsAndOrder` in the Privy SDK configuration.

```javascript
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
  config={{
    loginMethodsAndOrder: {
      primary: ['email', 'google', 'privy:insert-provider-app-id'],
    },
    ...
  }}
>
```

## Linking a global wallet

**Platforms:** React | React Native

To prompt users to link their embedded wallet from a provider app, use the `linkCrossAppAccount` method from the `useCrossAppAccounts` hook:

### Code Example

```javascript
import {usePrivy} from '@privy-io/react-auth';

function Button() {
  const {ready, authenticated} = usePrivy();
  const {linkCrossAppAccount} = useCrossAppAccounts();

  return (
    <button
      onClick={() => linkCrossAppAccount({appId: 'insert-provider-app-id'})}
      disabled={!ready || !authenticated}
    >
      Link your [insert-provider-app-name] account
    </button>
  );
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `appId` | string | required | The Privy app ID of the provider app from which you'd like a user to link their account. You can find a list of Privy app IDs for provider apps in the Cross-app ecosystem page of the Privy Dashboard. |

## Behavior

When `linkCrossAppAccount` is invoked, the user will be redirected to a page hosted on the domain of the provider app you specified to authorize access to your own app.

If the user successfully authorizes access, the user will be redirected back to your app, and an account of `type: 'cross_app'` will be added to the `linkedAccounts` array of their `user` object.

### Error Conditions

`linkCrossAppAccount` will throw an error if:

- The user does not authorize access to your app or exits the flow prematurely.
- The provider app you request has not opted-in to share their wallets.
- The user is not `authenticated` and thus cannot link an account from the provider app to an existing account within your requester's app.

---

**Navigation:**
- ← [Login with a global wallet](previous-page)
- [Getting global wallets](next-page) →

---

*Powered by Mintlify*

**Source:** https://docs.privy.io/wallets/global-wallets/integrate-a-global-wallet/linking-a-global-wallet