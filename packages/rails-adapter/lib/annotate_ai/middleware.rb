# frozen_string_literal: true

module AnnotateAi
  class Middleware
    def initialize(app)
      @app = app
    end

    def call(env)
      status, headers, response = @app.call(env)

      if should_inject?(env, status, headers)
        # Handle different types of responses (Array, Rack::BodyProxy, etc.)
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

    def should_inject?(env, status, headers)
      return false unless status == 200
      return false unless headers["Content-Type"]&.include?("text/html")
      
      # Use Rack::Request for safe param access
      request = Rack::Request.new(env)
      request.params["annotate"] == "true" || request.params["annotate_ai"] == "true"
    end

    def inject_script(html)
      return html unless html.include?("</body>")

      # SDK_URL could be configurable. For now, we point to the local built version if available?
      # No, for the gem it should probably be a CDN or we host it in the app.
      # For this MVP/Demo, we'll stick to a placeholder or even better, 
      # we can serve it via a custom route in the railtie.
      
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
