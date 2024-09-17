import {useContext} from "react";
import {ClientContext} from "../components/WithClient.js";


export const useClient = () => {
    return  useContext(ClientContext);
}




