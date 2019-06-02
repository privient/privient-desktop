import * as Store from 'data-store';
import { CryptoService } from './CryptoService';

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

                CryptoService.GetInstance().Decrypt(store.get(appName)).then(
                    (res) => {
                        return resolve(res);
                    },
                    (err) => {
                        return reject(err);
                });
            } catch(err) {
                return reject(err);
            }
        });
    }

    static SetDataByAppName(appName: string, data: any) {
        CryptoService.GetInstance().Encrypt(data).then((res) => {
            store.set(appName, res);
        });
    }
} 