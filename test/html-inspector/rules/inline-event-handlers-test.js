describe("inline-event-handlers", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when inline event handlers are found on elements", function() {
    var html = parseHTML(''
          + '<div onresize="alert(\'bad!\')">'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#" onclick="alert(\'bad!\')">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["inline-event-handlers"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(2)
    expect(log[0].message).to.equal("An 'onresize' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[1].message).to.equal("An 'onclick' attribute was found in the HTML. Use external scripts for event binding instead.")
    expect(log[0].context).to.deep.equal(html)
    expect(log[1].context).to.deep.equal(html.querySelector("a"))

  })

  it("doesn't warn there are no inline event handlers", function() {
    var html = parseHTML(''
          + '<div>'
          + '  <p>Foo</p>'
          + '  <p>Bar <a href="#">click me</em></p>'
          + '</div>'
        )

    HTMLInspector.inspect({
      useRules: ["inline-event-handlers"],
      domRoot: html,
      onComplete: onComplete
    })

    expect(log.length).to.equal(0)
  })

})
