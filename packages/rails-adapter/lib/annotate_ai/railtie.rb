# frozen_string_literal: true

require "rails/railtie"

module AnnotateAi
  class Railtie < Rails::Railtie
    initializer "annotate_ai.configure_action_view" do
      ActiveSupport.on_load(:action_view) do
        require "annotate_ai/action_view_extension"
        ActionView::Template.prepend(AnnotateAi::ActionViewExtension)
      end
    end

    initializer "annotate_ai.add_middleware" do |app|
      require "annotate_ai/middleware"
      app.middleware.use AnnotateAi::Middleware
    end
  end
end
