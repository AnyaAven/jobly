import jwt from "jsonwebtoken";
import  { SECRET_KEY} from "../config.js";

/** return signed JWT {username, isAdmin} from user data. */

function createToken(user) {
  let payload = {
    username: user.username,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY);
}

export { createToken};
