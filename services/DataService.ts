import * as Store from 'data-store';
import { CryptoService } from './CryptoService';
import { reject } from 'q';

const store = new Store({ path: 'userdata.db '});

// Singleton
export class DataService {
    static Instance: DataService;

    private constructor() { }

    static GetInstance(): DataService {
        if (this.Instance === undefined) {
            this.Instance = new DataService();
        }
        return this.Instance;
    }

    static async GetDataByAppName(appName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (!store.has(appName)) {
                    return reject('Not found.');
                }
                return resolve(store.get(appName));
            } catch(err) {
                return reject(err);
            }
        });
    }

    static async GetDecryptedDataByAppName(appName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (!store.has(appName)) {
                    return reject('Not found.');
                }

                let cryptoService = CryptoService.GetInstance();
                let result = cryptoService.DecryptBySession(store.get(appName));

                if (result == undefined)
                    return reject('Failed to decrypt');

                return resolve(result);
            } catch(err) {
                return reject(err);
            }
        });
    }

    static SetDataByAppName(appName: string, data: any) {
        var encrypted = CryptoService.GetInstance().EncryptBySession(data);
        store.set(appName, encrypted);
    }

    static async FirstTimeSetupCheck(password) {
        return new Promise((resolve, reject) => {
            if(store.has('startup')) {
                var dataToDecrypt = store.get('startup')
                var res = CryptoService.GetInstance().Decrypt(password, dataToDecrypt);
                console.log('Decrypted: ' + res);
                if (res == undefined)
                    return reject('Failed to decrypt');
                return resolve(res);
            }

            var encRes = CryptoService.GetInstance().Encrypt(password, JSON.stringify({ data: 'startup'}));
            store.set('startup', encRes);
            return resolve(encRes);
        })
    }
} 