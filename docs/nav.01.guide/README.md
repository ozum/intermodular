# Introduction

Easy file operations between node.js modules and auto logging to help building zero-config boilerplates, postinstall and other scripts.

## Installation

`$ npm install intermodular`

or

`$ yarn add intermodular`

## Definitions

**Source Module** is the node module you would create for boilerplate using `Intermodular`.

**Target Module** is the node module that would install and use your boilerplate module.

For example you create `my-boilerplate` source module using `Intermodular`:

```
$ npm init my-boilerplate
$ npm install intermodular
```

Then you would install and use your boilerplate module in your project.

```
$ npm init my-project
$ npm install -D my-boilerplate
```
