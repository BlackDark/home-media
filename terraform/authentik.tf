
# REST API: https://goauthentik.io/developer-docs/api/browser#post-/providers/proxy/

data "authentik_flow" "default-authorization-flow" {
  slug = "default-provider-authorization-explicit-consent"
}

resource "authentik_provider_proxy" "default" {
  name                  = "Default"
  external_host         = "https://authentik.oci.eduard-marbach.de"
  authorization_flow    = data.authentik_flow.default-authorization-flow.id
  cookie_domain         = "oci.eduard-marbach.de"
  mode                  = "forward_domain"
  access_token_validity = "hours=24"
}

resource "authentik_application" "default" {
  name              = "Default"
  slug              = "default-app"
  protocol_provider = authentik_provider_proxy.default.id
}

# Needs to be imported by hand
resource "authentik_outpost" "default_outpost" {
  name = "authentik Embedded Outpost"
  protocol_providers = [
    authentik_provider_proxy.default.id
  ]
}

# Needs to be imported by hand
resource "authentik_service_connection_kubernetes" "local" {
  name  = "Local Kubernetes Cluster"
  local = true
}

## LDAP
resource "authentik_stage_identification" "ldap" {
  name                      = "ldap-identification-stage"
  user_fields               = ["username", "email"]
  password_stage            = authentik_stage_password.ldap.id
  case_insensitive_matching = true
}

resource "authentik_stage_password" "ldap" {
  name = "ldap-authentication-password"
  backends = [
    "authentik.core.auth.InbuiltBackend",
    "authentik.core.auth.TokenBackend",
    "authentik.sources.ldap.auth.LDAPBackend"
  ]
}

resource "authentik_stage_user_login" "ldap" {
  name = "ldap-authentication-login"
}

resource "authentik_flow" "ldap" {
  name        = "ldap-authentication-flow"
  title       = "ldap-authentication-flow"
  slug        = "ldap-authentication-flow"
  designation = "authentication"
}

resource "authentik_flow_stage_binding" "ldap_identification" {
  target = authentik_flow.ldap.uuid
  stage  = authentik_stage_identification.ldap.id
  order  = 10
}

resource "authentik_flow_stage_binding" "ldap_auth" {
  target = authentik_flow.ldap.uuid
  stage  = authentik_stage_user_login.ldap.id
  order  = 30
}

resource "authentik_provider_ldap" "ldap" {
  name         = "ldap"
  base_dn      = "dc=ldap,dc=goauthentik,dc=io"
  bind_flow    = authentik_flow.ldap.uuid
  search_group = authentik_group.ldapsearch.id
}

resource "authentik_application" "name" {
  name              = "ldap"
  slug              = "ldap"
  protocol_provider = authentik_provider_ldap.ldap.id
}

resource "authentik_outpost" "ldap" {
  name = "ldap"
  protocol_providers = [
    authentik_provider_ldap.ldap.id
  ]
  service_connection = authentik_service_connection_kubernetes.local.id
  type               = "ldap"
}

resource "authentik_group" "ldapsearch" {
  name = "ldapsearch"
}

resource "authentik_user" "ldapservice" {
  username = "ldapservice"
  groups   = [authentik_group.ldapsearch.id]
  type     = "service_account"
}

resource "authentik_group" "jellyfin_users" {
  name = "jellyfin_users"
}

resource "authentik_group" "jellyfin_admins" {
  name = "jellyfin_admins"
}

# After execution create/update password for user ldapservice
