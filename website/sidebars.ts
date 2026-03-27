import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "index",
    {
      type: "category",
      label: "User Guide",
      items: ["user-guide/getting-started", "user-guide/panel-settings"],
    },
    {
      type: "category",
      label: "Architecture",
      items: [
        "architecture/overview",
        "architecture/converter-pipeline",
        "architecture/caching",
        "architecture/features",
        "architecture/frame-transforms",
      ],
    },
    {
      type: "category",
      label: "Reference",
      items: ["reference/lanes", "reference/logical-lanes"],
    },
    "contributing",
  ],
};

export default sidebars;
