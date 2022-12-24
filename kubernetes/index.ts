import * as k8s from "@pulumi/kubernetes";
import { deployCertManager } from "./ts/cert-manager";

new k8s.kustomize.Directory("media", {
  directory: "./yml/media",
});

deployCertManager();
