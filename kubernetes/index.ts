import * as k8s from "@pulumi/kubernetes";
import { deployCertManager } from "./cert-manager";

const mediaKustomize = new k8s.kustomize.Directory("media", {
  directory: "./media",
});

deployCertManager();
