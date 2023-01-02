.PHONY: seal
seal:
	cat secret-plain-smtp.yml | kubeseal -n default -o yaml > secret-sealed-smtp.yml
