# TopValuableCoins Component

A React component that integrates with Zora's Coin SDK to display the top most valuable coins.

## Features

- **Real-time Data**: Fetches live data from Zora's Coins Protocol
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Shows skeleton loading while fetching data
- **Error Handling**: Graceful error handling with retry functionality
- **Interactive Elements**: Click to view coins on Zora explorer
- **Data Formatting**: Human-readable formatting for market cap, volume, and dates
- **Refresh Capability**: Manual refresh button to update data

## Usage

### Basic Usage

```tsx
import TopValuableCoins from '@/components/UI/TopValuableCoins';

function MyPage() {
  return (
    <div>
      <TopValuableCoins count={10} />
    </div>
  );
}
```

### With Custom Count

```tsx
// Display top 5 coins
<TopValuableCoins count={5} />

// Display top 20 coins
<TopValuableCoins count={20} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `10` | Number of coins to display |

## Data Displayed

For each coin, the component displays:

- **Rank**: Position in the top valuable coins list
- **Name & Symbol**: Coin name and ticker symbol
- **Market Cap**: Formatted market capitalization (B/M/K)
- **24h Volume**: Trading volume in the last 24 hours
- **Holders**: Number of unique holders
- **Created Date**: When the coin was created
- **External Link**: Button to view on Zora explorer

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Colors**: Indigo/purple gradient theme
- **Shadows**: Consistent with other UI components
- **Hover Effects**: Interactive hover states
- **Responsive Grid**: Adapts from 2-column to 4-column layout
- **Icons**: Lucide React icons for visual elements

## Dependencies

- `@zoralabs/coins-sdk` - Zora Coins SDK for data fetching
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- `react` - React hooks (useState, useEffect)

## Error Handling

The component handles various error scenarios:

- **Network Errors**: Displays error message with retry button
- **Empty Data**: Shows appropriate message when no coins are available
- **Loading States**: Skeleton loading animation during data fetch

## Performance

- **Efficient Rendering**: Only re-renders when data changes
- **Debounced Refresh**: Prevents excessive API calls
- **Optimized State**: Minimal state updates for better performance

## Integration Examples

### Dashboard Integration

The component is already integrated into the main dashboard at `/dashboard` and displays the top 10 most valuable coins.

### Standalone Page

A dedicated page is available at `/coins` that showcases the component with different configurations.

### Custom Pages

You can easily add this component to any page where you want to display trending coins data.

## API Reference

The component uses the `getCoinsMostValuable` function from Zora's Coin SDK:

```tsx
import { getCoinsMostValuable } from '@zoralabs/coins-sdk';

const response = await getCoinsMostValuable({
  count: 10,
  after: undefined, // for pagination
});
```

## Future Enhancements

Potential improvements could include:

- **Pagination**: Load more coins on demand
- **Filtering**: Filter by market cap range, creation date, etc.
- **Sorting**: Different sorting options (by volume, holders, etc.)
- **Real-time Updates**: WebSocket integration for live updates
- **Charts**: Visual representation of coin performance
- **Watchlist**: Save favorite coins for quick access
