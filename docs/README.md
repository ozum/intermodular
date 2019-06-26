---
home: true
heroImage: /images/hero.png
heroText: Intermodular
tagline: Create your own zero-config boilerplate easily.
actionText: Get Started →
actionLink: /nav.01.guide/
features:
  - title: File Operations
    details: Easy file operations between your boilerplate node.js module and target module.
  - title: PostInstall
    details: Ideal for postinstall scripts.
  - title: No Need to Eject
    details: Just update your module to update all configuration and files in target module.
footer: MIT Licensed | Copyright © 2019-present Özüm Eldoğan
---

### Create a `postinstall` script

Copy config files from your module to target module, introspect and update configurations, install additional modules...

```ts
const targetModule = intermodular.targetModule;
const packageJson = targetModule.getDataFileSync("package.json"); // `DataFile` instance

// Copy all config files from `.../your-module/common-config/` to `.../target-module/` (root).
intermodular.copySync("common-config", ".");
targetModule.install("lodash");
targetModule.executeSync("rm", ["-rf", "dist"]);
packageJson.set("description", `My awesome ${targetModule.name}`, { ifNotExists: true });

if (intermodular.targetModule.isTypeScript) {
  intermodular.copySync("config/tsconfig.json", ".");
}
```
