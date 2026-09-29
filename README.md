# hammerhome.no

The personal website for Vegard Hammer.

## Develop locally

This is a static site with no build step. Serve the folder with any local web server, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish

Every push to `main` publishes the static files to the production webhotel over SSH. DNS remains unchanged.

The GitHub repository needs these Actions secrets before the first deployment:

- `DEPLOY_SSH_HOST` — webhotel SSH hostname
- `DEPLOY_SSH_USER` — cPanel SSH username
- `DEPLOY_TARGET_PATH` — web-root path, normally `public_html`
- `DEPLOY_SSH_PRIVATE_KEY` — deploy key private key
- `DEPLOY_SSH_KNOWN_HOSTS` — pinned SSH host key

The deployment mirrors the project into the target path and removes obsolete site files, while preserving `.well-known` and `cgi-bin`.
