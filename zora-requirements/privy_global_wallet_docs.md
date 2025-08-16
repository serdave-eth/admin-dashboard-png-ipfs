# Integrate a global wallet

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