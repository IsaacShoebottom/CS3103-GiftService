#!/usr/bin/env python3
from flask import Flask, jsonify, abort, request, make_response, session
from flask_restful import reqparse, Resource, Api
from ldap3 import Server, Connection, ALL
from ldap3.core.exceptions import *
from flask_session import Session

import cgitb
cgitb.enable()

from util import db_access, auth_route, check_route_data, is_url
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

# Auth routing: LOGIN, STATUS, LOGOUT
class auth(Resource):
	# Log the user in
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

		request_params['username'] = request_params['username'].strip()
		# Remove @unb.ca if it exists
		request_params['username'] = request_params['username'].rstrip("@unb.ca")

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
				# Check if user exists in the database
				sqlProc = 'createUser'
				sqlArgs = [request_params['username']]
				try:
					db_access(sqlProc, sqlArgs)
				except Exception as e:
					abort(500, message = e) # server error
			except (LDAPException):
				response = {'status': 'access denied'}
				responseCode = 403
			finally:
				ldapConnection.unbind()

		return make_response(jsonify(response), responseCode)

	# Check for a login
	@app.route('/auth/status', methods=['GET'])
	def status():
		if 'username' in session:
			response = {
				'status': 'success',
				'username': session['username']
				}
			responseCode = 200
		else:
			response = {'status': 'failure'}
			responseCode = 403
		return make_response(jsonify(response), responseCode)
	
	# Log the user out
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
	
class presents(Resource):
 	# GET: Retrieve all presents from a specific username
	def get(self, username):
		sqlProc = 'getPresentsByUsername'
		sqlArgs = [username]
		try:
			rows = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		return make_response(jsonify({'presents': rows}), 200) # turn set into json and return it
	
	# POST: Create a new present for a specific username
	def post(self, username):
		response, responseCode, success = auth_route(username, session)
		if not success:
			return make_response(jsonify(response), responseCode)
		response, responseCode, success = check_route_data(request)
		if not success:
			return make_response(jsonify(response), responseCode)

		title = request.json['title']
		link = request.json['link']

		if not is_url(link):
			abort(400)

		sqlProc = 'createPresent'
		sqlArgs = [username, title, link]
		try:
			row = db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error

		return make_response('Present created', 201) # successful resource creation
	
	# PUT: Update a specific present
	def put(self, username):
		response, responseCode, success = auth_route(username, session)
		if not success:
			return make_response(jsonify(response), responseCode)
		response, responseCode, success = check_route_data(request)
		if not success:
			return make_response(jsonify(response), responseCode)

		id = request.json['id']
		id = int(id)
		title = request.json['title']
		link = request.json['link']

		if not is_url(link):
			abort(400)

		sqlProc = 'updatePresentById'
		sqlArgs = [id, title, link]
		try:
			db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		
		return make_response('Present updated', 204)
	
	# DELETE: Delete a specific present
	def delete(self, username):
		response, responseCode, success = auth_route(username, session)
		if not success:
			return make_response(jsonify(response), responseCode)
		response, responseCode, success = check_route_data(request)
		if not success:
			return make_response(jsonify(response), responseCode)

		id = request.json['id']
		id = int(id)
		sqlProc = 'deletePresentById'
		sqlArgs = [id]
		try:
			db_access(sqlProc, sqlArgs)
		except Exception as e:
			abort(500, message = e) # server error
		
		return make_response('Present deleted', 204)

# Identify/create endpoints and endpoint objects
api = Api(app)
api.add_resource(presents, '/presents/<string:username>/')

# Main
if __name__ == "__main__":
	app.run(host=settings.APP_HOST, port=settings.APP_PORT, debug=settings.APP_DEBUG, ssl_context=settings.APP_SSL)
