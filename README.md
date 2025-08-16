# Admin Dashboard

A Next.js TypeScript admin dashboard for uploading and managing content on IPFS via Pinata.

## Features

- 🔐 Wallet authentication via Privy (external wallets only)
- 📤 File upload to IPFS via Pinata API
- 📁 Support for PNG image files
- 📜 Endless scroll content feed
- 🎨 Responsive design with TailwindCSS
- 🔍 IPFS CID display with copy functionality

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Privy account and app ID
- Pinata account with API keys

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.local` and fill in your credentials:
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_key
   PINATA_JWT=your_pinata_jwt_token
   DATABASE_URL=postgresql://user:password@localhost:5432/admin_dashboard
   ```

3. **Setup database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
admin-dashboard/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard page
│   └── page.tsx     # Landing page
├── components/       # React components
│   ├── Auth/        # Authentication components
│   ├── Content/     # Content display components
│   ├── Upload/      # File upload components
│   └── UI/          # UI components
├── lib/             # Utility functions
├── prisma/          # Database schema
└── types/           # TypeScript types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Configuration

### Privy Setup
1. Create a Privy app at [privy.io](https://privy.io)
2. Disable embedded wallets in settings
3. Copy your app ID to `.env.local`

### Pinata Setup
1. Create a Pinata account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys from the dashboard
3. Copy keys to `.env.local`

### Database Setup
1. Install PostgreSQL
2. Create a new database
3. Update `DATABASE_URL` in `.env.local`
4. Run migrations with `npm run prisma:migrate`

## File Limits

- **Max file size:** 100MB
- **Supported format:** PNG images only

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
Build the project and deploy the `.next` folder:
```bash
npm run build
npm run start
```

## Troubleshooting

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### Privy authentication issues
- Verify NEXT_PUBLIC_PRIVY_APP_ID is correct
- Check that embedded wallets are disabled
- Ensure wallet is connected

### Pinata upload issues
- Verify API keys are correct
- Check file size limits
- Ensure proper file types

## License

MIT