import * as k8s from "@pulumi/kubernetes";

const LETSENCRYPT_ENVS: Record<string, string> = {
  production: "https://acme-v02.api.letsencrypt.org/directory",
  staging: "https://acme-staging-v02.api.letsencrypt.org/directory",
};

export function deployCertManager() {
  const namespace = createNamespace();
  const chart = deployChart(namespace);

  for (const [env, url] of Object.entries(LETSENCRYPT_ENVS)) {
    createClusterIssuers(env, url, chart);
  }
}

function createNamespace() {
  return new k8s.core.v1.Namespace("cert-manager", {
    metadata: {
      name: "cert-manager",
    },
  });
}

function deployChart(namespace: k8s.core.v1.Namespace) {
  // https://artifacthub.io/packages/helm/cert-manager/cert-manager
  return new k8s.helm.v3.Chart("cert-manager", {
    chart: "cert-manager",
    fetchOpts: {
      repo: "https://charts.jetstack.io",
    },
    namespace: namespace.metadata.name,
    values: {
      installCRDs: true,
    },
    version: "1.10.1",
  });
}

function createClusterIssuers(
  env: string,
  url: string,
  chart: k8s.helm.v3.Chart
) {
  new k8s.apiextensions.CustomResource(
    `letsencrypt-${env}-cluster-issuer`,
    {
      apiVersion: "cert-manager.io/v1",
      kind: "ClusterIssuer",
      metadata: {
        name: `letsencrypt-${env}`,
      },
      spec: {
        acme: {
          server: url,
          email: "mail@linkvt.de",
          privateKeySecretRef: {
            name: `letsencrypt-${env}`,
          },
          solvers: [
            {
              http01: {
                ingress: {},
              },
            },
          ],
        },
      },
    },
    {
      dependsOn: [chart],
    }
  );
}
