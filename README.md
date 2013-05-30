# HTML Inspector

Coming soon...

## Rules:

* make sure img tags have an alt attribute
* don't use inline styles
* style tags must appear in the head, if they appear in the body they must be scoped
* <script> tags should appear at the end, not throughout the document
* Inline elements should not contain block children
* Section element should always contain a heading
* Don't put <td> elements inside of <thead>, use <th> instead


DONE:

* Don't use inline event handlers like `onclick`
* Don’t use any classes that aren’t mentioned in any stylesheet or pass a whitelist (like “js-” prefixed classes).
* Warn if the same ID is used more than once on a page.
* Modifer classes shouldn’t be used without their base class.
* Sub-object classes shouldn’t be used when no ancestor contains the base class.
* Plain old DIV or SPAN elements, without classes attached, should not be used in the HTML.