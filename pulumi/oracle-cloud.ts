import * as oci from "@pulumi/oci";
import { Config } from "@pulumi/pulumi";

// https://registry.terraform.io/providers/oracle/oci/latest/docs/resources/core_security_list#protocol
const ICMP_PROTOCOL_ID = "1";
const TCP_PROTOCOL_ID = "6";

const config = new Config();
const SHAPE_NAME = config.require("oracleShapeName");
const IMAGE_SOURCE_ID = config.require("oracleImageId");
const AVAILABILITY_DOMAIN_NAME = config.require("oracleAvailabilityDomainName");
const SSH_PUBLIC_KEY = config.require("sshPublicKey");

export function setupOracleCloud() {
  const compartment = new oci.identity.Compartment("reverse-proxy", {
    description: "Compartment for the reverse proxy",
  });

  const vcn = new oci.core.Vcn("reverse-proxy", {
    cidrBlocks: ["10.0.0.0/16"],
    compartmentId: compartment.id,
  });

  const internetGateway = new oci.core.InternetGateway("igw", {
    compartmentId: compartment.id,
    vcnId: vcn.id,
  });

  new oci.core.DefaultRouteTable("reverse-proxy", {
    manageDefaultResourceId: vcn.defaultRouteTableId,
    routeRules: [
      {
        networkEntityId: internetGateway.id,
        destination: "0.0.0.0/0",
      },
    ],
  });

  const tcpIngressRule = {
    protocol: TCP_PROTOCOL_ID,
    source: "0.0.0.0/0",
  };

  new oci.core.DefaultSecurityList("reverse-proxy", {
    manageDefaultResourceId: vcn.defaultSecurityListId,
    ingressSecurityRules: [
      {
        description: "ICMP",
        protocol: ICMP_PROTOCOL_ID,
        source: "0.0.0.0/0",
      },
      {
        ...tcpIngressRule,
        description: "SSH",
        tcpOptions: {
          min: 22,
          max: 22,
        },
      },
      {
        ...tcpIngressRule,
        description: "HTTP",
        tcpOptions: {
          min: 80,
          max: 80,
        },
      },
      {
        ...tcpIngressRule,
        description: "HTTPS",
        tcpOptions: {
          min: 443,
          max: 443,
        },
      },
    ],
    egressSecurityRules: [
      {
        destination: "0.0.0.0/0",
        protocol: "all",
      },
    ],
  });

  const subnet = new oci.core.Subnet("reverse-proxy", {
    cidrBlock: "10.0.0.0/24",
    compartmentId: compartment.id,
    vcnId: vcn.id,
  });

  const instance = new oci.core.Instance(
    "reverse-proxy",
    {
      compartmentId: compartment.id,
      availabilityDomain: AVAILABILITY_DOMAIN_NAME,
      createVnicDetails: {
        subnetId: subnet.id,
      },
      displayName: "reverse-proxy",
      metadata: {
        ssh_authorized_keys: SSH_PUBLIC_KEY,
      },
      shape: SHAPE_NAME,
      shapeConfig: {
        ocpus: 2,
        memoryInGbs: 12,
      },
      sourceDetails: {
        sourceType: "image",
        sourceId: IMAGE_SOURCE_ID,
      },
    },
    {
      deleteBeforeReplace: true, // required to not exceed the limits
    }
  );

  return {
    reverseProxyIp: instance.publicIp,
  };
}
