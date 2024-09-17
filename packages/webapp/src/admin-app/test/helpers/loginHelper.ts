import {Page} from 'playwright'
import {EncryptedPrivKey} from "@tvs/crypto";
import {from, switchMap} from "rxjs";

export const doAdminLogin = (page: Page, privKey: EncryptedPrivKey) =>
    from(page.fill('#loginId', privKey)).pipe(
        switchMap(() => page.fill('#password', '12345')),
        switchMap(() => page.click('button:text("login")')),
    )
