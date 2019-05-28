import { poolData, IdentityPoolId, bucketRegion, bucketName, loginProviderName } from './env.js'
import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js'
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import AWS from 'aws-sdk'

const creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
})

AWS.config.update({
    region: bucketRegion,
    credentials: creds
})

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: bucketRegion,
    params: {
        Bucket: bucketName
    }
});

document.querySelector('#listContents').addEventListener('click', () => {
   s3.listObjects({}, (err, data) => {
       if (err) {
           alert(err.message);
       } else {
           console.log(data.Contents.map(item => item.Key));
       }
   });
});


console.log('hello world');

const userPool = new CognitoUserPool(poolData);

const testRegisterButton = document.querySelector('#testRegister');

const register = (registerRequest) => {
    //console.log('register');
    
    
    userPool.signUp(
        registerRequest.username,
        registerRequest.password,
        [
            new CognitoUserAttribute({
                Name: 'email',
                Value: registerRequest.email
            }),
            new CognitoUserAttribute({
                Name: 'name',
                Value: registerRequest.name
            })
        ],
        null,
        (err, result) => {
            if (err) {
                alert('bląd:' + err.message);
                return;
            }
            console.log(`Udało się. Username: ${result.user.getUsername()}`);
        }
    );
};

testRegisterButton.addEventListener('click', () => {
    register({
        username: 'username',
        password: '123456q$^ejh4235erwe',
        name: 'danbraj',
        email: 'xxx@xxx.xx'
    });
    //alert('it works');
});

const loginRequest = {
    username: 'username',
    password: '123456q$^ejh4235erwe'
};

const handleLogin = (loginRequest) => {
    
    const authDetails = new AuthenticationDetails({
        Username: loginRequest.username,
        Password: loginRequest.password
    });
    
    const cognitoUser = new CognitoUser({
        Username: loginRequest.username,
        Pool: userPool
    })
    
    cognitoUser.authenticateUser(
        authDetails,
        {
            onSuccess: (result) => {
                console.log(result);
                creds.params.Logins = creds.params.Logins || {}
                creds.params.Logins[loginProviderName] = result.getIdToken().getJwtToken();
                
                alert('hura');
            },
            onFailure: (err) => {
                console.log(err);
                alert('nie działa');
            }
        }
    )
    
    console.log(`i am going to login ${loginRequest.username}`);
};

const testLoginButton = document.querySelector('#testLogin');
testLoginButton.addEventListener('click', () => {
    handleLogin(loginRequest); 
});

const confirmRegistration = (confirmRequest) => {
    
    const cognitoUser = new CognitoUser({
        Username: loginRequest.username,
        Pool: userPool
    })
    
    cognitoUser.confirmRegistration(
        confirmRequest.code,
        true,
        (err, result) => {
        if (err) {
            alert(err);
            return;
        }
        alert(result);
    });
};

const testConfirmButton = document.querySelector('#testConfirm');
testConfirmButton.addEventListener('click', () => {
   confirmRegistration({
       username: loginRequest.username,
       code: '450849'
   })
});


// npm run build
// aws s3 cp ./dist/index.html s3://185777/index.html --acl=public-read
// aws s3 cp ./dist/main.bundle.js s3://185777/main.bundle.js --acl=public-read