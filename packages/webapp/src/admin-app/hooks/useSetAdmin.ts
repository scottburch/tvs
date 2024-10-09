import {addAdmin} from "@tvs/vote";
import {ApiClient} from "@my-blockchain/blockchain";

export const useSetAdmin = () => {

    return (client: ApiClient) => addAdmin(client).subscribe();
}