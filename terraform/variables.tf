variable "prowlarr_url" {
  type = string
}

variable "prowlarr_apikey" {
  type      = string
  sensitive = true
}

variable "authentik_token" {
  type      = string
  sensitive = true
}
