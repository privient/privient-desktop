import * as crypto from 'crypto';
import * as sjcl from 'sjcl';
import { MainProcess } from '../app';
import { DataService } from './DataService';

export class CryptoService {
    public Status: boolean;
    private static Instance: CryptoService;
    private Session: string;
    private SessionPassword: any;

    private constructor() { }

    KillInstance() {
        this.Status = undefined;
        this.Session = undefined;
        this.SessionPassword = undefined;
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
        let password = data.password;
        // Create random bytes hash for session.
        let randomBytes = JSON.stringify(crypto.randomBytes(Math.floor(Math.random() * 10000) + 1));
        let hashedBytes = sjcl.hash.sha256.hash(randomBytes);
        let hashPassword = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password));

        DataService.FirstTimeSetupCheck(hashPassword).then(
            (res) => {
                // Encrypted or New Encryption Successful
                this.Status = true;
                this.Session = sjcl.codec.hex.fromBits(hashedBytes);
                this.SessionPassword = sjcl.encrypt(this.Session, hashPassword, {mode: 'gcm'});
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
            var pass = sjcl.decrypt(this.Session, this.SessionPassword);
            return sjcl.decrypt(pass, data);
        } catch(err) {
            return undefined;
        }
    }

    // Encrypts data by session key
    EncryptBySession(data: string) {
        try {
            var pass = sjcl.decrypt(this.Session, this.SessionPassword);
            var encryption = sjcl.encrypt(pass, data);
            console.log(encryption);
            return encryption;
        } catch(err) {
            console.log(err);
            return undefined;
        }
    }
}