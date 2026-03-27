import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "ASAM OSI Converter",
  tagline:
    "A Lichtblick extension that converts ASAM Open Simulation Interface messages into 3D visualizations",
  favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://lichtblick-suite.github.io",
  baseUrl: "/asam-osi-converter/",

  organizationName: "lichtblick-suite",
  projectName: "asam-osi-converter",

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "../docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/lichtblick-suite/asam-osi-converter/edit/main/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "ASAM OSI Converter",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://lichtblick-suite.github.io/docs/",
          label: "Lichtblick Docs",
          position: "left",
        },
        {
          href: "https://github.com/lichtblick-suite/asam-osi-converter",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/user-guide/getting-started",
            },
            {
              label: "Panel Settings",
              to: "/user-guide/panel-settings",
            },
            {
              label: "Architecture",
              to: "/architecture/overview",
            },
          ],
        },
        {
          title: "Lichtblick",
          items: [
            {
              label: "Lichtblick Documentation",
              href: "https://lichtblick-suite.github.io/docs/",
            },
            {
              label: "Extensions Guide",
              href: "https://lichtblick-suite.github.io/docs/docs/extensions/introduction",
            },
            {
              label: "Message Converters",
              href: "https://lichtblick-suite.github.io/docs/guides/create-message-converter",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/lichtblick-suite/asam-osi-converter",
            },
            {
              label: "Issues",
              href: "https://github.com/lichtblick-suite/asam-osi-converter/issues",
            },
            {
              label: "ASAM OSI",
              href: "https://www.asam.net/standards/detail/osi/",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Lichtblick Suite.`,
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "typescript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
