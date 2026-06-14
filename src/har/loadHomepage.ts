import { Browser, BrowserContext } from "@playwright/test";
import config from "../../har.config.json";
import { log } from "./utils";
import { QboAccount } from "../types";

const AFTER_PAGE_READY_TIMEOUT_IN_MS = config.afterPageReadyTimeInMs;

const qboUrl: Record<QboAccount["environment"], string> = {
  prod: "https://qbo.intuit.com",
  e2e: "https://qbo.e2e.intuit.com",
};

export default async function loadHomepage(
  browser: Browser,
  context: BrowserContext,
  qboAccount: QboAccount,
): Promise<void> {
  const { username, password, environment } = qboAccount;
  const url = qboUrl[environment];

  log("Creating new page");
  const page = await context.newPage();
  log("Navigating to page");
  await page.goto(url);
  log("Selecting input");
  const accountNameInput = await page.waitForSelector("input");
  log("Entering account name");
  await accountNameInput.fill(username);
  log("Clicking sign in button");
  const signInButton = await page.waitForSelector('button[type="submit"]');
  await signInButton.click();
  log("Entering password");
  const passwordInput = await page.waitForSelector('input[name="Password"]');
  await passwordInput.fill(password);
  log("Clicking continue button");
  const continueButton = await page.waitForSelector('button[type="submit"]');
  await continueButton.click();
  log("Selecting QBO Plus account");
  const companySelector = page.getByRole("button", {
    name: "QBO Plus",
    exact: true,
  });
  await companySelector.click();
  await page.waitForSelector(".fusion");
  await page.evaluate(() => {
    // @ts-ignore
    window.addEventListener("page-ready", (event) => {
      console.log("diego page-ready", event);
    });
  });
  await page.waitForTimeout(AFTER_PAGE_READY_TIMEOUT_IN_MS);
  await context.close();
  await page.close();
  await browser.close();
}
