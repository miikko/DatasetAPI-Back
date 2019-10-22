# Dataset API Server

## About (In progress)

 * Receives and sends datasets as files and json
 * [.csv](https://en.wikipedia.org/wiki/Comma-separated_values), [.json](https://en.wikipedia.org/wiki/JSON) and [.arff](https://www.cs.waikato.ac.nz/~ml/weka/arff.html) file formats are supported. Once a file has been uploaded, it can be downloaded as any of the previously listed formats.
 * Some features (such as dataset uploading) require an authorization token that can be received by logging in with an account.
 * An account can be created by sending a POST-request with credentials to the '/users' endpoint.
 * Max upload size at a time: 100 KB


## Supported HTTP-Requests

 |        | /users | /login | /datasets | /datasets/:id | /datasets/:id/:format |
 |:------:|:------:|:------:|:---------:|:-------------:|:---------------------:|
 | GET    | NO     | NO     | YES       | YES           | YES                   |
 | POST   | YES    | YES    | NO        | YES           | NO                    |
 | DELETE | TODO   | NO     | NO        | YES           | NO                    |

 ### Requests that require authentication
  
  

## Setup (In progress)

 1. Create a Mongo Database
 2. Clone this repository
 3. Run 'npm install' inside the project folder
 4. Set environment variables (More on this in the Configuration section) 

 To run this project in production mode, run 'npm start'. For development, run 'npm run watch'. And to run tests, run 'npm test'.


## Configuration (In progress)

 In order to use this server, the following environment values should be set:
 * PORT: Port in which this server runs. The matching frontend expects this to be set to 8000)
 * MONGODB_URI: MongoDb address)
 * SECRET: String that is used for user authentication
 * (TEST_MONGODB_URI: MongoDb address that is used in test environment)


## OAuth2 Authorization Flow (Resource Owner Password Credentials)

 During user login, the client sends the user's credentials to this server (POST request to '/login'). The credentials are then validated and access token is sent on the response. The client can then send the received token with further requests to gain access to services such as file uploads which would otherwise be unavailable.

 It should be noted that this project does not separate the authorization server from the resource server. In a more strict environment, the validation process and token creation should be handled in a dedicated authorization server.

 For more information on OAuth2, check this [link](https://oauth.net/2/)


## TODO 
