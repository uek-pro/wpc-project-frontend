import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { loginProviderName } from '../env.js';


export default class AuthFacade {

    constructor(userPool, creds) {
        this.userPool = userPool;
        this.creds = creds;
    }

    logIn(request, successCallback, errorCallback) {

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
                this.refreshCredentials(successCallback);
            },
            onFailure: (err) => {
                console.log(err);
                errorCallback(err.message, err.code == 'UserNotConfirmedException' ? true : false);
                // alert(err);
            }
        });
    }

    logOut() {
        const cognitoUser = this.userPool.getCurrentUser();
        if (cognitoUser != null) {
            cognitoUser.signOut();
        }
    }

    register(request, successCallback, errorCallback) {

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
                    console.log(err);
                    errorCallback(err.message);
                    return;
                }
                console.log(`Udało się. Username: ${result.user.getUsername()}`);
                successCallback(result.user.getUsername());
            }
        );
    }

    confirm(request, successCallback, errorCallback) {

        const cognitoUser = new CognitoUser({
            Username: request.username,
            Pool: this.userPool
        })
        
        cognitoUser.confirmRegistration(
            request.code,
            true, 
            (err, result) => {
                if (err) {
                    console.log(err);
                    errorCallback(err.message);
                    return;
                }
                successCallback();
        });
    }

    getIdentityId() {
        return this.creds.identityId;
    }

    refreshCredentials(successCallback)  {
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

                cognitoUser.getUserAttributes((err, res) => {

                    if (err) {
                        alert(err);
                        return;
                    }

                    const email = res.find(x => x.Name === 'email').Value;
                    const fullname = res.find(x => x.Name === 'name').Value;
                    successCallback(email, fullname);
                })
            }
        });
    }
}