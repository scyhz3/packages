import { mockData } from "@etherdata-blockchain/common";
import { createMocks } from "node-mocks-http";
import jwt from "jsonwebtoken";
import { jwtVerificationHandler } from "../handlers/jwt_verification_handler";
import { StatusCodes } from "http-status-codes";
import { okHandler } from "./utils";

describe("Given a jwt verification handler", () => {
  const okToken = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockTestingSecret
  );

  const invalidToken = jwt.sign(
    { user: mockData.MockConstant.mockTestingUser },
    mockData.MockConstant.mockInvalidTestingSecret
  );

  beforeAll(async () => {
    //@ts-ignore
    process.env = {
      ...process.env,
      PUBLIC_SECRET: mockData.MockConstant.mockTestingSecret,
    };
  });

  test("When calling jwt with correct secret", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + okToken,
      },
    });

    await jwtVerificationHandler(okHandler)(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.OK);
  });

  test("When calling jwt with incorrect secret", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + invalidToken,
      },
    });

    await jwtVerificationHandler(okHandler)(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("When calling jwt without token", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await jwtVerificationHandler(okHandler)(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("When calling jwt without system defined secret", async () => {
    process.env = {
      ...process.env,
      PUBLIC_SECRET: undefined,
    };
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        Authorization: "Bearer " + okToken,
      },
    });

    await jwtVerificationHandler(okHandler)(req, res);
    expect(res._getStatusCode()).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
