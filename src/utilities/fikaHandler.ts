class FikaHandler {
  public hostID: string = "";
  public clients: string[] = [];

  public addClient(UID: string): void {
    if (!this.clients.includes(UID)) {
      this.clients.push(UID);
    }
  }

  public setHost(UID: string): void {
    this.hostID = UID;
  }

  public isHost(UID: string): boolean {
    return UID == this.hostID;
  }
}

export default FikaHandler;
