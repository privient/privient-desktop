import * as crypto from 'crypto';
import * as sjcl from 'sjcl';
import { MainProcess } from '../app';
import { DataService } from './DataService';
import { encrypt, decrypt } from 'eos-encrypt';

export class CryptoService {
    public Status: boolean;
    static Instance: CryptoService;
    public PublicKey: string;
    private _Session: string;
    private _SessionPassword: any;
    private _SessionKeys: any;

    private constructor() { }

    /**
     * Kills the entire instance and locks the wallet.
     */
    KillInstance() {
        this.Status = undefined;
        this._Session = undefined;
        this._SessionPassword = undefined;
        this._SessionKeys = undefined;
        this.Status = false;
        this.PublicKey = undefined;
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
                let keys = res as any;
                this.PublicKey = keys.public as string;
                this.Status = true;
                this._SessionPassword = sjcl.encrypt(this._Session, hashPassword, {mode: 'gcm'});
                this._SessionKeys = sjcl.encrypt(this._Session, keys, {mode: 'gcm'});
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
    Decrypt(key: string, data: string): any | undefined {
        try {
            return sjcl.decrypt(key, data);
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }

    // Encrypts and returns a JSON string.
    Encrypt(key: string, data: string) {
        return sjcl.encrypt(key, data);
    }

    // Decrypts by session key
    DecryptBySession(data: string): any | undefined {
        try {
            let pass = sjcl.decrypt(this._Session, this._SessionPassword);
            return sjcl.decrypt(pass, data);
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }

    // Encrypts data by session key
    EncryptBySession(data: string): any | undefined {
        try {
            let pass = sjcl.decrypt(this._Session, this._SessionPassword);
            let encryption = sjcl.encrypt(pass, data);
            return encryption;
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }

    // Asymetric Encryption
    AsymEncryptBySession(data: string, recieverPublicKey: string): any | undefined {
        try {
            let keys = JSON.parse(sjcl.decrypt(this._Session, this._SessionKeys));
            let encryptMessage = encrypt(keys.private, recieverPublicKey, data);
            return encryptMessage;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

    AsymDecryptBySession(data: string, senderPublicKey: string): any | undefined {
        try {
            let keys = JSON.parse(sjcl.decrypt(this._Session, this._SessionKeys));
            let decryptedMessage = decrypt(keys.private, senderPublicKey, data);
            return decryptedMessage;
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }
}