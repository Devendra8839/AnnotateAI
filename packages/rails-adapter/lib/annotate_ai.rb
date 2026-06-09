# frozen_string_literal: true

require_relative "annotate_ai/version"
require_relative "annotate_ai/railtie" if defined?(Rails)

module AnnotateAi
  class Error < StandardError; end

  class << self
    attr_accessor :enabled

    def enabled?
      @enabled != false
    end
  end
end
