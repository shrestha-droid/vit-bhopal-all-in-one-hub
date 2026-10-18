# Deploying this app

This is a frontend-only project -- there is no server and no database, so
it deploys as static files. Vercel and Netlify both host this free, with a
custom domain, in about two minutes.

## Vercel

1. Push this project to GitHub.
2. vercel.com > Add New > Project > import the repo.
3. Accept every default and deploy. `vercel.json` is already here and sets
   the build command, the output directory, and the single-page-app
   rewrite.

## Netlify

1. Push this project to GitHub.
2. app.netlify.com > Add new site > Import an existing project.
3. Accept the defaults. `netlify.toml` already carries the same settings.

## Why the SPA rewrite matters

Both config files send every path to `index.html`. Without that, the site
works until someone refreshes the page on any route other than `/`, or
opens a link to one directly -- and then the host looks for a file at that
path, finds nothing, and returns 404. It is the single most common way a
working React site appears broken after deploy.

## Running it locally

```bash
npm install
npm run dev
```

## If you later add a backend

The moment this project gains a `server/` folder, none of the above
applies -- Vercel and Netlify run serverless functions with read-only
filesystems and cannot host a real server with a database file. The
project's DEPLOY.md is rewritten with the right instructions at that
point, so follow whatever that file says rather than this.
