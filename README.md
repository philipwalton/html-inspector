# HTML Inspector

HTML Inspector is a highly-customizable, code quality tool to help you (and your team) write better markup. It aims to find a balance between the uncompromisingly strict W3C validator and absolutely no rules at all.

Every rule or error used by HTML Inspector is completely customizable to fit your projects needs, and it's easy to extend so development teams can write their own rules to enforce their chosen conventions.

## Getting Started

The easiest way to get started is to simply download the full html-inspector.js file and add it to the bottom of your page, then call `inspect()` on the `HTMLInspector` object. Calling inspect with no options will load all rules with the default options. You can find more information on changing those options below.

*(Note: HTML Inspector requires jQuery, so if you're not already including it on your page, you'll need to.)*

Here's the simpliest way to add HTML Inspector to your project:

```html
<script src="path/to/html-inspector.js"></script>
<script> HTMLInspector.inspect() </script>
```
After the script runs, any errors will be reported to the console. Here's a sample of what you might see:

* * * Put Sample Image Here * * *

*(Note: make sure you call `inspect` after any other DOM altering scripts have finished running.)*

## Customizing

By default, HTML Inspectors runs all added rules, starts traversing from the `<html>` element, and logs errors to the console when complete, but all of this can be customized.

The `.inspect()` method takes a config object to allow you to change any of this behavior. Here are the config options:

- **rules**: *(Array)* a list of strings that represent rule IDs
- **domRoot: *(selector|element|jQuery)* the DOM element to start traversing from
- **complete: **(Function) the callback to be invoked when the inspecting is complete. The function is passed an array of errors that were reported by the rules.

Here's an example:

```js
HTMLInspector.inspect({
  rules: ["some-rule-name", "some-other-rule-name"],
  domRoot: $("body"),
  complete: function(errors) {
    errors.forEach(function(error) {
      // report errors to external service...
    }
  }
})
```

Alternatively, if you only need to set a single configuration option, you don't need to pass an object, the `inspect` method will figure out what it is based on its type.

```js
// only set the rules options
HTMLInspector.inspect(["some-rule-name", "some-other-rule-name"])

// only set the domRoot
HTMLInspector.inspect($("body"))

// only set the complete callback
HTMLInspector.inspect(function(errors) {
  errors.forEach(function(error) {
    // report errors to external service...
  }
})
```

### Rule Configurations

Individual rules may or may not do exactly what you need, which is why most rules expose a configurations object that users can customize. Individual rules configs can be overridden by setting new values like so:

```js
HTMLInspector.rules["some-rule-name"] = {
  // your config goes here
}

// or perhaps by just adjusting one property of the config object
HTMLInspector.rules["some-rule-name"].someProp = newValue

// or by using jQuery
$.extend(HTMLInspector.rules["some-rule-name"], { someProp: newValue})
```


## Extending

The `HTMLInspector` object can be extended in two main ways:

1) Adding rules
2) Adding extensions

### Rules

Rules are the bread of butter of HTML Inspector. They are where you check for problems, and report errors.

New rules can be added in the following way:

```
HTMLInspector.addRule(name, func)
```

The `name` parameter is a unique string to identify the rule, and the `func` parameter is an initialization function that is invoked when `HTMLInspector.inspect()` is called. The function is passed two arguments `listener` and `reporter`. After `.inspect()` is called and the HTML inspector traverses the DOM, it triggers events that the `listener` object can subscribe to. When problems are found, they can be reported to the `reporter` object.

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

### Extensions

Extensions provide a place where you can share config options, data, and/or functionality between multiple rules. HTML Inspector ships with two extensions which may be useful to authors writing custom rules:

- **validation**: a collection of data from the W3C used in validation rules to determine which elements and attributes are valid/required and which are obsolete.

- **css**: traverses `document.styleSheets` and returns a list of all the CSS class selectors referenced in all the CSS style sheets. A selector can be used to configure which elements are traversed.