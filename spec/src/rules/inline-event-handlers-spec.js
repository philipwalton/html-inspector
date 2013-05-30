describe("inline-event-handlers", function() {

  var log

  function complete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when inline event handlers are found on elements", function() {
    var $html = $(''
          + '<div onresize="alert(\'bad!\')">'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#" onclick="alert(\'bad!\')">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["inline-event-handlers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(2)
    expect(log[0].message).toBe("The 'onresize' event handler was found inline in the HTML.")
    expect(log[1].message).toBe("The 'onclick' event handler was found inline in the HTML.")
    expect(log[0].context).toEqual($html[0])
    expect(log[1].context).toEqual($html.find("a")[0])

  })

  it("doesn't warn there are no inline event handlers", function() {
    var $html = $(''
          + '<div>'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      rules: ["inline-event-handlers"],
      domRoot: $html,
      complete: complete
    })

    expect(log.length).toBe(0)
  })

})
