import * as crypto from 'crypto';
import * as sjcl from 'sjcl';
import { MainProcess } from '../app';
import { DataService } from './DataService';
import { machineId, machineIdSync } from 'node-machine-id';

export class CryptoService {
    public Status: boolean;
    static Instance: CryptoService;
    private _Session: string;
    private _SessionPassword: any;

    private constructor() { }

    /**
     * Kills the entire instance and locks the wallet.
     */
    KillInstance() {
        this.Status = undefined;
        this._Session = undefined;
        this._SessionPassword = undefined;
        this.Status = false;
        MainProcess.GetInstance().WindowSend('lock-wallet', true);
    }

    static GetInstance(): CryptoService {
        if (this.Instance === undefined) {
            this.Instance = new CryptoService();
        }
        return this.Instance;
    }

    SetupInstance(data) {
        // Create random bytes hash for session.
        this._Session = crypto.randomBytes(512).toString('hex');
        let hashPassword = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(data.password));

        DataService.FirstTimeSetupCheck(hashPassword).then(
            (res) => {
                // Encrypted or New Encryption Successful
                this.Status = true;
                this._SessionPassword = sjcl.encrypt(this._Session, hashPassword, {mode: 'gcm'});
                MainProcess.GetInstance().WindowSend('lock-wallet', false);
            },
            (err) => {
                // Failed to Decrypt
                this.Status = false;
                MainProcess.GetInstance().WindowSend('lock-wallet', true);
            }
        );
    }

    // Decrypts and returns the data as a JSON string.
    Decrypt(key: string, data: string) {
        try {
            return sjcl.decrypt(key, data);
        } catch(err) {
            return undefined;
        }
    }

    // Encrypts and returns a JSON string.
    Encrypt(key: string, data: string) {
        return sjcl.encrypt(key, data);
    }

    // Decrypts by session key
    DecryptBySession(data: string) {
        try {
            let pass = sjcl.decrypt(JSON.stringify(this._Session), this._SessionPassword);
            return sjcl.decrypt(pass, data);
        } catch(err) {
            return undefined;
        }
    }

    // Encrypts data by session key
    EncryptBySession(data: string) {
        try {
            let pass = sjcl.decrypt(JSON.stringify(this._Session), this._SessionPassword);
            let encryption = sjcl.encrypt(pass, data);
            return encryption;
        } catch(err) {
            return undefined;
        }
    }
}