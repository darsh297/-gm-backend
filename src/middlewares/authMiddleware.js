import { parseJwt, verifyToken } from "../services/authService.js";

function checkToken(token, res) {
  // Check if token is provided
  if (!token) {
    return res.json({
      status: 401,
      message: "Unauthorized: No token provided",
      data: {
        msg: "AuthMiddleWare Error",
      },
    });
  }

  // Verify the token
  if (!verifyToken(token)) {
    return res.json({
      status: 401,
      message: "Unauthorized: Invalid token",
      data: {
        msg: "AuthMiddleWare Error",
      },
    });
  }
}

export function isAuthorized(req, res, next) {
  // Get the JWT token from the request headers
  const token = req.headers["authorization"];

  checkToken(token, res);

  next();
}

export function isAdmin(req, res, next) {
  // Get the JWT token from the request headers
  const token = req.headers["authorization"];

  checkToken(token, res);

  // Check if the user is an admin
  if (!parseJwt(token).isAdmin) {
    return res.json({
      status: 403,
      message: "Forbidden: User is not an admin",
      data: {
        msg: "AuthMiddleWare Error",
      },
    });
  }

  next();
}
