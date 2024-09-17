import {Page} from 'playwright'
import {EncryptedPrivKey} from "@tvs/crypto";
import {from, switchMap} from "rxjs";

export const doLogin = (page: Page, privKey: EncryptedPrivKey) =>
    from(page.fill('#voterId', privKey)).pipe(
        switchMap(() => page.fill('#password', '12345')),
        switchMap(() => page.click('button:text("Authenticate")')),
        switchMap(() => page.waitForURL('**/vote/menu'))
    )
