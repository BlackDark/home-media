import * as cloudflare from "@pulumi/cloudflare";

export type Site = {
  baseDomain: string;
  records?: DnsRecord[];
  pageRules?: PageRule[];
};

export type DnsRecord = Omit<cloudflare.RecordArgs, "name" | "zoneId"> & {
  id?: string;
  name?: string;
  type: "A" | "CNAME" | "MX" | "TXT";
};

export type PageRule = Omit<cloudflare.PageRuleArgs, "zoneId"> & {
  name: string;
};
