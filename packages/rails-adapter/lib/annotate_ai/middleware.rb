# frozen_string_literal: true

module AnnotateAi
  class Middleware
    def initialize(app)
      @app = app
    end

    def call(env)
      request = Rack::Request.new(env)
      
      # Intercept request for the SDK JS file
      if request.path == "/annotate_ai.js"
        return serve_sdk_js
      end

      status, headers, response = @app.call(env)

      if should_inject?(env, status, headers)
        body = []
        response.each { |part| body << part }
        response.close if response.respond_to?(:close)

        new_body = body.map { |chunk| inject_script(chunk) }
        headers["Content-Length"] = new_body.sum(&:bytesize).to_s
        response = new_body
      end

      [status, headers, response]
    end

    private

    def serve_sdk_js
      asset_path = File.expand_path("assets/annotate_ai.js", __dir__)
      if File.exist?(asset_path)
        [200, { "Content-Type" => "text/javascript" }, [File.read(asset_path)]]
      else
        [404, { "Content-Type" => "text/plain" }, ["AnnotateAI SDK not found"]]
      end
    end

    def should_inject?(env, status, headers)
      return false unless status == 200
      return false unless headers["Content-Type"]&.include?("text/html")
      
      request = Rack::Request.new(env)
      request.params["annotate"] == "true" || request.params["annotate_ai"] == "true"
    end

    def inject_script(html)
      return html unless html.include?("</body>")

      script_tag = <<~HTML
        <script>
          (function() {
            if (window.AnnotateAI) return;
            var script = document.createElement('script');
            script.src = '/annotate_ai.js';
            script.async = true;
            document.head.appendChild(script);
          })();
        </script>
      HTML

      html.sub("</body>", "#{script_tag}</body>")
    end
  end
end
