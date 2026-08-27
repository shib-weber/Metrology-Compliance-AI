# Glowinn — Made for Modern Elegance

A full-viewport video-hero landing page (React + Vite).

## ⚠️ One manual step required: the hero video

This sandbox's network egress only allows a fixed list of package-registry domains
(npm, pypi, github, etc.), and the asset host below is not on that list, so the
build could not fetch it automatically:

```
https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/glowinn/hero.mp4
```

Before running the project, download that file yourself and place it at
`public/hero.mp4`:

```bash
mkdir -p public
curl -L -o public/hero.mp4 "https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/glowinn/hero.mp4"
```

Every reference in the code is already local and root-relative (`/hero.mp4`) —
the URL above appears nowhere in the project source, only in this note.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
```
