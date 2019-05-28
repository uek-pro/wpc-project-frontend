import AWS from 'aws-sdk';
import { CognitoUser, CognitoUserPool, CognitoUserAttribute, AuthenticationDetails } from 'amazon-cognito-identity-js';
import Vue from 'vue';

import { poolData, identityPoolId, region, bucketRegion, bucketName, loginProviderName } from './env.js';
import AuthFacade from './user/auth';



const userPool = new CognitoUserPool(poolData);
const creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
});

const auth = new AuthFacade(userPool, creds);

AWS.config.update({
    region: region,
    credentials: creds
})

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: bucketRegion,
    params: {
        Bucket: bucketName
    }
});



const registerRequest = {
    username: '',
    password: '',
    email: '',
    name: ''
}

const loginRequest = {
    username: registerRequest.username,
    password: registerRequest.password
}

const confirmRequest = {
    username: registerRequest.username,
    code: '1234567'
}



document.querySelector('#testRegister').addEventListener('click', () => {
    auth.register(registerRequest)
});

document.querySelector('#testLogin').addEventListener('click', () => {
    auth.logIn(loginRequest) ;
});

document.querySelector('#testConfirm').addEventListener('click', () => {
    auth.confirm(confirmRequest);
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



new Vue({

    el: '#app',

    data: {
        message: 'Hellow World!'
    }

});