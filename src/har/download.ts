import { chromium } from "@playwright/test";
import path from "path";
import loadHomepage from "./loadHomepage";
import { log, outputDirectory } from "./utils";
import { QboAccount } from "../types";

export default async function download(qboAccount: QboAccount) {
  log("Launching Chromium");
  const browser = await chromium.launch({
    headless: false,
  });

  log("Getting context");
  const outputFolder = outputDirectory(qboAccount.accountType);
  const harFilePath = path.join(outputFolder, `har-${Date.now()}.har`);
  const context = await browser.newContext({
    recordHar: {
      path: harFilePath,
      content: "embed",
    },
  });

  await loadHomepage(browser, context, qboAccount);

  return harFilePath;
}
