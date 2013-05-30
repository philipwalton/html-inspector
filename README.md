# HTML Inspector

Coming soon...

## Rules:

* Warn if the same ID is used more than once on a page.
* Don’t use any classes that aren’t mentioned in any stylesheet or pass a whitelist (like “js-” prefixed classes).
* Inline elements should not contain block children
* Section element should always contain a heading
* Don't use inline event handlers like `onclick`
* Don't put <td> elements inside of <thead>, use <th> instead

DONE:

* Modifer classes shouldn’t be used without their base class.
* Sub-object classes shouldn’t be used when no ancestor contains the base class.
* Plain old DIV or SPAN elements, without classes attached, should not be used in the HTML.