import * as crypto from 'crypto';
import * as sjcl from 'sjcl';
import { MainProcess } from '../app';

export class CryptoService {
    public Status: boolean;
    private static Instance: CryptoService;
    private Session: string;
    private Hash: string;

    private constructor() { }

    static KillInstance() {
        this.Instance.Status = undefined;
        this.Instance.Session = undefined;
        this.Instance.Hash = undefined;
        this.Instance.Status = false;
        MainProcess.GetInstance().WindowSend('lock-wallet', true);
    }

    static GetInstance(): CryptoService {
        if (this.Instance === undefined) {
            this.Instance = new CryptoService();
        }
        return this.Instance;
    }

    public SetupInstance(password) {
        this.Session = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(JSON.stringify(crypto.randomBytes(Math.floor(Math.random() * 10000) + 1))));
        this.OnceEncrypt(this.Session, sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password))).then(
            (res) => {
                this.Hash = res;
                this.Status = true;
                MainProcess.GetInstance().WindowSend('lock-wallet', false);
            },
            (err) => {
                this.Status = false;
                return;
            }
        )
    }

    public async OnceEncrypt(key: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof data === 'object') data = JSON.stringify(data);
            const {iv, salt, ct} = JSON.parse(sjcl.encrypt(key, data, {mode: 'gcm'}))
            return resolve(JSON.stringify({ iv, salt, ct }));
        });
    }

    public async Encrypt(data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            if (typeof data === 'object') data = JSON.stringify(data);
            this.OnceDecrypt(this.Session, this.Hash).then(
                (res) => {
                    const {iv, salt, ct} = JSON.parse(sjcl.encrypt(res, data, {mode: 'gcm'}))
                    return resolve(JSON.stringify({ iv, salt, ct }));
                },
                (err) => {
                    return reject(err);
                }
            )
        });
    }

    public async OnceDecrypt(key: string, encryptedData: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let vein = JSON.parse(encryptedData);
            let newDat = Object.assign(vein, {mode: 'gcm'});
            let result = sjcl.decrypt(key, JSON.stringify(newDat));
            try {
                return resolve(JSON.parse(result));
            } catch(err) {
                return resolve(result);
            }
        });
    }

    public async Decrypt(encryptedData: string): Promise<any> {
        return new Promise((resolve, reject) => {
            encryptedData = JSON.stringify(Object.assign(JSON.parse(encryptedData), {mode: 'gcm'}));
            this.OnceDecrypt(this.Session, this.Hash).then(
                (res) => {
                    let result = sjcl.decrypt(res, encryptedData);
                    try {
                        return resolve(JSON.parse(result));
                    } catch(err) {
                        return reject(err);
                    }
                },
                (err) => {
                    return reject(err);
                }
            )
        });
    }
}