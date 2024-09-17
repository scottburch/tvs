import {addAdmin} from "@tvs/vote";
import {ApiClient} from "@tvs/blockchain";

export const useSetAdmin = () => {

    return (client: ApiClient) => addAdmin(client).subscribe();
}