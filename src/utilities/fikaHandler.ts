export default class FikaHandler {
    private _hostID: string = "";

    public setHost(UID: string): void {
        this._hostID = UID;
    }

    public isHost(UID: string): boolean {
        return UID == this._hostID;
    }
}
