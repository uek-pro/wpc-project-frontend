

export default class StorageFacade {

    constructor(s3) {
        this.s3 = s3;
    }

    listAll() {
        this.s3.listObjects({}, (err, data) => {
            if (err) {
                alert(err.message);
            } else {
                console.log(data.Contents.map(item => item.Key));
            }
        });
    }

    sendFiles(files) {
        // this.s3.upload();
    }

}