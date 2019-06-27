# Intermodular

> Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

### 🏠 [Homepage](https://intermodular.ozum.net)

## Install

```sh
npm install intermodular
```

# Usage

See [Homepage](https://intermodular.ozum.net) for full documentation and API.

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


## Author

👤 **Özüm Eldoğan**

* Github: [@ozum](https://github.com/ozum)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Özüm Eldoğan](https://github.com/ozum).<br />
This project is [MIT](https://github.com/ozum/intermodular/blob/master/LICENSE) licensed.
