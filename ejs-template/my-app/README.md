## Jump straight to a key chapter

* [1. Get started](#1.-get-started)
  * [1.1. Starting the development server](#1.1.-starting-the-development-server)
  * [1.2. Template](#1.2.-template)
    * [1.2.1. Data flow](#1.2.1.-data-flow)
  * [1.3. Static Asset Handling](#1.3.-static-asset-handling)
    * [1.3.1. The `_public` Directory](#1.3.1.-the-`_public`-directory)
* [2. Building for Production](#2.-building-for-production)
  * [2.1. Public Base Path](#2.1.-public-base-path)
* [3. Deploying](#3.-deploying)
  * [3.1. Building The App](#3.1.-building-the-app)
  * [3.2. Testing The App Locally](#3.2.-testing-the-app-locally)
* [4. `.env` Files](#4.-`.env`-files)

---

## 1. Get started

### 1.1. Starting the development server

After install node_modules, you can start the development server by running the following command.

```sh
npm run dev
```

By default, the server starts on port 5173. You can view the app by visiting: http://127.0.0.1:5173/.

You can also expose your server to the network by running the following command.


```sh
npm run dev:external
```

### 1.2. Template

Using EJS. [EJS Docs](https://ejs.co/)

#### 1.2.1. Data flow

* **linklists objects**: The `linklists` object returns the set of the menus and links in your app. You can access a `menu` by calling its key on the linklists object. The `link` object has the following attributes:
  * `link.title`: Return the title of the link.
  * `link.url`: Return the url of the link.
  * `link.active`: Returns `true` if the link object is active, or `false` if the link object is inactive. The `link.active` property is useful for menu designs that highlight when top-level navigation categories are being viewed. An example of this would be a menu that highlights the "News" blog link when an article from that blog is being read.
  * `link.current`: Returns `true` if the page content associated with the link is considered a match to the current page. Returns `false` if the content isn't considered a match. `link.current` ignores URL parameters

---

### 1.3. Static Asset Handling

#### 1.3.1. The `_public` Directory

Assets in this directory will be served at root path `/` during dev, and copied to the root of the dist directory as-is.

Note that:

* You should always reference `public` assets using root absolute path - for example, `_public/icon.png` should be referenced in source code as `/icon.png`.
* Assets in `public` cannot be imported from JavaScript.

---

## 2. Building for Production

### 2.1. Public Base Path

If you are deploying your project under a nested public path (Ex: `/yourname/task/`), simply specify in `VITE_BASE_URL` in `env.production` and all asset paths will be rewritten accordingly.

JS-imported asset URLs, CSS `url()` references, and asset references in your `.html` files are all automatically adjusted to respect this option during build.

---

## 3. Deploying

### 3.1. Building The App

You may run `npm run build` command to build the app.

```sh
npm run build
```

By default, the build output will be placed at `dist`. You may deploy this dist folder to any of your preferred platforms.

### 3.2. Testing The App Locally

Once you've built the app, you may test it locally by running `npm run preview` command.

```sh
npm run build
npm run preview
# or
npm run preview:external
```

This command will boot up local static web server that serves the files from `dist` at `http://127.0.0.1:4173`. It's an easy way to check if the production build looks OK in your local environment.

---

## 4. `.env` Files

```
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

>**Env Loading Priorities**
>
>An env file for a specific mode (e.g. `.env.production`) will take higher priority than a generic one (e.g. `.env`).
>
>In addition, environment variables that already exist when Vite is executed have the highest priority and will not be overwritten by `.env` files.
>
>`.env` files are loaded at the start of Vite. Restart the server after making changes.

>**Note**
>
>Only variables prefixed with VITE_ are exposed to your App.

Example:
```
VITE_BASE_URL=/yourname/task/
```
