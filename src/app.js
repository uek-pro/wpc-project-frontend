import AWS from 'aws-sdk';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import Vue from 'vue';

import { poolData, identityPoolId, region, bucketRegion, bucketName } from './env.js';
import AuthFacade from './user/auth';
import Order from './user/order.js';


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

        user: {
            isLoggedIn: false,
            isCodeRequired: false,
            flashMessage: '',
            email: '',
            fullname: ''
        },

        form: {
            login: {
                login: '',
                pass: '',
                code: '',
            },
            register: {
                login: '',
                firstname: '',
                lastname: '',
                email: '',
                pass: '',
                pass2: ''
            },
        },

        files: [],

    },

    computed: {

        fullname: function() {
            return `${this.form.register.firstname} ${this.form.register.lastname}`;
        },

        greeting: function() {
            return this.user.fullname == '' ? 'Hello' : `Hello, ${this.user.fullname}.`;
        },

    },

    methods: {

        register: function() {
            if (this.form.register.pass == this.form.register.pass2) {
                auth.register({
                    username: this.form.register.login,
                    password: this.form.register.pass,
                    name: this.fullname,
                    email: this.form.register.email
                }, username => {
                    this.form.login.login = username
                }, err => this.user.flashMessage = err)
            } else {
                this.user.flashMessage = 'Hasła się nie zgadzają.';
            }
        },

        logIn: function() {
            auth.logIn({
                username: this.form.login.login,
                password: this.form.login.pass
            }, (email, fullname) => {
                this.user.isLoggedIn = true,
                this.user.email = email;
                this.user.fullname = fullname;
            }, (err, needConfirm) => {
                this.user.flashMessage = err;
                this.user.isCodeRequired = needConfirm;
            })
        },

        testLogIn: function() {
            auth.logIn(loginRequest, (email, fullname) => {
                this.user.isLoggedIn = true,
                this.user.email = email;
                this.user.fullname = fullname;
            });
        },

        logOut: function() {
            auth.logOut();
            this.user.isLoggedIn = false;
            this.user.email = '';
        },

        confirm: function() {
            auth.confirm({
                username: this.form.login.login,
                code: this.form.login.code
            }, () => {
                this.user.isCodeRequired = false;
            }, err => this.user.flashMessage = err);
        },

        filesChanged(e) {
            this.files = [...e.target.files];
            // this.order.photos = this.files.map(x => x.name);
        },

        sendOrder() {

            const order = new Order(
                s3,
                auth.getIdentityId(),
                this.user.email,
                this.files
            );
            order.send();
        },

        closeFlashMessage() {
            this.user.flashMessage = '';
        },

        // listAll: function() {
        //     s3.listObjects({}, (err, data) => {
        //         if (err) {
        //             alert(err.message);
        //         } else {
        //             console.log(data.Contents.map(item => item.Key));
        //         }
        //     });
        // },

    },

});