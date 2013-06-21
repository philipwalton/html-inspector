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
      expect(log[i].context.nodeName.toLowerCase()).toBe("script")
    })

    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</footer>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<script id="script3">(function() { // script three }())</script>'))

    // Make sure the scripts aren't async or defer
    Array.prototype.slice.call(body.querySelectorAll("script")).forEach(function(script) {
      script.async = false
      script.defer = false
    })

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })

    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe(body.querySelector("#script1"))
  })

  it("doesn't warn when script tags are the last traversed element", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })

  it("doesn't warn when the script uses either the async or defer attribute", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1" async>(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2" defer>(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))

    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)

  })

  it("allows for customization by altering the config object", function() {
    var body = document.createElement("body")
    body.appendChild(parseHTML('<script id="script1">(function() { // script one }())</script>'))
    body.appendChild(parseHTML('<script id="script2">(function() { // script two }())</script>'))
    body.appendChild(parseHTML('<header>Header content</header>'))
    body.appendChild(parseHTML('<main>Main content</main>'))
    body.appendChild(parseHTML('<footer>Footer content</header>'))
    body.appendChild(parseHTML('<script id="script3">(function() { // script three }())</script>'))

    // Make sure the scripts aren't async or defer
    Array.prototype.slice.call(body.querySelectorAll("script")).forEach(function(script) {
      script.async = false
      script.defer = false
    })

    // whitelist #script1
    HTMLInspector.rules.extend("script-placement", {
      whitelist: "#script1"
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(1)
    expect(log[0].message).toBe("<script> elements should appear right before the closing </body> tag for optimal performance.")
    expect(log[0].context).toBe(body.querySelector("#script2"))

    // whitelist #script1 and #script2
    HTMLInspector.rules.extend("script-placement", {
      whitelist: ["#script1", "#script2"]
    })
    HTMLInspector.inspect({
      useRules: ["script-placement"],
      domRoot: body,
      onComplete: onComplete
    })
    expect(log.length).toBe(0)
  })
})