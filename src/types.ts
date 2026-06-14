interface NameValue {
  name: string;
  value: string;
}

export interface Entry {
  pageref: string;
  startedDateTime: string;
  time: number;
  serverIPAddress: string;
  _serverPort: number;
  _securityDetails: {
    protocol: string;
    subjectName: string;
    issuer: string;
    validFrom: number;
    validTo: number;
  };
  timings: {
    dns: number;
    connect: number;
    ssl: number;
    send: number;
    wait: number;
    receive: number;
  };
  request: {
    method: string;
    url: string;
    httpVersion: string;
    cookies?: NameValue[];
    headers?: NameValue[];
    queryString?: NameValue[];
    headersSize: number;
    bodySize: number;
    postData?: {
      mimeType: string;
      text?: string;
      params?: [];
    };
  };
  response: {
    status: number;
    statusText: string;
    httpVersion: string;
    cookies?: NameValue[];
    headers: NameValue[];
    content: {
      size: number;
      mimeType: string;
      compression: number;
      text?: string;
      encoding?: string;
    };
    headersSize: number;
    bodySize: number;
    redirectURL: string;
    _transferSize: number;
  };
  cache: {};
}

export interface Har {
  log: {
    version: string;
    creator: {
      name: string;
      version: string;
    };
    browser: {
      name: string;
      version: string;
    };
    pages: {
      startedDateTime: string;
      id: string;
      title: string;
      pageTimings: {
        onContentLoad: number;
        onLoad: number;
      };
    }[];
    entries: Entry[];
  };
}

export interface QboAccount {
  username: string;
  password: string;
  environment: "prod" | "e2e";
  accountType: string;
}
