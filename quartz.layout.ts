import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
    component: Component.RecentNotes({ limit: 5 }),
    condition: (page) => page.fileData.slug === "index",
  }),

    Component.Comments({
      provider: "giscus",
      options: {
        repo: "seol-hj/techblog",
        repoId: "R_kgDORJ7R1Q",
        category: "Announcements",
        categoryId: "DIC_kwDORJ7R1c4C2E5T",
        mapping: "pathname",
        strict: true,
        reactionsEnabled: true,
        inputPosition: "top",
        lang: "ko",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      LinkedIn: "https://www.linkedin.com/in/hjklink/",
      GitHub1: "https://github.com/seol-hj",
      GitHub2: "https://github.com/hj-3",
      Mail: "mailto:hyjoon333@gmail.com",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
