# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d9787722-87b6-4104-bd5d-0fd80bb9f566

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d9787722-87b6-4104-bd5d-0fd80bb9f566) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d9787722-87b6-4104-bd5d-0fd80bb9f566) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Code Quality Notes

This project follows modern TypeScript best practices with gentle quality improvements:

### Environment Configuration
- Centralized environment variables in `src/config/env.ts` with runtime validation
- Development errors for missing required variables, graceful fallbacks in production

### Logging
- Production-safe logging utility in `src/utils/log.ts`
- `log.debug()` calls are automatically stripped from production builds
- Use `log.debug()` for verbose development logging, `log.info/warn/error()` for production logs

### TypeScript Safety
- Strict TypeScript configuration with readonly interfaces where appropriate
- Type guards and safe unknown handling in `src/types/common.ts`
- Enhanced error boundaries with proper typing

### Performance
- React.memo applied to stable leaf components like StatPill
- Single shared Supabase client instance with centralized configuration
- Terser configured to strip debug logs and optimize production builds

### Accessibility
- Added aria-labels to interactive elements without visible text
- Proper button semantics and screen reader support
- Alt attributes on images (empty alt for decorative images is acceptable)

### Security
- Single Supabase client instance prevents configuration drift
- Environment variables centralized with validation
- TODO comments mark areas requiring SQL injection review

### Debug Features
- Enhanced debug kit with URL-based activation (`?debug=1` or `#debug`)
- Production-safe debug log stripping
- Service Worker diagnostics and kill switch (`?nosw=1`)

To toggle debug features:
- Add `?debug=1` to any URL for temporary debugging
- Add `VITE_DEBUG_HARDRELOAD=1` to `.env` for persistent debugging
- Press `Ctrl+Alt+D` or `Shift+Alt+D` to toggle debug overlay
