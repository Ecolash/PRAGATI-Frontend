# Agricultural AI Frontend

A modern Next.js front-end application for Agricultural AI solutions, including chat, crop recommendations, disease prediction, and more.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Prisma Setup](#prisma-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) package manager (optional but recommended)
- A PostgreSQL-compatible database (Neon, Supabase, or local Postgres)
- [Git](https://git-scm.com/) for version control

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Ecolash/Agricultural-AI-Frontend.git
   cd Agricultural-AI-Frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the project root based on the example below.

## Environment Variables

Create a `.env` file with the following variables:

```ini
# .env.example
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://agricultural-ai-frontend.vercel.app/"
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

- **DATABASE_URL**: Connection string for your PostgreSQL or Neon database.
- **NEXTAUTH_SECRET**: A random string used to encrypt NextAuth session tokens. You can generate one with:
  ```bash
  openssl rand -base64 32
  ```

## Prisma Setup

Prisma ORM is used for database schema migrations and client generation.

1. Generate Prisma client (runs automatically after install):

   ```bash
   pnpm prisma generate
   ```

2. Apply migrations to your database:

   ```bash
   pnpm prisma migrate dev --name init
   ```

3. (Optional) To reset your database and reapply all migrations:
   ```bash
   pnpm prisma migrate reset
   ```

## Available Scripts

In the project directory, you can run:

- `pnpm dev` or `pnpm run dev:frontend`  
  Runs the development server at [http://localhost:3000](http://localhost:3000).

- `pnpm run build`  
  Builds the application for production and generates the Prisma client.

- `pnpm start`  
  Runs the production build with `next start`.

- `pnpm run lint`  
  Lints code with ESLint.

- `pnpm run type-check`  
  Runs TypeScript type checking.

- `pnpm run dev:setup`  
  Helpful scripts for local development (see `scripts/dev-setup.sh help`).

## Project Structure

```
├── app/                     # Next.js app directory (app router)
├── components/              # Reusable React components
├── data/                    # Static data and agent configs
├── lib/                     # API wrappers, utilities, and services
├── prisma/                  # Prisma schema and migrations
├── public/                  # Static assets
├── scripts/                 # Utility scripts for setup
├── styles/                  # Global styles
├── types/                   # TypeScript type definitions
└── README.md                # Project documentation
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
