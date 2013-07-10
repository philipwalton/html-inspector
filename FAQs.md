# FAQs

1. [How can I get HTML Inspector to stop warning me about unused Modernizr classes?](#)
2. [I use Disqus and I'm getting warnings about obsolete attributes on the `<iframe>` element. How can I prevent those?](#)

#### How can I get HTML Inspector to stop warning me about unused Modernizr classes?

Modernizr can be configured to add classes to the HTML element that represent the available (and unavailable) features of the user's browser. If these classes don't also appear anywhere in your stylesheets, HTML Inspector will warn you that you have classes in your markup that are not used.

HTML Inspector provides a whitelist of patterns for the unused-classes rule that, if matched, will not cause a warning. The default whitelist is: `js-*`, `language-*`, `lang-*`, `supports-*`.

Unfortunately, Modernizr classes will not match any of these out of the box; however, Modernizr gives you the ability to add a prefix to these classes, making it easy for them to all match a single regular expression. In fact, the `supports-*` pattern in the default whitelist was added specifically for Modernizr and is the recommended way to use these two libraries together. If you prefer a different prefix, simply extend the "unused-classes" rule with your own prefix. Here's how you could do that with the prefix `modernizr-*`:

```js
HTMLInspector.rules.extend("unused-classes", function(config) {
  config.whitelist.push(/^modernizr\-/)
  return config
})
```

If, for whatever reason, you are unable to change your build of Modernizr, the other easy way to avoid these errors is to exclude the `<html>` element from traversal. Note, however, that this will also prevent any other rules from inspecting the `<html>` element, which may be undesirable. To exlude the `<html>` element simply invoke the `.inspect` method with the following config options:

```js
HTMLInspector.inspect({
  exlude: 'html'
})
```

**I use Disqus and I'm getting warnings about obsolete attributes on the `<iframe>` element. How can I prevent those?**

Disqus comments insert an `<iframe>` into your page that (unfortunately) uses outdated attributes. Since it's Disqus doing this, there's no easy way for you to change or remove those attributes. You could whitelist them, but if Disqus changes their markup down the road, your whitelist might not work with their new way.

The best solution is to completely ignore markup added by third party scripts. Since it's outside of your control, there's no reason to worry about its correctness anyway.

To exclude Disqus comments you could simply not traverse any `<iframe>` elements, or you could try to specifically exclude Disqus iframes with a selector. For example:

```js
// exclude iframes with a `data-disqus-uid` attribute
HTMLInspector.inspect({
  exclude: "iframe[data-disqus-uid]"
})
```