# Directories
"app" holds all relevant Flask app files, 

"static" inside of "app" holds the static pages for the frontend

"db" holds all database scripts

"api" holds all the API documentation

# How to run
```sh
# Start the app: ./run.sh
./run.sh

# Or alternativly, move to the app dir, as cert and key are relative
cd app/
./app.py
```

# Info
When logging in, you are automatically registered to our service, and can begin creating presents

# Searching
When searching, change to the browse tab and key in a name. To view how another user looks, key in "ishoebot" to view an example profile

# Test Cases with CURL
```sh
# Log the user in
curl -i -H "Content-Type: application/json" -X POST -d '{"username": "name", "password": "pass"}' -c cookie-jar http://cs3103.cs.unb.ca:8034/auth/login

# Check for a login
curl -i -H "Content-Type: application/json" -X GET -b cookie-jar http://cs3103.cs.unb.ca:8034/auth/status

# GET: Retrieve all presents from a specific username
curl -i -X GET http://cs3103.cs.unb.ca:8034/presents/Rick

# POST: Create a new present
curl -i -X POST -H "Content-Type: application/json" -d '{"title": "Book", "link": "book.com"}' http://cs3103.cs.unb.ca:8034/present

# PUT: Update a specific present
curl -i -X PUT -H "Content-Type: application/json" -d '{"id": "42", "title": "Towels", "link": "towels.com"}' http://cs3103.cs.unb.ca:8034/present

# DELETE: Delete a specific present
curl -i -X DELETE -H "Content-Type: application/json" -d '{"id": "42"}' http://cs3103.cs.unb.ca:8034/present

# Log the user out
curl -i -H "Content-Type: application/json" -X POST -b cookie-jar http://cs3103.cs.unb.ca:8034/auth/logout
```