.PHONY: seal
seal:
	cat secret-plain-authentik.yml | kubeseal -n authentik -o yaml > secret-sealed-authentik.yml
	cat secret-plain-postgres.yml | kubeseal -n authentik -o yaml > secret-sealed-postgres.yml
