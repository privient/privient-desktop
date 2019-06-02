import { MainProcess } from '../app';



export class RequestService {
    static Instance: RequestService;
    Requests: Array<any> = [];

    private constructor() { }

    static GetInstance(): RequestService {
        if (this.Instance == undefined)
            this.Instance = new RequestService();

        return this.Instance;
    }

    /**
     * Sends new data requests up to the view.
     * @param data 
     */
    PushRequest(data) {
        this.Requests.push(data);
        var transactions = RequestService.GetInstance().Requests;
        MainProcess.GetInstance().WindowSend('request-data', transactions);
    }

    /**
     * Removes data from the requests.
     * @param id 
     */
    RemoveRequest(id): boolean {
        var index = this.Requests.findIndex(x => x.id == id);
        if(index <= -1)
            return false;

        this.Requests.splice(index, 1);
        MainProcess.GetInstance().WindowSend('request-data', this.Requests);
        return true;
    }

    /**
     * Updates the view regardless of the state.
     */
    UpdateRequests() {
        MainProcess.GetInstance().WindowSend('request-data', this.Requests);
    }
}