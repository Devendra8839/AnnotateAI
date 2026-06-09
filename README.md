# AnnotateAI

AnnotateAI is a visual annotation tool designed for the AI development era. It bridges the communication gap between stakeholders and AI coding agents by providing precise UI and source-code context.

## 🚀 How it Works

1. **Annotate:** Point and click on any UI element in your browser.
2. **Describe:** Add a note explaining the change you want.
3. **Generate:** One-click copy an AI-ready prompt containing:
   - The exact source file (ERB, Partial, ViewComponent).
   - The CSS selector and HTML context.
   - Your requested change.
4. **Ship:** Paste the prompt into Cursor, Claude, or Gemini and watch it work.

---

## 🛠 Rails Installation

Add the `annotate_ai` gem to your Rails application.

### 1. Add to Gemfile

Add the gem to your `:development` group. Since the gem is currently in development, you can point to the local path or your GitHub repository.

#### Option A: Local Path (Best for active development)
If you have the AnnotateAI source code on your machine:

```ruby
group :development do
  gem "annotate_ai", path: "path/to/AnnotateAI/packages/rails-adapter"
end
```

#### Option B: GitHub (Best for team sharing)
If you want to pull the gem directly from a repository:

```ruby
group :development do
  gem "annotate_ai", 
      git: "https://github.com/your-username/AnnotateAI.git", 
      glob: "packages/rails-adapter/*.gemspec"
end
```
> **Note:** The `glob` parameter is required because AnnotateAI is a monorepo; it tells Bundler where to find the gem inside the `packages/` directory.

### 2. Install

```bash
bundle install
```

### 3. Usage

AnnotateAI is **dormant by default** to ensure zero impact on your application's performance. It only activates when explicitly requested via a query parameter.

To enable annotation mode, append `?annotate=true` to any URL in your application:

`http://localhost:3000/dashboard?annotate=true`

### 4. Advanced: Source Mapping

AnnotateAI automatically maps UI elements to their source files. To make this as precise as possible, it identifies boundaries for:
- Rails Templates (`index.html.erb`)
- Rails Partials (`_sidebar.html.erb`)
- ViewComponents (if used)

When you click an element, the SDK walks up the DOM to find the nearest file boundary, ensuring your AI agent knows exactly which file to edit.

**Zero-Config SDK:** You don't need to manually add the JS file to your project. The gem includes the SDK and serves it automatically via middleware at `/annotate_ai.js`.

---

## 🛠 Core SDK (Universal)

The `@annotate-ai/core` SDK is framework-agnostic. While the Rails adapter handles the server-side source mapping, the Core SDK handles the visual interaction.

### Manual Integration (Non-Rails)

If you aren't using Rails, you can still include the SDK via a script tag:

```html
<script src="https://unpkg.com/@annotate-ai/core/dist/index.global.js"></script>
```

Add metadata to your elements to enable source mapping:

```html
<div data-annotate-file="src/components/Header.tsx">
  <button>Click Me</button>
</div>
```

---

## 🤝 Roadmap

- [x] Rails Adapter (ERB & Partials)
- [x] Universal Core SDK
- [ ] React / Next.js Adapter
- [ ] Browser Extension
- [ ] Visual Modal for annotations (instead of `window.prompt`)

## 📄 License

AnnotateAI is released under the [MIT License](LICENSE).
