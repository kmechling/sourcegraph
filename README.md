# Sourcegraph

[![build](https://badge.buildkite.com/00bbe6fa9986c78b8e8591cffeb0b0f2e8c4bb610d7e339ff6.svg?branch=master)](https://buildkite.com/sourcegraph/sourcegraph)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

[Sourcegraph](https://about.sourcegraph.com/) is a fast, full-featured code search and navigation engine.

![Screenshot](https://user-images.githubusercontent.com/1646931/46309383-09ba9800-c571-11e8-8ee4-1a2ec32072f2.png)

**Features**

- Fast global code search with a hybrid backend that combines a trigram index with in-memory streaming
- Code intelligence for many languages via the [Language Server Protocol](https://langserver.org/)
- Enhances GitHub, GitLab, Phabricator, and other code hosts and code review tools via the [Sourcegraph browser extension](https://about.sourcegraph.com/docs/features/browser-extension/)
- Integration with third-party developer tools via the Sourcegraph Extension API

## Try it

- Try out the public instance on any open-source repository at [sourcegraph.com](https://sourcegraph.com/github.com/golang/go/-/blob/src/net/http/httptest/httptest.go#L41:6&tab=references).
- Install the free and open-source [browser extension](https://chrome.google.com/webstore/detail/sourcegraph/dgjhfomjieaadpoljlnidmbgkdffpack?hl=en).
- Spin up your own instance with the [quickstart installation guide](https://about.sourcegraph.com/docs).
- File feature requests and bug reports in [our issue tracker](https://github.com/sourcegraph/sourcegraph/issues).
- Visit [about.sourcegraph.com](https://about.sourcegraph.com) for more information about product features.

## Development

### Prerequisites

- Go (1.11 or later)
- Docker
- PostgreSQL (version 9)
- Node.js (version 8 or 10)
- Redis
- Yarn

For a detailed guide to installing prerequisites, see [these
instructions](https://github.com/sourcegraph/sourcegraph/blob/master/docs/local-development.md#step-2-install-git-go-docker-nodejs-postgresql-redis).

### Installation

1.  [Ensure Docker is running](https://github.com/sourcegraph/sourcegraph/blob/master/docs/local-development.md#step-5-start-docker)
1.  [Initialize the PostgreSQL database](https://github.com/sourcegraph/sourcegraph/blob/master/docs/local-development.md#step-4-initialize-your-database)
1.  Start the development server


```
./dev/launch.sh
```

Sourcegraph should now be running at http://localhost:3080.

For detailed instructions and troubleshooting, see the [local development documentation](./docs/local-development.md).

### Documentation

The `docs` folder has additional documentation for developing and understanding Sourcegraph:

- [Architecture](./docs/architecture.md): high-level architecture
- [Database setup](./docs/storage.md): database setup and best practices
- [Style guide](./docs/style.md)
- [GraphQL API](./docs/api.md): useful tips when modifying the GraphQL API

## Code of Conduct

All interactions with the Sourcegraph open source project are governed by the
[Sourcegraph Code of Conduct](./docs/conduct.md).