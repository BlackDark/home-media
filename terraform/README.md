# Terraform

LDAP provider should be installed before with the terraform script.

- Existing outpost has to be imported manually
- Existing kubernetes connection has to be imported manually
- after terraform execution you have to update password for created user `ldapservice`

For LDAP to work you have to configure LDAP:
- Install LDAP plugin
- reboot jellyfin
- configure LDAP as described with config below

```xml
<!-- cat /config/data/plugins/configurations/LDAP-Auth.xml -->
<?xml version="1.0" encoding="utf-8"?>
<PluginConfiguration xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <LdapServer>ak-outpost-ldap.authentik</LdapServer>
  <LdapPort>389</LdapPort>
  <UseSsl>false</UseSsl>
  <UseStartTls>false</UseStartTls>
  <SkipSslVerify>true</SkipSslVerify>
  <LdapBindUser>cn=ldapservice,ou=users,dc=ldap,dc=goauthentik,dc=io</LdapBindUser>
  <LdapBindPassword>CHANGEME</LdapBindPassword>
  <LdapBaseDn>dc=ldap,dc=goauthentik,dc=io</LdapBaseDn>
  <LdapSearchFilter>(memberOf=cn=jellyfin_users,ou=groups,dc=ldap,dc=goauthentik,dc=io)</LdapSearchFilter>
  <LdapAdminBaseDn />
  <LdapAdminFilter>(memberOf=cn=jellyfin_admins,ou=groups,dc=ldap,dc=goauthentik,dc=io)</LdapAdminFilter>
  <EnableLdapAdminFilterMemberUid>false</EnableLdapAdminFilterMemberUid>
  <LdapSearchAttributes>uid, cn, mail, displayName</LdapSearchAttributes>
  <LdapClientCertPath />
  <LdapClientKeyPath />
  <LdapRootCaPath />
  <CreateUsersFromLdap>true</CreateUsersFromLdap>
  <AllowPassChange>false</AllowPassChange>
  <LdapUsernameAttribute>cn</LdapUsernameAttribute>
  <LdapPasswordAttribute />
  <EnableAllFolders>false</EnableAllFolders>
  <EnabledFolders />
  <PasswordResetUrl />
</PluginConfiguration>
```
