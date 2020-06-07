---
home: true
heroImage: /images/hero.png
heroText: Intermodular
tagline: Create your own zero-config boilerplate easily.
actionText: Get Started →
actionLink: /nav.01.guide/
features:
  - title: File Operations
    details: Easy file operations between your boilerplate module and target module.
  - title: PostInstall
    details: Ideal for postinstall scripts.
  - title: No Need to Eject
    details: Just update your module to update all configuration and files in target module.
footer: MIT Licensed | Copyright © 2019-present Özüm Eldoğan
---

## Example: `postinstall` Script

Assuming you create a boilerplate called `my-boiler` for all your TypeScript projects and will be using it form a project called `my-project`.

Below is example parts of a `postinstall` script for your own boilerplate (`my-boilerplate/src/index.ts`). Your boilerplate can copy files, read, edit and delete config files conditinally, install `node` modules and more in your target project module `my-project`.

### Create Instance

```ts
import Intermodular from "intermodular";

const intermodular = await Intermodular.new();
const targetModule = intermodular.targetModule;
```

### Copy, Edit & Save Config Files

Copy all config files from your boilerplate to your `my-project` TypeScript project.

```ts
 // Copy all files from `my-boilerplate/config/` to `my-project/`
await intermodular.copy("config", ".");

// Update project's `package.json`.
targetModule.package.set("description", `My awesome project of ${targetModule.name}`);

// Get some deep data from cosmiconfig compatible config file from `my-project/.my-boilerplaterc` or any cosmiconfig compatible way automatically.
const buildFlags = intermodular.config.get("build.flags");
targetModule.package.set("scripts.build": `tsc ${buildFlags}`);

// Read and update target eslint configuration.
const eslintConfig = await targetModule.read("eslint", { cosmiconfig: true });
eslintConfig.set("rules.lines-between-class-members", ["warn", "always", { exceptAfterSingleLine: true }]);

await targetModule.saveAll();
```

### Install Modules & Execute Commands

Install modules into `my-project`.

```ts
await targetModule.install("lodash");
await targetModule.execute("tsc", ["-b"]);
```

### Use from `my-project`

`$ npm install -D my-boilerplate`
