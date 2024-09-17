import {startCleanValidator} from "@tvs/blockchain";
import {startVoteApp} from "./voteApp.js";

startCleanValidator({}, startVoteApp).subscribe();