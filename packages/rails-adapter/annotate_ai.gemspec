# frozen_string_literal: true

require_relative "lib/annotate_ai/version"

Gem::Specification.new do |spec|
  spec.name = "annotate_ai"
  spec.version = AnnotateAi::VERSION
  spec.authors = ["Devendra Bangar"]
  spec.email = ["devendrabangar8@gmail.com"]

  spec.summary = "Rails adapter for AnnotateAI visual annotation tool."
  spec.description = "Injects source metadata into Rails views to enable precise AI prompts."
  spec.homepage = "https://github.com/annotate-ai/annotate-ai"
  spec.required_ruby_version = ">= 3.1.0"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = "#{spec.homepage}/blob/main/CHANGELOG.md"

  # Specify which files should be added to the gem when it is released.
  spec.files = Dir.chdir(__dir__) do
    Dir["{lib,sig}/**/*", "README.md", "CHANGELOG.md"]
  end
  spec.bindir = "exe"
  spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  # Uncomment to register a new dependency of your gem
  # spec.add_dependency "example-gem", "~> 1.0"

  # For more information and examples about making a new gem, check out our
  # guide at: https://bundler.io/guides/creating_gem.html
end
