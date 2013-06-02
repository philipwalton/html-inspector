# HTML Inspector

Coming soon...

## Markup Structure

* Section element should usaully contain a heading (they are not generic containers)
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section
* Don't put <td> elements inside of <thead>, use <th> instead
* <li> elements should always be the first-level descendents of <ol> or <ul>. They cannot be wrapped in containers.
* the <main> element can only appear once per page
* <tfoot> must appear before <tbody>
  - http://www.w3.org/TR/html401/struct/tables.html#edef-TFOOT
* <nav> elements should contain at least some <a> elements
* <figcaption> must be the first or last child of <figure>
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption

* don't use multiple consecutive <br> elements
* don't use multiple consecutive &nbsp; entities

* Don't use <meta>, <link>, <title> elements outside of <head>, and only use <style> if its scoped

* <title> is required


## Possbile Additional Rules

* for attributes on labels or fragment identifiers in urls that don't match any IDs in the document
* no longer need type attr on <script> or <style>
* Don't use inline styles
* <script> tags should appear at the end, not throughout the document



## HTML 5.1

### Global Attributes Reference
http://drafts.htmlwg.org/html/master/dom.html#global-attributes

### Element Reference
http://drafts.htmlwg.org/html/master/iana.html#index

### Obsolute Reference
http://drafts.htmlwg.org/html/master/obsolete.html#obsolete


## In A Future Release Consider

Actually parsing the markup instead of relying on the browser
https://github.com/tautologistics/node-htmlparser