# HTML Inspector

[![Build Status](https://secure.travis-ci.org/philipwalton/html-inspector.png)](http://travis-ci.org/philipwalton/html-inspector)

1. [Getting Started](#getting-started)
2. [Configuring HTML Inspector](#configuring-html-inspector)
3. [Built-in Rules](#built-in-rules)
4. [Writing Your Own Rules](#writing-your-own-rules)
5. [Overriding Rules Configurations](#overriding-rule-configurations)
6. [Custom Builds](#custom-builds)
7. [Browser Support](#browser-support)
8. [Running the Tests](#running-the-tests)
9. [Contributing](#contributing)
10. [FAQs](#faqs)

HTML Inspector is a highly-customizable, code quality tool to help you (and your team) write better markup. It aims to find a balance between the uncompromisingly strict W3C validator and having absolutely no rules at all (the unfortunate reality for most of us).

HTML Inspector is opinionated, but every rule is completely customizable, so you can take what you like and change what you don't. It's also easy to extend, allowing teams to write their own rules to enforce their chosen conventions.

For a more formal introduction, please refer to [this blog post](http://philipwalton.com/articles/introducing-html-inspector/) which goes into more detail as to why HTML Inspector was created and why you should consider using it.

## Getting Started

The easiest way to try out HTML Inspector is to link to the source file hosted on [CDNJS](http://cdnjs.com/):

```html
<script src="http://cdnjs.cloudflare.com/ajax/libs/html-inspector/0.4.0/html-inspector.js"></script>
```

Alternatively, [Bower](https://github.com/bower/bower) users can install HTML Inspector with the following command:

```sh
bower install html-inspector
```

If you clone the Github repo, just use the file at `dist/html-inspector.js`.

Once HTML Inspector is added, you can run `HTMLInspector.inspect()` to see the results. Calling `inspect` with no options will load all rules and run them with their default configuration options.

```html
<script src="path/to/html-inspector.js"></script>
<script> HTMLInspector.inspect() </script>
```
After the script runs, any errors will be reported to the console (unless you change this behavior). Here's an example of what you might see:

![Sample HTML Inspector Output](https://raw.github.com/philipwalton/html-inspector/master/img/html-inspector-console.png)

**Make sure you call `inspect` after any other DOM altering scripts have finished running or those alterations won't get inspected.**

## Configuring HTML Inspector

By default, HTML Inspector runs all added rules, starts traversing from the `<html>` element, and logs errors to the console when complete, but all of this can be customized.

The `inspect` method takes a config object to allow you to change any of this behavior. Here are the config options:

- **useRules**: (Array) a list of rule names to run when inspecting
- **domRoot**: (selector | element) the DOM element to start traversing from
- **exclude**: (selector | element | Array) any DOM element that matches the selector, element, or list of selectors/elements will be excluded from traversal (note: its descendants will still be traversed).
- **excludeSubTree**: (selector } element | Array) the descendants of any DOM element that matches the selector, element, or list of selectors/elements will be excluded from traversal.
- **onComplete**: (Function) the callback to be invoked when the inspection is finished. The function is passed an array of errors that were reported by individual rules.

Here are the default configuration values:

```js
config: {
  useRules: null,
  domRoot: "html",
  exclude: "svg",
  excludeSubTree: ["svg", "iframe"],
  onComplete: function(errors) {
    errors.forEach(function(error) {
      console.warn(error.message, error.context)
    })
  }
}
```

Here is how you might override the default configurations:

```js
HTMLInspector.inspect({
  useRules: ["some-rule-name", "some-other-rule-name"],
  domRoot: "body",
  exclude: "iframe",
  excludeSubTree: ["svg", "template"],
  onComplete: function(errors) {
    errors.forEach(function(error) {
      // report errors to external service...
    }
  }
})
```

For convenience, some of the config options may be passed as single arguments. If `.inspect()` receives an argument that is an array it is assume to be the `useRules` option, if it's an string or DOM element it's assumed to be the `domeRoot` option, and if its a function it's assumed to be the `onComplete` callback.

```js
// only set the useRules options
HTMLInspector.inspect(["some-rule-name", "some-other-rule-name"])

// only set the domRoot
HTMLInspector.inspect("#content")

// only set the onComplete callback
HTMLInspector.inspect(function(errors) {
  errors.forEach(function(error) {
    // report errors to an external service...
  }
})
```

## Built-in Rules ##

HTML Inspector ships with a set of built-in rules which fall into one of three main categories: validation, best-practices, and convention.

### Validation

HTML Inspector is different than a markup validator. Validators parse static markup, while HTML Inspector runs on a live DOM. This makes it a lot more powerful, but there are some drawbacks as well. Because HTML Inspector runs after the browser has parsed your HTML, any mistakes the browser has forgiven will not be seen by HTML Inspector.

As a result HTML Inspector should not be seen as a replacement for validation. It's simply another tool in the toolbox. That being said, there is still a lot that it can do (and does) to validate your markup.

Here are the validation rules that ship with HTML Inspector. (Expect this list to get more comprehensive in the future.)

- **Validate Elements**: Inspect each element in the DOM and reports any elements that are invalid or obsolete. This will catch simple things like misspelled tags (`<il>` instead of `<li>`), and it will inform you of deprecated tags (like `<center>`, `<font>`, and more recently `<hgroup>`). Any element you don't want to be warned about can be whitelisted.

- **Validate Element Location**: Make sure that elements don't appear as children of parents they're not allowed to descend from. An example of this is a block element like `<div>` appearing as the child of an inline elements like `<span>`.

- **Validate Attributes**: Like validating elements, this rule will let you know if you're using attributes that don't belong on a particular element or perhaps don't belong on any element. If your project uses custom attributes (like `ng-*` in AngularJS) they can be whitelisted.

- **Duplicate IDs**: Warn if non-unique IDs are found on the same page.

- **Unique Elements**: Warn if elements that should be unique (like `<title>` and `<main>`) appear more than once in the document.

### Best Practices

Some markup may be perfectly valid but use practices that are commonly considered to be poor or outdated. The following rules check for these types of things. (Note that everything in this list is subjective and optional.)

- **Inline Event Handlers**: Warn if inline event handlers, like `onclick="return false"` are found in the document. Inline event handlers are hard to manage, hard to debug, and completely non-reusable.

- **Script Placement**: Warn if script elements appear anywhere other than right before the closing `</body>` tag. Because JavaScript is blocking, adding `<script>` elements anywhere other than the end of the document may delay the loading of the page. If a script must appear somewhere other than the end of the doucment, it can be whitelisted.

- **Unused Classes**: Sometimes you'll remove a CSS rule from your stylesheet but forget to remove the class from the HTML. The "unused-classes" rule compares all the class selectors in the CSS to the classes in the HTML and reports any that aren't being used.

  Classes that are in the HTML as JavaScript hooks can be ignored via a whitelist. By default, any class prefixed with `js-`, `language-`, or `supports-` is whitelisted. More information on the rationale behind this rule can be found [here](http://philipwalton.com/articles/css-architecture/).

- **Unnecessary Elements**: Anytime you have a plain `<div>` or `<span>` element in the HTML with no class, ID or any other attribute, it's probably unnecessary or a mark of poor design.

  Elements with no semantic meaning should only be used for presentation. If the element has no attributes but is used for styling, it must be done through a rule like `.some-class > div { }` which is just asking for trouble. Again, more information can be found [here](http://philipwalton.com/articles/css-architecture/).

### Convention

The real power of HTML Inspector lies in its ability to enforce your team's chosen conventions. If you've decided that all groups of links should be contained in a `<nav>` element, or all `<section>` elements must contain a heading, you can write those rules, and an error will be thrown when someone breaks them.

Because convention is usually specific to individual teams, there's only one built-in rule in this category, but hopefully it'll get you thinking about rules your team could use.

- **BEM**: The increasingly popular [BEM](http://bem.info/) (block, element, modifier) methodology is a CSS naming convention that is very helpful for large projects. The problem is that using it correctly in the CSS is only half the battle. If it's not used correctly in the HTML it doesn't work either.

  This rule throws an error when an element class name is used but that element isn't a descendant of a block by the same name. It also errors when a modifier is used on a block or element without the unmodified class there too.

  *(Note: there are a few different BEM naming conventions out there. HTML Inspector support the [three most common](https://github.com/philipwalton/html-inspector/blob/master/src/rules/convention/bem-conventions.js#L3-L29))*

## Writing Your Own Rules

Rules are the bread and butter of HTML Inspector. They are where you check for problems and report errors.

Here's how you add new rules:

```js
HTMLInspector.rules.add(name, [config], func)
```

- **name**: (String) The `name` parameter is a string used to identify the rule. It must be unique.
- **config** *optional* (Object) The `config` parameter stores configuration data that is used by the rule. Anything that users of your rule might want to customize themselves should be set in the `config` object.
- **func**: (Function) The `func` parameter is an initialization function that is invoked as soon as you call `HTMLInspector.inspect()`. The function is passed three arguments `listener`, `reporter`, and `config`. The `listener` object is used to subscribe to events that are triggered as HTML Inspector is traversing the DOM. When problems are found, they can be reported to the `reporter` object. The `config` object is the same `config` that was passed to `HTMLInspector.rules.add`, though its properties may have been customized by other users between then and now.

### Events

The `listener` object can subscribe to events via the `on` method. Like with many other event binding libraries, `on` takes two parameters: the event name, and a callback function:

```js
listener.on(event, callback)
```

- **event**: (String) The name of the event. See below for a complete list of events.
- **callback**: (Function) A function to be invoked when the event occurs. The function will be passed certain arguments depending on the event type. See the event list below for argument details.

Here is a an example of binding a function to the "class" event:

```js
listener.on("class", function(className, domElement) {
  if (className == "foo" and element.nodeName.toLowerCase() == "bar") {
    // report the error
  }
})
```

Below is a complete list of events along with the arguments that are passed to their respective handlers. For events that occur on a DOM element, that element is passed as the final argument. It is also bound to the `this` context.

- **beforeInspect** : domRoot
- **element** : elementName, domElement
- **id**: idName, domElement
- **class**: className, domElement
- **attribute**: attrName, attrValue, domElement
- **afterInspect** : domRoot

### Reporting Errors

When you find something in the HTML that you to want warn about, you simply call the `warn` method on the `reporter` object.

```js
reporter.warn(rule, message, context)
```

- **rule**: (String) The rule name identifier.
- **message**: (String) The warning to report.
- **context**: (mixed) The context in which the rule was broken. This is usually a DOM element or collection of DOM elements, but doesn't have to be. It can be anything that helps the user track down where the error occurred.

Here's an example from the [validate-elements](https://github.com/philipwalton/html-inspector/blob/master/src/rules/validation/validate-elements.js) rule:

```js
reporter.warn(
  "validate-elements",
  "The <" + name + "> element is not a valid HTML element.",
  element
)
```

### An Example Rule

Imagine your team previously used the custom data attributes `data-foo-*` and `data-bar-*`, but now the convention is to use something else. Here's a rule that would warn users when they're using the old convention:

```js
HTMLInspector.rules.add(
  "deprecated-data-prefixes",
  {
    deprecated: ["foo", "bar"]
  },
  function(listener, reporter, config) {

    // register a handler for the `attribute` event
    listener.on('attribute', function(name, value, element) {

      var prefix = /data-([a-z]+)/.test(name) && RegExp.$1

      // return if there's no data prefix
      if (!prefix) return

      // loop through each of the deprecated names from the
      // config array and compare them to the prefix.
      // Warn if they're the same
      config.deprecated.forEach(function(item) {
        if (item === prefix) {
          reporter.warn(
            "deprecated-data-prefixes",
            "The 'data-" + item + "' prefix is deprecated.",
            element
          )
        }
      })
    }
  )
})
```

## Overriding Rule Configurations

Individual rules may or may not do exactly what you need, which is why most rules come with a configurations object that users can customize. A rule's configuration can be changed to meet your needs via the `extend` method of the `HTMLInspector.rules` object.

```js
HTMLInspector.rules.extend(rule, overrides)
```

- **rule**: (String) The rule name identifier.
- **overrides**: (Object | Function) An object (or function that returns an object) to be merged with the rule's config object. If `overrides` is a function, it will be passed the rule's config object as its first argument.

Here are two examples overriding the "deprecated-data-prefixes" rule defined above. The first example passes an object and the second passes a function:

```js
// using an object
HTMLInspector.rules.extend("deprecated-data-prefixes", {
  deprecated: ["fizz", "buzz"]
})

// using a function
HTMLInspector.rules.extend("deprecated-data-prefixes", function(config) {
  return {
    deprecated: config.deprecated.concat(["bazz"])
  }
})
```

Here are a few more examples. The following override the defaults of a few of the built-in rules.


```js
// use the `inuit.css` BEM naming convention
HTMLInspector.rules.extend("bem-conventions", {
  methodology: "inuit"
})

// add Twitter generated classes to the whitelist
HTMLInspector.rules.extend("unused-classes", {
  whitelist: /^js\-|^tweet\-/
})
```

## Custom Builds

HTML Inspector comes with a number of pre-built options to use directly in your projects.

- **html-inspector.js**: The full HTML Inspector code with all built-in rules prepackaged.
- **html-inspector.core.js**: The core library with none of the rules.
- **html-inspector.validation.js**: A package containing only the validation rules
- **html-inspector.best-practices.js**: A package containing only the best practice rules
- **html-inspector.convention.js**: A package containing only the convention rules

If the full version of HTML Inspector and all the built-in rules is too much, you can mix and match the core library with any combination of the packaged rule libraries as well as your own rules.

The build options for each of these is as follows:

```sh
# build everything
grunt

# build the core library
grunt dist:core

# build the validation ruleset
grunt dist:validation

# build the best-practices ruleset
grunt dist:best-practices

# build the convention ruleset
grunt dist:convention
```

To alter the custom builds, simply add or remove files from the directories inside of `src/rules`. But keep in mind that rules can be excluded both at build time and at runtime. In other words, you don't need a custom build to exclude certain rules. You also don't need a custom build to add new rules. It's perfectly OK to add new rules directly to the HTML source as separate files.

HTML Inspector uses [Grunt](http://gruntjs.com) which runs on [Node](http://nodejs.org/) to build and lint its source files as well as to run the [Jasmine](http://pivotal.github.io/jasmine/) tests.

If you don't have Node, NPM, and Grunt installed, refer to their documentation for installation instructions. Once they're installed, you can install the rest of the dependencies with the following commands:

```sh
# Install Node packages
npm install

# Install script dependencies
bower install
```

## Browser Support

HTML Inspector has been tested and known to work in the latest versions of all modern browsers including Chrome, Firefox, Safari, Opera, and Internet Explorer. It will not work in older browsers that do not support ES5 methods, the CSS Object Model, or `console.warn()`. Since HTML Inspector is primarily a development tool, it is not intended to work in browsers that aren't typically used for development and don't support modern Web standards.

If you need to test your site in older versions of IE and don't want to see JavaScript errors, simply wrap all your HTML Inspector code inside a conditional comment, so it is ignored by IE9 and below. Here is an example:

```html
<!--[if gt IE 9]><!-->
  <script src="path/to/html-inspector.js"></script>
  <script>HTMLInspector.inspect()</script>
<!--<![endif]-->
```

## Running the Tests

If Grunt and all the dependencies are installed, you can run the Jasmine tests with the following command.

```sh
grunt test
```

This creates a `spec-runner.html` file in the root directory and uses [PhantomJS](http://phantomjs.org/) to run the tests. If you prefer to run the tests in the browser, you can always fire up a local server and load `spec-runner.html` in the browser manually.

## Contributing

I'm always open to feedback and suggestions for how to make HTML Inspector better. All feedback from bug reports to API design is quite welcome.

If you're submitting a bug report, please search the issues to make sure there isn't one already filed.

If you're submitting a pull request please read [CONTRIBUTING.md](https://github.com/philipwalton/html-inspector/blob/master/CONTRIBUTING.md) before submitting.

## FAQs

The FAQs section has grown rather large, so it has been moved to its own page. You can find the [full FAQs here](https://github.com/philipwalton/html-inspector/blob/master/FAQs.md).