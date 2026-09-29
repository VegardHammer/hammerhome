# hammerhome.no

The personal website for Vegard Hammer.

## Develop locally

This is a static site with no build step. Serve the folder with any local web server, for example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish

DNS remains unchanged. The recommended production deployment is a pull from the webhotel: it avoids relying on the host accepting incoming GitHub Actions SSH connections and needs no password or private key in the repository.

In the cPanel Terminal, run the following once:

```sh
git clone --branch main https://github.com/VegardHammer/hammerhome.git /home/hammelir/hammerhome
bash /home/hammelir/hammerhome/scripts/publish-webhotel.sh
```

The second command publishes the static site to `/home/hammelir/public_html`. It never deletes existing hosting files or subdomain directories; it only adds and updates the Hammerhome site files. Old WordPress folders can be removed later, after a separate backup and inventory.

Then add this command as a cPanel Cron Job running every five minutes:

```sh
/bin/bash /home/hammelir/hammerhome/scripts/publish-webhotel.sh >> /home/hammelir/hammerhome-deploy.log 2>&1
```

Each GitHub push reaches the site on the next five-minute run.

### GitHub Actions fallback

The `Publish to webhotel` workflow can also publish over SSH when run manually.

The GitHub repository needs these Actions secrets before the first deployment:

- `DEPLOY_SSH_HOST` — webhotel SSH hostname
- `DEPLOY_SSH_USER` — cPanel SSH username
- `DEPLOY_TARGET_PATH` — web-root path, normally `public_html`
- `DEPLOY_SSH_PRIVATE_KEY` — deploy key private key
- `DEPLOY_SSH_KNOWN_HOSTS` — pinned SSH host key

If the webhotel rejects public-key authentication, add `DEPLOY_SSH_PASSWORD` as a GitHub Actions secret containing the cPanel account password. The workflow will then use password-authenticated SFTP instead. The password is never stored in this repository or printed in the deployment log.

The deployment mirrors the project into the target path and removes obsolete site files, while preserving `.well-known` and `cgi-bin`.
