.PHONY: seal
seal:
	cat secret-plain-basic-auth.yml | kubeseal -n media -o yaml > secret-sealed-basic-auth.yml
