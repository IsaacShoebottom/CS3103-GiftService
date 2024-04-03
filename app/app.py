#!/usr/bin/env python3
from flask import Flask, jsonify, abort, request, make_response, session
from flask_restful import reqparse, Resource, Api
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import *
from flask_session import Session

import cgitb
cgitb.enable()

from db_util import db_access
import settings # Our server and db settings, stored in settings.py

app = Flask(__name__, static_url_path='/static')
api = Api(app)
app.secret_key = settings.SECRET_KEY
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'peanutButter'
app.config['SESSION_COOKIE_DOMAIN'] = settings.APP_HOST
Session(app)

# Error handlers
@app.errorhandler(400) # decorators to add to 400 response
def not_found(error):
	return make_response(jsonify( { "status": "Bad request" } ), 400)

@app.errorhandler(404) # decorators to add to 404 response
def not_found(error):
	return make_response(jsonify( { "status": "Resource not found" } ), 404)

# Static Endpoints
class Root(Resource):
   # get method for index page
	def get(self):
		return app.send_static_file('index.html')

api.add_resource(Root,'/')

class Developer(Resource):
   # get method for developer page
	def get(self):
		return app.send_static_file('developer.html')

api.add_resource(Developer,'/dev')


# Auth routing: LOGIN, STATUS, LOGOUT
class auth(Resource):

	# Log the user in
	# curl -i -H "Content-Type: application/json" -X POST -d '{"username": "bfanjoy", "password": "pass"}' -c cookie-jar http://cs3103.cs.unb.ca:8033/auth/login
	@app.route('/auth/login', methods=['POST'])
	def login():
		if not request.json:
			abort(400) # bad request
		# Parse the json
		parser = reqparse.RequestParser()
		try:
			# Check for required attributes in json document, create a dictionary
			parser.add_argument('username', type=str, required=True)
			parser.add_argument('password', type=str, required=True)
			request_params = parser.parse_args()
		except:
			abort(400) # bad request

		# Already logged in
		if request_params['username'] in session:
			response = {'status': 'success'}
			responseCode = 200
		else:
			try:
				ldapServer = Server(host=settings.LDAP_HOST)
				ldapConnection = Connection(ldapServer,
					raise_exceptions=True,
					user='uid='+request_params['username']+', ou=People,ou=fcs,o=unb',
					password = request_params['password'])
				ldapConnection.open()
				ldapConnection.start_tls()
				ldapConnection.bind()
				# At this point we have sucessfully authenticated.
				session['username'] = request_params['username']
				response = {'status': 'success' }
				responseCode = 201
			except (LDAPException):
				response = {'status': 'Access denied'}
				responseCode = 403
			finally:
				ldapConnection.unbind()

		sqlProc = 'createUser'
		sqlArgs = [request_params['username']]
		try:
			row = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error

		return make_response(jsonify(response), responseCode)

	# Check for a login
	# curl -i -H "Content-Type: application/json" -X GET -b cookie-jar http://cs3103.cs.unb.ca:8033/auth/status
	@app.route('/auth/status', methods=['GET'])
	def status():
		if 'username' in session:
			response = {'status': 'success'}
			responseCode = 200
		else:
			response = {'status': 'failure'}
			responseCode = 403
		return make_response(jsonify(response), responseCode)

	@app.route('/auth/logout', methods=['POST'])
	def logout():
		try:
			session.pop('username', None)
			response = {'status': 'success'}
			responseCode = 204
		except:
			response = {'status': 'failure'}
			responseCode = 403
		return make_response(jsonify(response), responseCode)
	
# Presents routing: GET
class presents(Resource):

	# GET: Retrieve all presents from a specific username

	def get(self, username):

		# Sample command line usage:
        #
        # curl -i -X GET http://cs3103.cs.unb.ca:8033/presents/Rick
		
		sqlProc = 'getPresentsByUsername'
		sqlArgs = [username]
		try:
			rows = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		return make_response(jsonify({'presents': rows}), 200) # turn set into json and return it
	
	def post(self, username):
        
        # Sample command line usage:
        #
        # curl -i -X POST -H "Content-Type: application/json" -d '{"Title": "Book", "Link": "example.com"}' http://cs3103.cs.unb.ca:8033/presents

		if 'username' not in session or session['username'] != username:
			abort(400) # bad request

		title = request.json['Title'];
		link = request.json['Link'];

		sqlProc = 'createPresent'
		sqlArgs = [username, title, link]
		try:
			row = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error

		return make_response('Present created', 201) # successful resource creation
	
	# PUT: Update a specific present
	# Sample command line usage:
    # curl -i -X PUT -H "Content-Type: application/json" -d '{"Title": "Book", "nTitle": "Towels", "nLink": "example2.com"}' http://cs3103.cs.unb.ca:8033/presents
	def put(self, username):
		if not request.json:
			abort(400) # bad request

		id = request.json['Id']
		id = int(id)
		title = request.json['Title']
		link = request.json['Link']

		sqlProc = 'updatePresentById'
		sqlArgs = [id, title, link]
		try:
			row = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		
		return make_response('Present updated', 204)
	
	# DELETE: Delete a specific present
	# Sample command line usage:
	# curl -i -X DELETE -H "Content-Type: application/json" -d '{"Id": "id"}' http://cs3103.cs.unb.ca:8033/presents/ishoebot/
	def delete(self, username):
		if not request.json:
			abort(400) # bad request

		id = request.json['Id']
		id = int(id)

		#sqlProc = 'deletePresent'
		#sqlArgs = [username, title]
		sqlProc = 'deletePresentById'
		sqlArgs = [id]
		try:
			row = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		
		return make_response('Present deleted', 204)

# Identify/create endpoints and endpoint objects
api = Api(app)
api.add_resource(presents, '/presents/<string:username>/')

# Main
if __name__ == "__main__":
	app.run(host=settings.APP_HOST, port=settings.APP_PORT, debug=settings.APP_DEBUG)
