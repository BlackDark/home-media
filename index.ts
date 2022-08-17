import * as cloudflare from "@pulumi/cloudflare";

const BASE_DOMAIN = "linkvt.de";
const WINT_GLOBAL_IP = "62.108.32.129";
const RECORDS: Record[] = [
  { type: "A", value: WINT_GLOBAL_IP },
  { name: "*", type: "A", value: WINT_GLOBAL_IP },
  { name: "mail", type: "A", value: WINT_GLOBAL_IP },
  { name: "www", type: "CNAME", value: "linkvt.github.io" },
  { type: "MX", value: `mail.${BASE_DOMAIN}`, priority: 0 },
  {
    id: "google-site-verification",
    type: "TXT",
    value: `google-site-verification=EkDgV6CTuuKRIdXqWzug81h1nUJ0gYpDYOhgwIT0v4c`,
  },
  {
    id: "spf",
    type: "TXT",
    value: `v=spf1 a mx include:spf-all.comtrance.de ~all`,
  },
];

type Record = Omit<cloudflare.RecordArgs, "name" | "zoneId"> & {
  id?: string;
  name?: string;
  type: "A" | "CNAME" | "MX" | "TXT";
};

const zone = new cloudflare.Zone(BASE_DOMAIN, {
  zone: BASE_DOMAIN,
});

for (const record of RECORDS) {
  const name = record.name?.length ? record.name : "@"; // @ has to be used instead of empty string
  const id = record.id ?? `${record.type}-${name}`;

  new cloudflare.Record(id, {
    ...record,
    name,
    ttl: 1, // 1 means auto configured by cloudflare
    zoneId: zone.id,
  });
}
