/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import { UnauthorizedError } from "../expressError.js";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals.user (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}


/** Middleware to use when the logged in user must be an admin.
 *
 * If not, raises Unauthorized.
*/

function ensureAdmin(req, res, next) {
  const user = res.locals.user;
  if (user && user.isAdmin === true) {
    return next();
  }
  throw new UnauthorizedError();
}


/** Middleware to use when the logged in user must either be an admin
 *  or match the user being modified.
 *
 * To match users correctly, the locals.user must match the username URL param:
 * res.locals.user.username === req.params.username
 *
 * Otherwise, the user may be an admin:
 * res.locals.user.isAdmin === true
*/
function ensureCorrectUserOrAdmin(req, res, next) {

  const currentUser = res.locals.user;
  if (currentUser === undefined) throw new UnauthorizedError();

  const isMatchingAuthUser = currentUser.username === req.params.username;
  if (isMatchingAuthUser) { return next(); }

  if (currentUser.isAdmin === true) { return next(); }

  throw new UnauthorizedError();
}

export {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin
};
