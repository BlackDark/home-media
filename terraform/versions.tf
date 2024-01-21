terraform {
  required_providers {

    prowlarr = {
      source  = "devopsarr/prowlarr"
      version = "2.0.0"
    }

    authentik = {
      source  = "goauthentik/authentik"
      version = "2023.8.0"
    }
  }
}

provider "prowlarr" {
  url     = var.prowlarr_url
  api_key = var.prowlarr_apikey
}

provider "authentik" {
  url   = "https://authentik.oci.eduard-marbach.de"
  token = var.authentik_token
}
