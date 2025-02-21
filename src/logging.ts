import { PartialSceneEntity } from "@utils/scene";

import { LOGGING_SERVER_URL } from "./config";

const customReplacer = (_: string, value: unknown): unknown => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export function logSceneEntitiesToServer(sceneEntities: PartialSceneEntity[]): void {
  const body = JSON.stringify({ sceneEntities }, customReplacer);

  fetch(LOGGING_SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return await response.text();
    })
    .then((data) => {
      console.log("Successfully sent SceneEntities:", data);
    })
    .catch((error) => {
      console.error("Failed to send SceneEntities:", error);
    });
}
