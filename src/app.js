import AWS from 'aws-sdk';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import Vue from 'vue';

import { poolData, identityPoolId, region, bucketRegion, bucketName, animationApiGatewayUrl } from './env.js';
import AuthFacade from './user/auth';
import Order from './user/order.js';

const uuidv4 = require('uuid/v4');


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
            isFlashMessage: true,
            email: '',
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
        }

    },

    methods: {

        register: function() {
            auth.register(registerRequest)
        },

        logIn: function() {
            auth.logIn(loginRequest, email => {
                this.user.isLoggedIn = true,
                this.user.email = email;
            });
        },

        logOut: function() {
            auth.logOut();
            this.user.isLoggedIn = false;
            this.user.email = '';
        },

        confirm: function() {
            auth.confirm(confirmRequest);
        },

        listAll: function() {
            s3.listObjects({}, (err, data) => {
                if (err) {
                    alert(err.message);
                } else {
                    console.log(data.Contents.map(item => item.Key));
                }
            });
        },

        filesChanged(e) {
            this.files = [...e.target.files];
            // this.order.photos = this.files.map(x => x.name);
        },

        sendOrder() {

            // const order = new Order(
            //     s3,
            //     auth.getIdentityId(),
            //     this.user.email,
            //     this.files
            // );
            // order.send();

            const timestamp = Date.now();
            const email = this.user.email;

            const user = auth.getIdentityId();
            const path = `uek-krakow/${user}/${timestamp}/`;

            const promises = [];
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                
                promises.push(
                    new Promise((resolve, reject) => {

                        s3.putObject({
                            Key: `${path}${file.name}`,
                            ContentType: file.type,
                            Body: file
                        }, (err, data) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(data);
                            }
                        })

                        // resolve('ok');
                    })
                )
            }

            Promise.all(promises).then((values) => {

                console.log('Wysłano pomyślnie!');
                
                const order_id = uuidv4();
                const photos = this.files.map(x => `${path}${x.name}`)

                const orderRequest = {
                    order_id,
                    email,
                    photos
                }
                console.log(orderRequest);
                
                fetch(animationApiGatewayUrl, {
                    method: 'post',
                    body: JSON.stringify(orderRequest),
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.text()) // response pusty
                .then(response => {

                    console.log(response);
                })
            })
        },

        closeFlashMessage() {
            this.user.isFlashMessage = false;
        }

    },

});