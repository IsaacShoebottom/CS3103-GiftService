# Directories (Out of date)
"app" holds all relevant app files, 

"static" inside of "app" holds the static pages

"db" holds all database scritps

"api" holds all the API documentation

# Test Cases (Out of date)
```sh
# Start the app: ./app.py

# Log the user in
curl -i -H "Content-Type: application/json" -X POST -d '{"username": "name", "password": "pass"}' -c cookie-jar http://cs3103.cs.unb.ca:8033/auth/login

# Check for a login
curl -i -H "Content-Type: application/json" -X GET -b cookie-jar http://cs3103.cs.unb.ca:8033/auth/status

# POST: Create a new user
curl -i -X POST -H "Content-Type: application/json" -d '{"Username": "Rick"}' http://cs3103.cs.unb.ca:8033/user

# GET: Retrieve all presents from a specific username
# curl -i -X GET http://cs3103.cs.unb.ca:8033/presents/Rick

# POST: Create a new present
curl -i -X POST -H "Content-Type: application/json" -d '{"Username": "Rick", "Title": "Book", "Link": "book.com"}' http://cs3103.cs.unb.ca:8033/present

# GET: Retrieve all presents from a specific username
curl -i -X GET http://cs3103.cs.unb.ca:8033/presents/Rick

# PUT: Update a specific present
curl -i -X PUT -H "Content-Type: application/json" -d '{"Username": "Rick", "Title": "Book", "nTitle": "Towels", "nLink": "towels.com"}' http://cs3103.cs.unb.ca:8033/present

# GET: Retrieve all presents from a specific username
curl -i -X GET http://cs3103.cs.unb.ca:8033/presents/Rick

# DELETE: Delete a specific present
curl -i -X DELETE -H "Content-Type: application/json" -d '{"Username": "Rick", "Title": "Towels"}' http://cs3103.cs.unb.ca:8033/present

# GET: Retrieve all presents from a specific username
curl -i -X GET http://cs3103.cs.unb.ca:8033/presents/Rick

# Log the user out
curl -i -H "Content-Type: application/json" -X POST -b cookie-jar http://cs3103.cs.unb.ca:8033/auth/logout
```