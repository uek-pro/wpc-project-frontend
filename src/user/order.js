import { animationApiGatewayUrl } from '../env.js';

const uuidv4 = require('uuid/v4');

export default class Order {

    constructor(s3, user, email, files) {
        this.s3 = s3;
        this.user = user;
        this.email = email;
        this.files = files;
    }

    send() {

        const timestamp = Date.now();
        const path = `uek-krakow/${this.user}/${timestamp}/`;

        const promises = [];
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            
            promises.push(
                new Promise((resolve, reject) => {

                    this.s3.putObject({
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

                    // resolve('ok'); // tmp
                })
            )
        }

        Promise.all(promises).then((values) => {

            console.log(values);
            console.log('Wysłano pomyślnie!');
            
            const order_id = uuidv4();
            const email = this.email;
            const photos = this.files.map(x => `${path}${x.name}`)

            const orderRequest = {
                order_id,
                email,
                photos
            }
            // console.log(orderRequest);
            
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
                console.log('Chyba ok');
                console.log(response);
            })
        })

    }

}