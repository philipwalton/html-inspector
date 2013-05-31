describe("misused-attributes", function() {

  var log
    , allowedAttributes = HTMLInspector.extensions.attributes.allowedAttributes

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when attributes are used on elements they're not allowed to be on", function() {

    var $html = $(''
          + '<div for="form">'
          + '  <button href="#"">Click Me</button>'
          + '  <p rows="5">Foo</p>'
          + '  <div disabled><b defer>Foo</b></div>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["misused-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(5)
    expect(log[0].message).toBe("The 'for' attribute cannot be used on a 'div' element.")
    expect(log[1].message).toBe("The 'href' attribute cannot be used on a 'button' element.")
    expect(log[2].message).toBe("The 'rows' attribute cannot be used on a 'p' element.")
    expect(log[3].message).toBe("The 'disabled' attribute cannot be used on a 'div' element.")
    expect(log[4].message).toBe("The 'defer' attribute cannot be used on a 'b' element.")
    expect(log[0].context).toBe($html[0])
    expect(log[1].context).toBe($html.find("button")[0])
    expect(log[2].context).toBe($html.find("p")[0])
    expect(log[3].context).toBe($html.find("[disabled]")[0])
    expect(log[4].context).toBe($html.find("b")[0])

  })

  it("doesn't warn when attributes are used on elements they're allowed to be on", function() {

    var $html = $(document.createElement("div"))

    allowedAttributes.forEach(function(item) {
      item.elements.forEach(function(element) {
        var $el = $(document.createElement(element))
        $el.attr(item.attr, "")
        $html.append($el)
      })
    })

    HTMLInspector.inspect({
      rules: ["misused-attributes"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)

  })

})
