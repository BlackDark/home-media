import { Output } from "@pulumi/pulumi";
import { Site } from "./types";

const CLOUDFLARE_DUMMY_IP = "192.0.2.1";

export function buildCloudflareRecords(reverseProxyIp: Output<string>): Site[] {
  return [
    {
      baseDomain: "linkvt.de",
      records: [
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
          name: "*",
          type: "A",
          value: reverseProxyIp,
          proxied: true,
        },
        {
          name: "_dmarc",
          type: "TXT",
          value: "v=DMARC1; p=quarantine; rua=mailto:mail@linkvt.de",
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
}
