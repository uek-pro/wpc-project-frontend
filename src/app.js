import AWS from 'aws-sdk';
import { CognitoUser, CognitoUserPool, CognitoUserAttribute, AuthenticationDetails } from 'amazon-cognito-identity-js';
import Vue from 'vue';

import { poolData, identityPoolId, region, bucketRegion, bucketName, loginProviderName } from './env.js';
import AuthFacade from './user/auth';
import StorageFacade from './user/storage.js';



const userPool = new CognitoUserPool(poolData);
const creds = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
});

AWS.config.update({
    region: region,
    credentials: creds
});

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: bucketRegion,
    params: {
        Bucket: bucketName
    }
});

const auth = new AuthFacade(userPool, creds);
const storage = new StorageFacade(s3);



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



new Vue({

    el: '#app',

    data: {

        message: 'Hellow World!',
        isLoggedIn: false,

        order: {
            order_id: '',
            email: '',
            photos: []
        },

        files: [],

    },

    methods: {

        register: function() {
            auth.register(registerRequest)
        },

        logIn: function() {
            auth.logIn(loginRequest, (creds) => {
                this.isLoggedIn = true,
                this.email = creds //tmp
            });
        },

        confirm: function() {
            auth.confirm(confirmRequest);
        },

        listAll: function() {
            storage.listAll();
        },

        filesChanged(e) {
            this.files = [...e.target.files];
            this.order.photos = this.files.map(x => x.name);
        },

        sendOrder() {
            console.log(this.order);
            // fetch('...').then(res => {
            //     console.log(res);
            // })
        },

    },

});