# HTML Inspector

Coming soon...

## Rules:

* Warn if the same ID is used more than once on a page.
* Don’t use any classes that aren’t mentioned in any stylesheet or pass a whitelist (like “js-” prefixed classes).
* Modifer classes shouldn’t be used without their base class.
* Sub-object classes shouldn’t be used when no ancestor contains the base class.
* Plain old DIV or SPAN elements, without classes attached, should not be used in the HTML.
* Inline elements should not contain block children
* Section element should always contain a heading