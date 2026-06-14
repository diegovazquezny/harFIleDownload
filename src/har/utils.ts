import path from "path";
import { Entry, Har } from "../types";
import fs from "fs";
import { encode } from "gpt-tokenizer";
import config from "../../har.config.json";
import AdmZip from 'adm-zip';

enum ENV {
  DEV = "dev",
  PROD = "prod",
}

// const env: ENV = ENV.DEV;
const env = ENV.PROD;

const ALLOWED_RESPONSE_HEADERS = config.allowedResponseHeaders;

const NOT_ALLOWED_ENTRY_KEYS =
  config.notAllowedResponseHeaders as (keyof Entry)[];

export function log(text: string) {
  console.log(`=== ${text} ===`);
}

function removeCookies(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };
  if (partialEntry?.request?.cookies) {
    delete partialEntry.request.cookies;
  }

  if (partialEntry?.response?.cookies) {
    delete partialEntry.response.cookies;
  }

  return partialEntry;
}

function removeQueryString(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };
  if (partialEntry?.request?.queryString) {
    delete partialEntry.request.queryString;
  }

  return partialEntry;
}

function removeAuthHeader(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };
  if (entry?.request?.headers) {
    delete entry.request.headers;
  }

  entry.response.headers = entry.response.headers.filter((header) =>
    ALLOWED_RESPONSE_HEADERS.includes(header.name),
  );

  return partialEntry;
}

function removeTextContent(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };

  if (partialEntry?.response?.content?.text) {
    delete partialEntry.response?.content?.text;
  }

  return partialEntry;
}

function removeNotAllowedKeys(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };
  NOT_ALLOWED_ENTRY_KEYS.forEach((key) => {
    if (partialEntry?.[key]) {
      delete partialEntry[key];
    }
  });

  return partialEntry;
}

function removePostDataTextContent(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };

  if (partialEntry?.request?.postData?.text) {
    delete partialEntry.request.postData.text;
  }

  return partialEntry;
}

function removePostDataParams(entry: Entry): Entry {
  const partialEntry: Entry = { ...entry };

  if (partialEntry?.request?.postData?.params) {
    delete partialEntry.request.postData.params;
  }

  return partialEntry;
}

export function cleanUpEntries(harFile: Har): Har {
  const indexOfPostLogin = findIndexOfPostLogin(harFile);
  harFile.log.entries = harFile.log.entries.slice(indexOfPostLogin);

  harFile.log.entries = harFile.log.entries.map((entry) => {
    const cleanEntry = removePostDataParams(
      removeQueryString(
        removeNotAllowedKeys(
          removePostDataTextContent(
            removeTextContent(removeAuthHeader(removeCookies(entry))),
          ),
        ),
      ),
    );
    return cleanEntry;
  });
  return harFile;
}

export function removeDoubleQuotes(text: string) {
  return text.replaceAll(/"/gi, "");
}

export function findIndexOfAfterPageReadyDeps(entries: Entry[]): number {
  // const regex = /afterPageReadyDeps/gi;
  // for (let i = 0; i < entries.length; i++) {
  //   if (entries[i].request.url.match(regex)) return i;
  // }
  return entries.length;
}

export function writeHarToFile(harFile: Har, accountType: string): void {
  const stringifiedHar =
    env != ENV.PROD
      ? JSON.stringify(harFile, null, 2)
      : JSON.stringify(harFile);
  const removeDoubleQuotesHar = removeDoubleQuotes(stringifiedHar);

  log(`Stringified HAR Tokens: ${encode(stringifiedHar).length}`);
  log(
    `Removed double quotes HAR Tokens: ${encode(removeDoubleQuotesHar).length}`,
  );

  const harFolderPath = outputDirectory(accountType);

  if (!fs.existsSync(harFolderPath)) {
    fs.mkdirSync(harFolderPath, { recursive: true });
  }

  const now = new Date().toISOString();
  const harFilePath = path.join(
    harFolderPath,
    `har-${now}-processed-${env}.har`,
  );
  const txtFilePath = path.join(
    harFolderPath,
    `har-${now}-processed-${env}.txt`,
  );

  fs.writeFile(harFilePath, stringifiedHar, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file", err);
      return;
    }
    log("Data written to file successfully");
  });

  fs.writeFile(txtFilePath, removeDoubleQuotesHar, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file", err);
      return;
    }
    log("Data written to file successfully");
  });
}

export function getHarFromFile(path: string): Har | null {
  try {
    const jsonString = fs.readFileSync(path, "utf8");
    log("Success reading HAR file");
    return JSON.parse(jsonString) as Har;
  } catch (err) {
    console.error("Error reading or parsing Har file:", err);
    return null;
  }
}

export function extractInteractions() {
  // https://logging.api.intuit.com/v2/log/message
  throw new Error("Extract interactions not implemented");
}

export function findIndexOfPostLogin(harFile: Har): number {
  let index = 0;

  for (let i = 0; i < harFile.log.entries.length; i++) {
    const entry = harFile.log.entries[i];
    if (entry.request.url.match(/app\/postlogin/i)) {
      return i;
    }
  }

  return index;
}

export function outputDirectory(accountType: string) {
  const rootOutputDirectory = config.rootOutputDirectory;
  return `${process.cwd()}/${rootOutputDirectory}/${accountType}`;
}

export function zipDirectory(sourceDir: string) {
  try {
    const zip = new AdmZip();

    // Define your paths
    const outputFile = path.resolve(`${sourceDir}/compressedHar.zip`);

    // Add folder contents and write to disk
    zip.addLocalFolder(sourceDir);
    zip.writeZip(outputFile);

    console.log("Successfully zipped Har File!");
  } catch (error) {
    console.error("Zipping failed:", error);
  }
}
