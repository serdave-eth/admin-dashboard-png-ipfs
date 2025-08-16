# Zora Wallet Linking Feature Requirements

## Feature Overview

Add Zora wallet linking functionality to the existing admin dashboard using Privy's global wallet integration. This feature allows users to connect their Zora embedded wallet to their dashboard account and display both wallet addresses in the UI.

## Core Requirements

### 1. Zora Account Linking
- **Integration Method**: Privy Global Wallets using `useCrossAppAccounts` hook
- **Zora App ID**: `clpgf04wn04hnkw0fv1m11mnb`
- **Trigger**: Prompt user to link Zora account immediately after successful dashboard login
- **User Flow**:
  1. User completes primary wallet authentication
  2. System displays Zora linking prompt/modal
  3. User clicks "Link Zora Account" button
  4. Redirect to Zora domain for authorization
  5. User authorizes access on Zora's domain
  6. Redirect back to dashboard with linked account
  7. Display success message and show both wallets

### 2. Wallet Display Enhancement
- **Header Updates**:
  - Show primary wallet address (existing functionality, keep unchanged)
  - Add Zora wallet address display when linked
  - Use distinct visual styling to differentiate wallet types
  - Include copy-to-clipboard functionality for both addresses
  - Show connection status indicators
- **Wallet Information Section**:
  - Clear labels: "Dashboard Wallet" and "Zora Wallet"
  - Truncated addresses with full address on hover/click
  - Visual icons or badges to indicate wallet types

### 3. Linking Management
- **Link Button**: Show "Link Zora Account" if not yet linked
- **Re-link Option**: Allow users to re-link if needed
- **Status Display**: Clear indication of linking status (linked/not linked)
- **Error Handling**: Graceful handling of linking failures with retry options

## Technical Implementation

### Required Dependencies
- `@privy-io/react-auth` (should already be installed)
- Ensure `useCrossAppAccounts` hook is available

### Environment Variables
```
NEXT_PUBLIC_ZORA_APP_ID=clpgf04wn04hnkw0fv1m11mnb
```

### Database Schema Addition
```sql
-- Add columns to existing user table or create new linking table
ALTER TABLE user_accounts ADD COLUMN zora_wallet_address VARCHAR(42);
ALTER TABLE user_accounts ADD COLUMN zora_linked_at TIMESTAMP;

-- Alternative: Create dedicated linking table if user_accounts doesn't exist
CREATE TABLE wallet_links (
  id SERIAL PRIMARY KEY,
  primary_wallet_address VARCHAR(42) NOT NULL,
  zora_wallet_address VARCHAR(42),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(primary_wallet_address),
  INDEX idx_primary_wallet (primary_wallet_address)
);
```

### New API Endpoints

#### POST /api/user/link-zora
- **Purpose**: Store Zora wallet linking information
- **Authentication**: Required
- **Input**: Extract Zora wallet from Privy's linked accounts
- **Process**:
  1. Validate user is authenticated
  2. Extract Zora wallet address from cross-app account
  3. Store linking information in database
  4. Return updated wallet information

#### GET /api/user/wallets
- **Purpose**: Retrieve user's wallet information
- **Authentication**: Required
- **Output**: JSON with primary wallet and Zora wallet (if linked)

### New Components

#### `ZoraLinkingModal.tsx`
- Modal component for initial Zora linking prompt
- Explain benefits of linking Zora account
- Handle linking process and loading states

#### `WalletDisplaySection.tsx`
- Component to display both wallet addresses
- Handle copy-to-clipboard functionality
- Show linking status and management options

#### `ZoraLinkButton.tsx`
- Reusable button component for Zora linking actions
- Handle different states (link/re-link/loading)

### Custom Hooks

#### `useZoraLinking.ts`
```typescript
export const useZoraLinking = () => {
  const { linkCrossAppAccount } = useCrossAppAccounts();
  
  const linkZora = async () => {
    try {
      await linkCrossAppAccount({ appId: 'clpgf04wn04hnkw0fv1m11mnb' });
      // Handle success - update local state and database
    } catch (error) {
      // Handle linking errors
    }
  };

  return { linkZora, isLinking, error };
};
```

## User Experience Requirements

### Linking Flow
1. **Post-Login Prompt**: Immediately after successful dashboard login, show Zora linking modal
2. **Optional Flow**: Users can dismiss the prompt and link later from dashboard
3. **Clear Messaging**: Explain why linking Zora account is beneficial
4. **Progress Indication**: Show loading states during linking process

### Error Handling
- **User Declines**: Gracefully handle when user cancels linking
- **Linking Fails**: Show error message with retry option
- **Network Issues**: Handle timeout and connectivity problems
- **Already Linked**: Prevent duplicate linking attempts

### Visual Design
- **Wallet Type Indicators**: Use icons or color coding to distinguish wallets
- **Status Badges**: Clear visual indicators for linked/unlinked status
- **Responsive Design**: Ensure wallet display works on mobile devices

## Integration Points

### Existing Code Modifications
- **Header Component**: Update to display both wallets
- **User Context**: Extend to include Zora wallet information
- **Authentication Flow**: Add Zora linking step after primary auth

### Privy Configuration Updates
```typescript
// In Privy provider configuration
const privyConfig = {
  // ... existing config
  crossAppWallets: {
    enabled: true,
    supportedApps: ['clpgf04wn04hnkw0fv1m11mnb']
  }
};
```

## Success Criteria
1. Users are prompted to link Zora account after dashboard login
2. Users can successfully link their Zora embedded wallet
3. Dashboard header displays both primary and Zora wallet addresses
4. Users can manage Zora linking (link/re-link) from dashboard
5. Proper error handling for all linking scenarios
6. No impact on existing upload and content functionality
7. Responsive design works across all device sizes

## Edge Cases & Error Scenarios
- User doesn't have a Zora account
- User cancels linking process
- Network connectivity issues during linking
- Zora service is temporarily unavailable
- User tries to link multiple times
- User wants to unlink and re-link different Zora account

## Testing Requirements
- Unit tests for Zora linking hook
- Integration tests for linking API endpoints
- Component tests for wallet display
- End-to-end tests for complete linking flow
- Error scenario testing for all edge cases