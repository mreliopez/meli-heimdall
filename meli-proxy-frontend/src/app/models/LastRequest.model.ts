class LastRequest{
    remoteAdress: String;
    lastConnection: Date;

    constructor(){
        this.remoteAdress = "";
        this.lastConnection = new Date();
    }
}

export default LastRequest;