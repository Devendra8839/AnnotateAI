# frozen_string_literal: true

module AnnotateAi
  module ActionViewExtension
    def render(view, locals, buffer = nil, **kwargs, &block)
      if should_annotate?(view)
        file_path = relative_path(identifier)
        
        # In Rails, the buffer is usually an ActionView::OutputBuffer
        if buffer.respond_to?(:safe_append)
          buffer.safe_append("<div data-annotate-file=\"#{file_path}\" data-annotate-framework=\"rails\" style=\"display: contents;\">".html_safe)
          result = super
          buffer.safe_append("</div>".html_safe)
          result
        else
          output = super
          if output.is_a?(String) && output.present? && !output.frozen?
            # Using prepend/append might be safer than interpolation for some string types
            "<div data-annotate-file=\"#{file_path}\" data-annotate-framework=\"rails\" style=\"display: contents;\">#{output}</div>".html_safe
          elsif output.is_a?(String) && output.present?
            "<div data-annotate-file=\"#{file_path}\" data-annotate-framework=\"rails\" style=\"display: contents;\">#{output}</div>".html_safe
          else
            output
          end
        end
      else
        super
      end
    end

    private

    def should_annotate?(view)
      return false unless AnnotateAi.enabled?
      
      # ActionView::Template has an identifier (full path)
      id_str = identifier.to_s
      return false if id_str.include?("layouts/") || id_str.end_with?(".js", ".json", ".xml", ".css")

      # Safely check for params
      begin
        # Use view.params or view.controller.params
        params = nil
        if view.respond_to?(:params)
          params = view.params
        elsif view.respond_to?(:controller) && view.controller.respond_to?(:params)
          params = view.controller.params
        end
      rescue
        params = nil
      end
      
      params && (params[:annotate] == "true" || params[:annotate_ai] == "true")
    end

    def relative_path(path)
      return path unless defined?(Rails)
      path.to_s.sub("#{Rails.root}/", "")
    rescue
      path
    end
  end
end
