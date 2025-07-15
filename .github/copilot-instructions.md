# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an IP region lookup service built with the T3 stack (Next.js, TypeScript, tRPC, Prisma, Tailwind CSS).

## Key Features
- Input: Country/region codes (CN, US, JP) or names (中国, 美国, 日本)
- Output: IP address ranges for the specified country/region
- Multi-language support (Chinese and English)
- RESTful API with tRPC
- Database with Prisma ORM
- Responsive UI with Tailwind CSS

## Architecture
- Frontend: Next.js with App Router
- Backend: tRPC API routes
- Database: SQLite with Prisma
- Styling: Tailwind CSS
- Type Safety: TypeScript throughout

## Development Guidelines
- Use TypeScript for all code
- Follow T3 stack conventions
- Use Prisma for database operations
- Use tRPC for API endpoints
- Use Tailwind for styling
- Implement proper error handling
- Add input validation with Zod
- Support both country codes and names in queries
