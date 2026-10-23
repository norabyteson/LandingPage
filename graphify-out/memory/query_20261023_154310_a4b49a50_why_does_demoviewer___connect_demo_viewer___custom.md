---
type: "query"
date: "2026-10-23T15:43:10.373872+00:00"
question: "Why does DemoViewer() connect Demo Viewer & Custom Demos to Navigation & Smooth Scroll and Page Sections & Contact Form?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["DemoViewer()", "ServicesSection()", "smoothScrollTo()", "ContactSection()", "norabyte:prefill-service window event", "cn()"]
---

# Q: Why does DemoViewer() connect Demo Viewer & Custom Demos to Navigation & Smooth Scroll and Page Sections & Contact Form?

## Answer

Expanded from original query via vocab: [demo, viewer, demos, smooth, scroll, contact, section, prefill, service, services]. DemoViewer() is rendered by ServicesSection (ServicesSection.tsx L327, imported L20), calls smoothScrollTo (DemoViewer.tsx L109) to scroll to #contact, and dispatches the norabyte:prefill-service window event that ContactSection listens for (ContactSection.tsx L172). The event has no code-to-code edge; it only links through a CLAUDE.md concept node. The graph's shortest DemoViewer->ContactSection path runs through cn(), a shared class-name utility, which is a false bridge. DemoViewer links only to the 3 custom demos; the 6 ecommerce/landing demos are not linked (gap). serviceFormLabel maps SERVICE_IDS to contact.form.services by array index, a positional coupling not captured in the graph.

## Outcome

- Signal: useful

## Source Nodes

- DemoViewer()
- ServicesSection()
- smoothScrollTo()
- ContactSection()
- norabyte:prefill-service window event
- cn()