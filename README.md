# Dataset API Server

## About

 * Receives and sends datasets as files and json
 * Uses [MongoDB](https://www.mongodb.com/) to store datasets
 * [.csv](https://en.wikipedia.org/wiki/Comma-separated_values), [.json](https://en.wikipedia.org/wiki/JSON) and [.arff](https://www.cs.waikato.ac.nz/~ml/weka/arff.html) file formats are supported. Once the file contents have been saved, it can be downloaded as any of the previously listed formats.
 * Some features (such as dataset uploading) require an authorization token that can be received by logging in with an account.
 * An account can be created by sending a POST-request with credentials to the '/users' endpoint.
 * Max upload size at a time: 100 KB
 * Unit tests ready for '/datasets/' endpoint


## Setup

 1. Create a MongoDB database
 2. Clone this repository
 3. Run `npm install` inside the project folder
 4. Set environment variables (More on this in the Configuration section) 

 To run this project in production mode, run `npm start`. For development, run `npm run watch`. And to run tests, run `npm test`.


## Configuration

 In order to use this server, the following environment values should be set:
 * PORT: Port in which this server runs. The matching frontend expects this to be set to 8000)
 * MONGODB_URI: MongoDB address)
 * SECRET: String that is used for user authentication
 * (TEST_MONGODB_URI: MongoDB address that is used in test environment)


## Supported HTTP-Requests

 |        | /users | /users/:id | /login | /datasets | /datasets/:id | /datasets/:id/:format |
 |:------:|:------:|:----------:|:------:|:---------:|:-------------:|:---------------------:|
 | GET    | NO     | NO         | NO     | YES       | YES           | YES                   |
 | POST   | YES    | NO         | YES    | YES       | NO            | NO                    |
 | DELETE | NO     | YES        | NO     | NO        | YES           | NO                    |
 | PUT    | NO     | YES        | NO     | NO        | NO            | NO                    |     

 ### Requests that require an authentication token

 |        | /users | /users/:id | /login | /datasets | /datasets/:id | /datasets/:id/:format |
 |:------:|:------:|:----------:|:------:|:---------:|:-------------:|:---------------------:|
 | GET    | -      | -          | -      | NO        | NO            | NO                    |
 | POST   | NO     | -          | NO     | YES       | -             | -                     |
 | DELETE | -      | YES        | -      | -         | YES           | -                     |
 | PUT    | -      | YES        | -      | -         | -             | -                     |

 The authentication token needs to be sent as the 'Authorization' header value with the prefix 'bearer '. Example: Header key: 'Authorization', value: 'bearer someValidToken'.

 ### HTTP-Request Descriptions
  
  #### /users

   ##### POST 
   
   Creates a new account with given credentials. The credentials should be passed in the request body. The account creation will fail if the username is too short (3 letter) or if it is not unique.

   Example body:
   ```
   {
    "username": "unique username",
    "password": "not an easy to guess pw"
   }
   ```

  #### /users/:id

   ##### DELETE

   Deletes an account with the same id as the one specified in the URL parameter. All the datasets that the user has posted will also be deleted.

   ##### PUT

   Updates an account with the same id as the one specified in the URL parameter. Only the password can be changed.

   Example body:
   ```
   {
     "password": "new password"
   }
   ```

  #### /login

   ##### POST  
    
   Checks the database to see if an account with the given credentials exists. If such an account is found, the response will contain an authentication token along with the username.

   Example body:
   ```
   {
    "username": "unique username",
    "password": "not an easy to guess pw"
   }
   ```

  #### /datasets

   ##### GET

   Returns all of the uploaded datasets as JSON. This endpoint supports [query strings](https://en.wikipedia.org/wiki/Query_string) with the following options: 'name', 'username' 'fields' and 'limit_instances'. The first two options tell this server to only return datasets that match the corresponding values (same name or username). 'fields' option lets the requester specify which of the dataset fields should be returned. These fields are:

   * id
   * user
   * name
   * relation (only appears in datasets uploaded as .arff files)
   * headers
   * instances

   Finally the 'limit_instances' option tells the server to only return the specified amount of data instances per dataset. The request will fail (Status code 400) if the value is not a positive number.

   ##### POST

   Saves the received dataset json to the database. The dataset contents should be placed inside the request body.

   Example body:
   ```
   {
     "name": "patient_stats",
     "headers": [
       "height",
       "weight",
       "blood-type"
     ],
     "instances": [
       [
         "160cm",
         "87kg",
         "A"
       ],...
     ],
     "user": "someValidUserId"
   }
   ```

  #### /datasets/:id

   ##### GET

   Returns the dataset with an id that matches the specified URL parameter (:id) as JSON if one exists. This endpoint supports the same query string options as the previous endpoint ('/datasets').

   ##### DELETE

   Deletes the dataset with an id that matches the specified URL parameter (:id) if one exists. Users can only delete datasets that they themselves have posted (same account).

  #### /datasets/:id/:format

   ##### GET

   Attaches a file with the same id as is specified in the URL parameter (:id) to the response. The file format will is specified in the ':format' URL parameter. Format options are csv, arff and json. Sent files are removed from the disk as soon as the response has been sent.


## OAuth2 Authorization Flow (Resource Owner Password Credentials)

 During user login, the client sends the user's credentials to this server (POST request to '/login'). The credentials are then validated and access token is sent on the response. The client can then send the received token with further requests to gain access to services such as file uploads which would otherwise be unavailable.

 It should be noted that this project does not separate the authorization server from the resource server. In a more strict environment, the validation process and token creation should be handled in a dedicated authorization server.

 For more information on OAuth2, check this [link](https://oauth.net/2/)


## TODO 