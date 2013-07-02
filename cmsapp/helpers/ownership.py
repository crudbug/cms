from flask import session

def check_ownership(id):
	has_ownership = False

	if int(session['site_id']) == int(id):
		has_ownership = True

	return has_ownership
