import * as cloudflare from "@pulumi/cloudflare";
import { DnsRecord, PageRule, Site } from "./types";

const BASE_DOMAIN_LINKVT = "linkvt.de";
const CLOUDFLARE_DUMMY_IP = "192.0.2.1";

const sites: Site[] = [
  {
    baseDomain: BASE_DOMAIN_LINKVT,
    records: [
      { type: "A", value: CLOUDFLARE_DUMMY_IP, proxied: true },
      { name: "www", type: "CNAME", value: "linkvt.github.io" },
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
      { name: "em585", type: "CNAME", value: "u28506693.wl194.sendgrid.net" },
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
    ],
    pageRules: [
      {
        name: "redirect-to-www",
        actions: {
          forwardingUrl: {
            statusCode: 301,
            url: `https://www.${BASE_DOMAIN_LINKVT}/$1`,
          },
        },
        target: `${BASE_DOMAIN_LINKVT}/*`,
      },
    ],
  },
];

for (const site of sites) {
  const zone = deployZone(site.baseDomain);

  deployRecords(site.records ?? [], zone);
  deployPageRules(site.pageRules ?? [], zone);
}

function deployZone(domain: string) {
  return new cloudflare.Zone(domain, {
    zone: domain,
  });
}

function deployRecords(records: DnsRecord[], zone: cloudflare.Zone) {
  for (const record of records) {
    const name = record.name?.length ? record.name : "@"; // @ has to be used instead of empty string
    const id = record.id ?? `${record.type}-${name}`;

    new cloudflare.Record(id, {
      ...record,
      name,
      ttl: 1, // 1 means auto configured by cloudflare
      zoneId: zone.id,
    });
  }
}

function deployPageRules(pageRules: PageRule[], zone: cloudflare.Zone) {
  for (const pageRule of pageRules) {
    const { name, ...args } = pageRule;
    new cloudflare.PageRule(name, {
      ...args,
      zoneId: zone.id,
    });
  }
}
