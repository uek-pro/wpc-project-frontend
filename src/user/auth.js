import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { loginProviderName } from '../env.js';


export default class AuthFacade {

    constructor(userPool, creds) {
        this.userPool = userPool;
        this.creds = creds;
    }

    logIn(request) {

        const authenticationDetails = new AuthenticationDetails({
            Username: request.username,
            Password: request.password
        });
        
        const cognitoUser = new CognitoUser({
            Username: request.username,
            Pool: this.userPool
        });
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                this.refreshCredentials()
            },
            onFailure: (err) => {
                alert(err);
            }
        });
    }

    register(request) {

        this.userPool.signUp(
            request.username,
            request.password,
            [
                new CognitoUserAttribute({
                    Name: 'email',
                    Value: request.email
                }),
                new CognitoUserAttribute({
                    Name: 'name',
                    Value: request.name
                })
            ],
            null,
            (err, result) => {
                if (err) {
                    alert(err.message);
                    console.log(err);
                    return;
                }
                console.log(`Udało się. Username: ${result.user.getUsername()}`);
            }
        );
    }

    confirm(request) {

        const cognitoUser = new CognitoUser({
            Username: request.username,
            Pool: this.userPool
        })
        
        cognitoUser.confirmRegistration(
            request.code,
            true, 
            (err, result) => {
                if (err) {
                    alert(err);
                    return;
                }
                alert(result);
        });
    }

    getIdentityId() {
        return this.creds.identityId;
    }

    refreshCredentials()  {
        const cognitoUser = this.userPool.getCurrentUser();
    
        if (cognitoUser != null) {
            cognitoUser.getSession((err, result) => {
                if (result) {
                    this.creds.params.Logins = this.creds.params.Logins || {};
                    this.creds.params.Logins[loginProviderName] = result.getIdToken().getJwtToken();
                }
            });
        }
        
        this.creds.refresh((error) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Successfully logged!');
            }
        });
    }
}