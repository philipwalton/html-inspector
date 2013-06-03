# HTML Inspector

HTML Inspector is a highly-customizable, code quality tool to help you (and your team) write better markup. It aims to find a balance between the uncompromisingly strict W3C validator and the all-to-common "anything goes".

With HTML Inspector, every rule or warning is completely customizable to fit your projects needs, and it's easy to extend so development teams can write their own rules to enforce their chosen conventions.

__* * * HTML Inspector is brand new and still evolving. If you have suggestions for how to make it better or more useful, please file an issue or submit a pull request. * * *__

## Getting Started

The easiest way to get started is to simply download the full html-inspector.js file and add it to the bottom of your page, then call `HTMLInspector.inspect()`. Calling inspect with no options will load all rules and run them with their default options.

Here's the simpliest way to add HTML Inspector to your project: *(Note: HTML Inspector requires jQuery, so if you're not already including it on your page, you'll need to.)*

```html
<script src="path/to/html-inspector.js"></script>
<script> HTMLInspector.inspect() </script>
```
After the script runs, any errors will be reported to the console. Here's a sample of what you might see:

* * * Put Sample Image Here * * *

Make sure you call `inspect` after any other DOM altering scripts have finished running or those alterations won't get inspected.

## Rules Explanations ##

HTML Inspector ships with a base set of rules which fall into one of three main categories: validation, best-pratices, and convention.

### Validation

HTML Inspector is different than a markup validator. Validators parse static markup, while HTML Inspector runs on a live DOM. This makes it a lot more powerful, but there are some drawbacks as well. Because HTML Inspector runs after the browser has parsed your HTML, any mistakes the browser has forgiven will not be seen by HTML Inspector.

As a result HTML Inspector should not be seen as a replacement for validation. It's simply another tool in the toolbox.

That being said, there is still a lot that HTML Inspector can do and does to validate your markup.

Here are the validation rules that ship with HTML Inspector. (Expect this list to get more comprehensive in the future.)

- **Validate Elements**: Inspect each element in the DOM and reports any elements that are invalid or obsolete. This will catch anything from simple mispellings like `<il>` instead of `<li>`, and it may also inform you that `<hgroup>` is no longer a valid HTML element. Any element you don't want to be warned about can be whitelisted.

- **Validate Attributes**: Like validating elements, this rule will let you know if you're using attributes that don't belong on a particular element or perhaps don't belong on any element. If your project uses custom attributes (like `ng-*` in AngularJS) they can be whitelisted.

- **Duplicate IDs**: Warn if non-unique IDs are found on the same page.

- **Scoped Styles**: `<style>` elements that appear outside of the document `<head>` are required to have a scoped attribute.

### Best Practices

Some markup is perfectly valid, but is commonly considered to be a poor or outdated practice. The following rules check for these types of things.

- **Inline Event Handlers**: Warn if inline event handlers, like `onclick="return false"` are found in the document. Inline event handlers are harder to manage, harder to debug, and completely un-reusable.

- **Unused Classes**: Sometimes we'll remove a CSS rule from our stylesheets but forget to remove the class from the HTML. This rule compares all the class selectors in the CSS to the classes in the HTML and reports any unused classes. Classes that are in the HTML as JavaScript hooks can be ignored via a whitelist. By default, any class prefixed with `js-`, `language-`, or `supports-` is whitelisted. More information on the rational behind this rule can be found [here](http://philipwalton.com/articles/css-architecture/)

- **Unnecessary Elements**: Anytime your have a plain `<div>` or `<span>` element in the HTML with no class, ID or any other attribute, it's probably unnecessary or a mark of poor design. Elements with no semantic meaning should only be used for presentation, but if the element has no attributes it means the styling is done through a rule like `.some-class > div { }` which is just asking for trouble. Again, more information on this rule can be found [here](http://philipwalton.com/articles/css-architecture/)

### Convention

The real power of HTML Inspector lies in it's ability to enforce your teams chosen convention. If you've decided that all group of links should be contained in a `<nav>` element, or all `<section>` element must contain a heading, you can write those rules, and an error will be thrown when someone breaks them.

Because convention is mainly team preference, there's only one built-in rule in this category, but hopefully it'll get you thinking about rules for your team.

- **BEM**: The increasingly popular BEM (block, element, modifier) methodology is a CSS naming convention that is very helpful for large project. The problem is using it correctly in the CSS is only half the battle, if it's not used correctly in the HTML it doesn't work either. This rule throws an error when an element class name is used but that element isn't a descendent of a block by the same name. It also errors when a modifier is used on an element or block without the modify class there too.


## Customizing

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

### Rule Configurations

Individual rules may or may not do exactly what you need, which is why most rules come with a configurations object that users can customize. A rule's configuration can be changed to meet your needs via the `extend` method of the `HTMLInspector.rules` object. The `extend` method take two arguments, the rule's unique name, and object whose properties will override the properties of the rule's default config object which is specified when the rule is initially added.

```js
HTMLInspector.rules.extend("some-rule-name", {
  someProp: newValue
})
```

## Extending

The `HTMLInspector` object can be extended in two main ways:

1) Adding rules
2) Adding modules

### Rules

Rules are the bread of butter of HTML Inspector. They are where you check for problems, and report errors.

New rules can be added in the following way:

```js
HTMLInspector.rules.add(name, [config], func)
```

- **name**: (String) The `name` parameter is string used to identify the rule. It must be unique.
- **config** *optional*(Object) The `config` parameter stores configuration data that is used by the rule. Anything that users of your rule might want to customize themselves should be set in the `config` object.
- **func**: (Function) The `func` parameter is an initialization function that is invoked as soon as you call `HTMLInspector.inspect()`. The function is passed three arguments `listener`, `reporter`, and `config`. The `listener` object is used to subscribe to events that are triggered HTML Inspector is traversing the DOM. When problems are found, they can be reported to the `reporter` object. The `config` object is the same `config` object that was passed to `HTMLInspector.rules.add`, but its properties may have been customized by other users between then and now.

#### Events

The `listener` object can subscribe to events via the `on` method. Like with many other event binding libraries, `on` takes two arguments: the event name, and a callback function:

```js
listener.on("class", function(className) {
  // listener callback bind `this` to the DOM element
  if (className === "foo" and this.nodeName.toLowerCase() == "bar") {
    // report the error
  }
})
```

Here is a complete list of events along with the arguments that are passed to their respective callback functions:

- **beforeInspect** : domRoot
- **element** : elementName, domElement
- **id**: idName, domElement
- **class**: className, domElement
- **attribute**: name, value, domElement
- **afterInspect** : domRoot

*(Note: for the `element`, `id`, `class`, and `attribute` events, the DOM element is bound to the `this` context.)*

### Modules

Modules provide a way to make data and/or functionality available to multiple rules. In general, rules should be rather self-contained, but if several unrelated rules need access to some of the same stuff, put it in a module.

HTML Inspector ships with two modules that may be useful to those writing custom rules:

- **validation**: a collection of data from the W3C used in validation rules to determine which elements and attributes are valid/required and which are obsolete.

- **css**: traverses `document.styleSheets` and returns a list of all the CSS class selectors referenced in all the CSS style sheets. This module can be customized to configure which elements are traversed.
