describe("script-placement", function() {

  var log

  function onComplete(reports) {
    log = []
    reports.forEach(function(report) {
      log.push(report)
    })
  }

  it("warns when script tags aren't found as the last elemenet in <body>", function() {
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      onComplete: onComplete
    })
    expect(log.length).toBeGreaterThan(0)
    log.forEach(function(error, i) {
      expect(log[i].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
      expect($(log[i].context).is("script")).toBe(true)
    })

    $html = $(''
      + '<div>'
      + '  <script id="script1">(function() { // script one }())</script>'
      + '  <header>Header content</header>'
      + '  <main>Main content</main>'
      + '  <footer>Footer content</header>'
      + '  <script id="script2">(function() { // script two }())</script>'
      + '  <script id="script3">(function() { // script three }())</script>'
      + '</div>'
    )
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe($html.find("#script1")[0])
  })

  it("doesn't warn when script tags are the last traversed element", function() {
    var $html = $(''
          + '<div>'
          + '  <header>Header content</header>'
          + '  <main>Main content</main>'
          + '  <footer>Footer content</header>'
          + '  <script id="script1">(function() { // script one }())</script>'
          + '  <script id="script2">(function() { // script two }())</script>'
          + '</div>'
        )
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("allows for customization by altering the config object", function() {
    var $html = $(''
          + '<div>'
          + '  <script id="script1">(function() { // script one }())</script>'
          + '  <script id="script2">(function() { // script two }())</script>'
          + '  <header>Header content</header>'
          + '  <main>Main content</main>'
          + '  <footer>Footer content</header>'
          + '  <script id="script3">(function() { // script three }())</script>'
          + '</div>'
        )
    // whitelist #script1
    HTMLInspector.rules.extend("script-placement", {
      whitelist: "#script1"
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe($html.find("#script2")[0])

    // whitelist #script1 and #script2
    HTMLInspector.rules.extend("script-placement", {
      whitelist: ["#script1", "#script2"]
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: $html,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })
})