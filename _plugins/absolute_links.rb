module Jekyll
  module AbsoluteLinks
    def absolute(input)
      config = @context.registers[:site].config
      dev_mode = config['server']

      # Add the appropriate domain
      if dev_mode
        root_url = "#{config['devroot']}:#{config['server_port']}#{input}"
      else
        root_url = "#{config['root']}#{input}"
      end

      # remove "index.html" if found
      root_url.gsub!(/\/index.html$/, "")

      # add trailing slash if the url is a directory and not a file
      unless root_url =~ /(\.(html|css|js)$|\/$)/
        root_url += "/"
      end

      root_url

    end
  end
end

Liquid::Template.register_filter(Jekyll::AbsoluteLinks)