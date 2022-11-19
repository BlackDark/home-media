import * as cloudflare from "@pulumi/cloudflare";
import { Output } from "@pulumi/pulumi";
import { buildCloudflareRecords } from "./cloudflare-records";
import { DnsRecord, PageRule } from "./types";

export function setupCloudflare(reverseProxyIp: Output<string>) {
  for (const site of buildCloudflareRecords(reverseProxyIp)) {
    const zone = createZone(site.baseDomain);

    createRecords(site.baseDomain, zone, site.records);
    createPageRules(site.baseDomain, zone, site.pageRules);
  }
}

function createZone(domain: string) {
  return new cloudflare.Zone(domain, {
    zone: domain,
  });
}

function createRecords(
  domain: string,
  zone: cloudflare.Zone,
  records?: DnsRecord[]
) {
  if (!records) {
    return;
  }

  for (const record of records) {
    const name = record.name?.length ? record.name : "@"; // @ has to be used instead of empty string
    const id = `${domain}-${record.id ?? record.type + "-" + name}`;

    new cloudflare.Record(id, {
      ...record,
      name,
      ttl: 1, // 1 means auto configured by cloudflare
      zoneId: zone.id,
    });
  }
}

function createPageRules(
  domain: string,
  zone: cloudflare.Zone,
  pageRules?: PageRule[]
) {
  if (!pageRules) {
    return;
  }

  for (const pageRule of pageRules) {
    const { name, ...args } = pageRule;
    new cloudflare.PageRule(`${domain}-${name}`, {
      ...args,
      zoneId: zone.id,
    });
  }
}
