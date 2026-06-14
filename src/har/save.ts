import download from "./download";
import { cleanUpEntries, getHarFromFile, writeHarToFile } from "./utils";
import config from "../../har.config.json";
import { QboAccount } from "../types";

export default function save() {
  const { qboAccounts } = config;

  qboAccounts.forEach((qboAccount) => {
    download(qboAccount as QboAccount)
      .then((harFilePath) => {
        const har = getHarFromFile(harFilePath);
        if (!har) return;
        const processedHar = cleanUpEntries(har);
        writeHarToFile(processedHar, qboAccount.accountType);
      })
      .catch((e) => console.error(e));
  });
}
