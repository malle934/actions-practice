# actions-practice

Small Express + Postgres app with tests, coverage, lint and a Dockerfile, for practicing GitHub Actions.

## Run locally

```bash
npm install
npm run test:local   # console output (database tests are skipped without DATABASE_URL)
npm test             # writes test-results.xml (JUnit)
npm run coverage     # writes coverage/ (fails below 80% lines, needs the database, see below)
npm run lint
npm start            # http://localhost:3000
```

Endpoints: `GET /`, `GET /health`, `GET /planets`, `GET /planets/:id`, `POST /add` with `{"a":1,"b":2}`.
Database endpoints (need `DATABASE_URL`): `GET /db-health`, `GET /notes`, `POST /notes` with `{"text":"hello"}`.

## Database

The app uses Postgres through the `pg` package and reads one variable:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/appdb
```

- Without `DATABASE_URL`, the 7 unit tests run and the 4 database tests are skipped.
- With it, all 11 tests run. Tables are created automatically.
- Locally: `docker compose up -d db`, then export `DATABASE_URL` as above.
- `npm run coverage` fails the 80% threshold without a database, because the `/notes` routes are never hit. Your coverage job needs the Postgres service container too.

## Setup

1. Create a new GitHub repo and push this folder to `main`.
2. Open the Actions tab. `ci.yml` is a minimal starter workflow, already working (it skips the database tests).
3. Do the exercises on `feature/*` branches, one at a time.

## Exercises (in order)

1. **Env vars and secrets.** Add workflow-level `env:` with `APP_NAME` (plain value) and `API_KEY` (from a repository secret). Print `APP_NAME` in a step. Confirm the secret is masked in the log.
2. **Matrix.** Run unit tests on Node 18, 20, 22 and on ubuntu-latest and macos-latest. Exclude one combination. Make artifact names unique per matrix job.
3. **Cache.** Add `actions/cache@v4` for `node_modules` keyed on `package-lock.json`. Push twice and compare install time. Then try `cache: npm` on setup-node instead.
4. **Service container.** Add a job `integration-testing` with a Postgres service and run the full test suite against it:
   ```yaml
   integration-testing:
     runs-on: ubuntu-latest
     services:
       postgres:
         image: postgres:16
         env:
           POSTGRES_USER: postgres
           POSTGRES_PASSWORD: postgres
           POSTGRES_DB: appdb
         ports:
           - 5432:5432
         options: >-
           --health-cmd "pg_isready -U postgres"
           --health-interval 5s
           --health-timeout 3s
           --health-retries 10
   ```
   Set `DATABASE_URL: postgres://postgres:postgres@localhost:5432/appdb` as an env var on the test step. Confirm the log shows 11 passing, 0 pending. Then break it: remove the health options, or use the wrong password, and read the failure.
5. **Separate jobs.** Add a `code-coverage` job (it needs the same service container and `DATABASE_URL`) and a `lint` job. Upload the `coverage/` folder as an artifact.
6. **Job dependencies.** Add a `docker` job with `needs: [unit-testing, integration-testing, code-coverage, lint]` that builds the image (`docker build -t actions-practice:${{ github.sha }} .`).
7. **Conditionals.** Run the docker job only on `main` using `if: github.ref == 'refs/heads/main'`. Add a step that runs only on failure using `if: failure()`.
8. **Triggers.** Add `pull_request` to `main`, a `schedule` cron, and `paths-ignore: ['**.md']` on push.
9. **Break and debug.** Change a test so it fails, read the log, fix it. Set `continue-on-error: true` on coverage and see the difference.
10. **Push the image.** Log in to GHCR with `docker/login-action` using `GITHUB_TOKEN` and push the image with `docker/build-push-action`. Needs `permissions: packages: write`.
11. **Reusable workflow.** Move the test steps into `.github/workflows/test.yml` with `on: workflow_call` and call it from `ci.yml`.
12. **Stretch: container job.** Run the integration job with `container: node:20` instead of directly on the runner. The host in `DATABASE_URL` must change from `localhost` to the service name `postgres`. Work out why.
