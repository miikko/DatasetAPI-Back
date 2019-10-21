# Dataset API Server

## SETUP (In progress)


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

* Decline datasets that are bigger than a set size