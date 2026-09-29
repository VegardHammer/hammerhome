# hammerhome.no

The personal website for Vegard Hammer.

## Develop locally

This is a static site with no build step. Serve the folder with any local web server, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish

Every push to `main` deploys the site through GitHub Pages. The production domain is `hammerhome.no`.

For the domain to resolve, configure its DNS at the registrar using GitHub Pages' current custom-domain records, then enable **Enforce HTTPS** in the repository's Pages settings once the DNS check succeeds.

