# HTML Inspector

1. [Getting Started](#getting-started)
2. [Configuring HTML Inspector](#configuring-html-inspector)
3. [Built-in Rules](#built-in-rules)
4. [Writing Your Own Rules](#writing-your-own-rules)
5. [Overriding Rules Configurations](#overriding-rule-configurations)
6. [Custom Builds](#custom-builds)
7. [Running the Tests](#running-the-tests)
8. [Contributing](#contributing)
9. [What's Next](#whats-next)

HTML Inspector is a highly-customizable, code quality tool to help you (and your team) write better markup. It aims to find a balance between the uncompromisingly strict W3C validator and having absolutely no rules at all (the unfortunate reality for most of us).

HTML Inspector is opinionated, but every rule is completely customizable, so you can take what you like and change what you don't. It's also easy to extend, allowing teams to write their own rules to enforce their chosen conventions.

## Getting Started

The easiest way to get started is to simply download the full source from `dist/html-inspector.js` and add it to the bottom of your page, then call `HTMLInspector.inspect()`.

Calling `inspect` with no options will load all rules and run them with their default configuration options. *(Note: HTML Inspector requires jQuery, so if you're not already including it on your page, you'll need to.)*

```html
<script src="path/to/html-inspector.js"></script>
<script> HTMLInspector.inspect() </script>
```
After the script runs, any errors will be reported to the console (unless you change this behavior). Here's an example of what you might see:

![Sample HTML Inspector Output](https://raw.github.com/philipwalton/html-inspector/master/img/html-inspector-console.png)

Make sure you call `inspect` after any other DOM altering scripts have finished running or those alterations won't get inspected.

## Configuring HTML Inspector

By default, HTML Inspector runs all added rules, starts traversing from the `<html>` element, and logs errors to the console when complete, but all of this can be customized.

The `inspect` method takes a config object to allow you to change any of this behavior. Here are the config options:

- **useRules**: (Array) a list of rule names to run when inspecting
- **domRoot**: (selector | element | jQuery) the DOM element to start traversing from
- **onComplete**: (Function) the callback to be invoked when the inspection is finished. The function is passed an array of errors that were reported by individual rules.

Here's an example:

```js
HTMLInspector.inspect({
  useRules: ["some-rule-name", "some-other-rule-name"],
  domRoot: "body",
  onComplete: function(errors) {
    errors.forEach(function(error) {
      // report errors to external service...
    }
  }
})
```

Alternatively, if you only need to set a single configuration option, you don't need to pass an object, the `inspect` method will figure out what it is based on its type.

```js
// only set the useRules options
HTMLInspector.inspect(["some-rule-name", "some-other-rule-name"])

// only set the domRoot
HTMLInspector.inspect($("#foobar"))

// only set the onComplete callback
HTMLInspector.inspect(function(errors) {
  errors.forEach(function(error) {
    // report errors to external service...
  }
})
```

## Built-in Rules ##

HTML Inspector ships with a base set of rules which fall into one of three main categories: validation, best-practices, and convention.

### Validation

HTML Inspector is different than a markup validator. Validators parse static markup, while HTML Inspector runs on a live DOM. This makes it a lot more powerful, but there are some drawbacks as well. Because HTML Inspector runs after the browser has parsed your HTML, any mistakes the browser has forgiven will not be seen by HTML Inspector.

As a result HTML Inspector should not be seen as a replacement for validation. It's simply another tool in the toolbox. That being said, there is still a lot that it can do (and does) to validate your markup.

Here are the validation rules that ship with HTML Inspector. (Expect this list to get more comprehensive in the future.)

- **Validate Elements**: Inspect each element in the DOM and reports any elements that are invalid or obsolete. This will catch simple things like misspelled tags (`<il>` instead of `<li>`), and it will inform you of deprecated tags (like `<center>`, `<font>`, and more recently `<hgroup>`). Any element you don't want to be warned about can be whitelisted.

- **Validate Attributes**: Like validating elements, this rule will let you know if you're using attributes that don't belong on a particular element or perhaps don't belong on any element. If your project uses custom attributes (like `ng-*` in AngularJS) they can be whitelisted.

- **Duplicate IDs**: Warn if non-unique IDs are found on the same page.

- **Unique Elements**: Warn if unique elements that should be unique (like `<title>` and `<main>`) appear more than once in the document.

- **Scoped Styles**: `<style>` elements that appear outside of the document `<head>` are required to have a scoped attribute.

### Best Practices

Some markup may be perfectly valid but use practices that are commonly considered to be poor or outdated. The following rules check for these types of things. (Note that everything in this list is subjective and optional.)

- **Inline Event Handlers**: Warn if inline event handlers, like `onclick="return false"` are found in the document. Inline event handlers are hard to manage, hard to debug, and completely non-reusable.

- **Script Placement**: Warn if script elements appear anywhere other than right before the closing `</body>` tag. Because JavaScript is blocking, adding `<script>` elements anywhere other than the end of the document may delay the loading of the page. If a script must appear somewhere other than the end of the doucment, it can be whitelisted.

- **Unused Classes**: Sometimes you'll remove a CSS rule from your stylesheet but forget to remove the class from the HTML. The "unused-classes" rule compares all the class selectors in the CSS to the classes in the HTML and reports any that aren't being used.

  Classes that are in the HTML as JavaScript hooks can be ignored via a whitelist. By default, any class prefixed with `js-`, `language-`, or `supports-` is whitelisted. More information on the rationale behind this rule can be found [here](http://philipwalton.com/articles/css-architecture/).

- **Unnecessary Elements**: Anytime you have a plain `<div>` or `<span>` element in the HTML with no class, ID or any other attribute, it's probably unnecessary or a mark of poor design.

  Elements with no semantic meaning should only be used for presentation, but if the element has no attributes it means the styling is done through a rule like `.some-class > div { }` which is just asking for trouble. Again, more information can be found [here](http://philipwalton.com/articles/css-architecture/).

### Convention

The real power of HTML Inspector lies in its ability to enforce your teams chosen conventions. If you've decided that all groups of links should be contained in a `<nav>` element, or all `<section>` elements must contain a heading, you can write those rules, and an error will be thrown when someone breaks them.

Because convention is usually specific to individual teams, there's only one built-in rule in this category, but hopefully it'll get you thinking about rules your team could use.

- **BEM**: The increasingly popular BEM (block, element, modifier) methodology is a CSS naming convention that is very helpful for large projects. The problem is that using it correctly in the CSS is only half the battle. If it's not used correctly in the HTML it doesn't work either.

  This rule throws an error when an element class name is used but that element isn't a descendant of a block by the same name. It also errors when a modifier is used on a block or element without the unmodified class there too.

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

The `listener` object can subscribe to events via the `on` method. Like with many other event binding libraries, `on` takes two arguments: the event name, and a callback function:

```js
listener.on(event, callback)
```

- **event**: (String) The name of the event. See below for a complete list of events.
- **callback**: (Function) A function to be invoked when the event occurs. The function will be passed certain argument depending on the event type. See the event list below for argument details.

Here is a an example of binding a function to the event "class":

```js
listener.on("class", function(className, domElement) {
  if (className === "foo" and element.nodeName.toLowerCase() == "bar") {
    // report the error
  }
})
```

Below is a complete list of events along with the arguments that are passed to their respective callback functions. For events that occur on a DOM element, the element is passed as the final argument. It is also bound to the `this` context.

- **beforeInspect** : domRoot
- **element** : elementName, domElement
- **id**: idName, domElement
- **class**: className, domElement
- **attribute**: name, value, domElement
- **afterInspect** : domRoot

### Reporting Errors

When you find something in the HTML that you to want warn about, you simply call the `warn` method on the `reporter` object.

```js
reporter.warn(rule, message, context)
```

- **rule**: (String) The rule name identifier.
- **message**: (String) The warning to report.
- **context**: (mixed) The context in which the rule was broken. This is usually a DOM element or collection of DOM elements, but doesn't have to be. It can be anything that helps the user track down where the error occurred.

Here's an example from the "validate-elements" rule:

```js
reporter.warn(
  "validate-elements",
  "The <" + name + "> element is not a valid HTML element.",
  element
)
```

### An Example Rule

Imagine your team previously used a custom data attribute `data-foo-*`, but now the convention is to use `data-bar-*` instead. Here's a rule that would warn users when they're using the old convention:

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

Here are two examples overriding the "deprecated-data-prefixes" rule defined above. The first method passes an object and the second passes a function:

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

HTML Inspector uses [Grunt](http://gruntjs.com) which runs on [Node](http://nodejs.org/) to build and minify its source files as well as to run the [Jasmine](http://pivotal.github.io/jasmine/) tests. If you don't have those installed, please refer to their websites for installation instructions.

To build your own verions of HTML Inspector, simply run the following command from the project's root director:

```sh
grunt
```

Running `grunt` will concatenate and minify all the source files as well as all the rules in the `src/rules` directory. You can customize what rules go in your build by adding/removing them from the rules directory.

Keep in mind that rules can be excluded both at build time and at runtime. In other words, you don't necessarily need a custom build to exclude certain rules.

You also don't need a custom build to add new rules. It's perfectly OK to add new rules directly to the HTML source as separate files.

## Running the Tests

To run the Jasmine tests from the command line you'll need to have node, Node and NPM installed as well as the Grunt command line tools. You'll also need to install the script dependencies with [Bower](https://github.com/bower/bower).

If you don't have Node, NPM, and Grunt installed, refer to their documentation for installation instructions. Once they're installed, you can install the rest of the dependencies with the following commands:

```sh
# Install Node dependencies
npm install

# Install script dependencies
bower install
```

Once the dependencies are installed, you can run the Jasmine test via the command line:

```sh
grunt test
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/philipwalton/html-inspector/blob/master/CONTRIBUTING.md)

## What's Next

HTML Inspector is still new and has a lot of room to grow. I'm working on some new rules, and I'll definitely write some better documentation, but ultimately the project cannot be successful without community involvement.

HTML Inspector can only be as useful as the conventions it aims to enforce. If you have conventions that have been working well for you or your team, please suggest them.

Since not all rules are appropriate for general use, I also plan on setting up a repo solely for custom rules from which users can pick and choose.

Keep checking back for updates or star/watch the repo to receive email notifications.
