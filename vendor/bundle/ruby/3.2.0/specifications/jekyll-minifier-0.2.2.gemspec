# -*- encoding: utf-8 -*-
# stub: jekyll-minifier 0.2.2 ruby lib

Gem::Specification.new do |s|
  s.name = "jekyll-minifier".freeze
  s.version = "0.2.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["DigitalSparky".freeze]
  s.date = "1980-01-02"
  s.description = "Jekyll Minifier using htmlcompressor for html, terser for js, and cssminify2 for css".freeze
  s.email = ["matthew@spurrier.com.au".freeze]
  s.homepage = "http://github.com/digitalsparky/jekyll-minifier".freeze
  s.licenses = ["GPL-3.0-or-later".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.4.20".freeze
  s.summary = "Jekyll Minifier for html, css, and javascript".freeze

  s.installed_by_version = "3.4.20" if s.respond_to? :installed_by_version

  s.specification_version = 2

  s.add_runtime_dependency(%q<jekyll>.freeze, ["~> 4.0"])
  s.add_runtime_dependency(%q<terser>.freeze, ["~> 1.2.3"])
  s.add_runtime_dependency(%q<htmlcompressor>.freeze, ["~> 0.4"])
  s.add_runtime_dependency(%q<cssminify2>.freeze, ["~> 2.1.0"])
  s.add_runtime_dependency(%q<json-minify>.freeze, ["~> 0.0.3"])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.3"])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.13"])
  s.add_development_dependency(%q<jekyll-paginate>.freeze, ["~> 1.1"])
  s.add_development_dependency(%q<redcarpet>.freeze, ["~> 3.4"])
  s.add_development_dependency(%q<rss>.freeze, ["~> 0.3"])
end
