# Create AGL Template

The easiest way to get started the template by using `create-agl-template`. This CLI tool enables you to quickly start building a new project, with everything set up for you. To get started, use the following command:

## Install

```bash
npm run install:global
```

## Usage

You can create a new project running:
```bash
create-agl-template [project-directory]
```

You can also pass command line arguments to set up a new project non-interactively. See `create-agl-template --help`:
```bash
Usage: create-agl-template [project-directory] [options]

Create front end template with one command

Options:
  -v, --version              display the version number
  -t, --template <template>  select template
  --use-npm

    Explicitly tell the CLI to bootstrap the application using npm

  --use-pnpm

    Explicitly tell the CLI to bootstrap the application using pnpm

  --use-yarn

    Explicitly tell the CLI to bootstrap the application using Yarn
```
