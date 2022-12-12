import * as k8s from "@pulumi/kubernetes";

const mediaKustomize = new k8s.kustomize.Directory("media", {
  directory: "./media",
});
