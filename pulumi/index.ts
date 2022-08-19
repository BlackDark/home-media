import * as cloudflare from "@pulumi/cloudflare";
import { DnsRecord, PageRule, Site } from "./types";

const CLOUDFLARE_DUMMY_IP = "192.0.2.1";

const sites: Site[] = [
  {
    baseDomain: "linkvt.de",
    records: [
      {
        type: "A",
        value: CLOUDFLARE_DUMMY_IP,
        proxied: true,
      },
      {
        name: "www",
        type: "CNAME",
        value: "linkvt.github.io",
      },
      {
        id: "mx-1",
        type: "MX",
        value: "route1.mx.cloudflare.net",
        priority: 68,
      },
      {
        id: "mx-2",
        type: "MX",
        value: "route2.mx.cloudflare.net",
        priority: 58,
      },
      {
        id: "mx-3",
        type: "MX",
        value: "route3.mx.cloudflare.net",
        priority: 89,
      },
      {
        id: "spf",
        type: "TXT",
        value: "v=spf1 include:_spf.mx.cloudflare.net ~all",
      },
      {
        id: "google-site-verification",
        type: "TXT",
        value: `google-site-verification=EkDgV6CTuuKRIdXqWzug81h1nUJ0gYpDYOhgwIT0v4c`,
      },
      {
        name: "em585",
        type: "CNAME",
        value: "u28506693.wl194.sendgrid.net",
      },
      {
        name: "s1._domainkey",
        type: "CNAME",
        value: "s1.domainkey.u28506693.wl194.sendgrid.net",
      },
      {
        name: "s2._domainkey",
        type: "CNAME",
        value: "s2.domainkey.u28506693.wl194.sendgrid.net",
      },
      {
        name: "*.home",
        type: "CNAME",
        value: "v21904.1blu.de",
        proxied: true,
      },
    ],
    pageRules: [
      {
        name: "redirect-to-www",
        actions: {
          forwardingUrl: {
            statusCode: 301,
            url: "https://www.linkvt.de/$1",
          },
        },
        target: "linkvt.de/*",
      },
    ],
  },
  {
    baseDomain: "vincentlink.de",
    records: [
      { type: "A", value: CLOUDFLARE_DUMMY_IP, proxied: true },
      { type: "A", name: "*", value: CLOUDFLARE_DUMMY_IP, proxied: true },
      {
        id: "mx-1",
        type: "MX",
        value: "route1.mx.cloudflare.net",
        priority: 72,
      },
      {
        id: "mx-2",
        type: "MX",
        value: "route2.mx.cloudflare.net",
        priority: 70,
      },
      {
        id: "mx-3",
        type: "MX",
        value: "route3.mx.cloudflare.net",
        priority: 33,
      },
      {
        id: "spf",
        type: "TXT",
        value: "v=spf1 include:_spf.mx.cloudflare.net ~all",
      },
    ],
    pageRules: [
      {
        name: "redirect-to-www.linkvt.de",
        actions: {
          forwardingUrl: {
            statusCode: 302,
            url: "https://www.linkvt.de/$2",
          },
        },
        target: "*vincentlink.de/*",
      },
    ],
  },
];

for (const site of sites) {
  const zone = createZone(site.baseDomain);

  createRecords(site.baseDomain, zone, site.records);
  createPageRules(site.baseDomain, zone, site.pageRules);
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
