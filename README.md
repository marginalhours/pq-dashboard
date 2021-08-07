# pq-dashboard

`pq-dashboard` is a general purpose, lightweight, [FastAPI](https://fastapi.tiangolo.com/)-based web front-end and CLI tool to monitor your [PQ](https://github.com/malthe/pq/) queues and tasks.

[Sound familiar?](https://github.com/Parallels/rq-dashboard#introduction) Basically, `pq-dashboard` is to `pq` as `rq-dashboard` is to `rq`.

## Quickstart

### Installing from PyPI

`python -m pip install pq-dashboard`

Then run `pq-dashboard` with no arguments, which will start the server.

```
$ pq-dashboard
```

You may need to configure environment variables (see below) to connect to the PostGRES server where your `pq` queues are stored.

### Using docker

`pq-dashboard` can run as a docker container. The image can be built with `./scripts/build-image.sh`. This creates the `pq-dashboard:v0` image.

The easiest way to run locally is to use the host network:

```
docker run --net=host pq-dashboard:v0
```

The app will then be available on host port `9182` by default. In production, you may want to configure networking differently.

An environment file can be passed to `docker` like this:

```
docker run --env-file=.pq-dash.env --net=host pq-dashboard:v0
```

### CLI tool usage

The `pq-dashboard` command can also be used as a CLI tool for basic queue management.

```
$ pq-dashboard stats|cleanup|cancel-all <comma-separated list of queue names>
```

For more details, see the help messages on all the commands

## Environment variables

`pq-dashboard` will read config from environment variables prefixed with `PQ_DASH`.

| Variable                   | Default value | Explanation                                     |
| -------------------------- | ------------- | ----------------------------------------------- |
| `PQ_DASH_PGHOST`           | `localhost`   | Host the PostgreSQL server is running on.       |
| `PQ_DASH_PGPORT`           | `5432`        | Port the PostgreSQL server is running on.       |
| `PQ_DASHBOARD_PGUSER`      | `postgres`    | PostgreSQL user name to connect as.             |
| `PQ_DASHBOARD_PGPASSWORD`  | `postgres`    | Password for the PostgreSQL user.               |
| `PQ_DASHBOARD_DATABASE`    | `postgres`    | PostgreSQL database name containing queue table |
| `PQ_DASHBOARD_QUEUE_TABLE` | `queue`       | Name of queue table containing items            |

Alternatively, these variables can be stored in a plaintext `.pq-dash.env` file. Enviroment variables
will take precedence over the `.env` file.

## Development

To install dev dependencies, use:

```
poetry install
```

Then, install the [`pre-commit`](https://pre-commit.com/) hook:

```
pre-commit install
```

This ensures all commits will be linted properly.

To run the dev frontend, from the `pq_dashboard/frontend` directory run:

```
npm run dev
```

then to start the backend:

```
uvicorn pq_dashboard.main:app --reload --port 9182
```

The backend statically serves the frontend, but you will need to refresh the page to see your changes in the frontend code.
