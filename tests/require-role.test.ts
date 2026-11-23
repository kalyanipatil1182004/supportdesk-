
import type { Request, Response, NextFunction } from "express";
import { requireRole } from "../apps/api/src/middlewares/require-role";

describe("requireRole middleware", () => {
  const mockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    return res;
  };

  test("returns 401 when user is not authenticated", () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    requireRole("admin")(
      req,
      res as unknown as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { message: "Authentication required" },
      meta: {},
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when user role is not allowed", () => {
    const req = {
      user: { id: 1, role: "customer" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    requireRole("admin")(
      req,
      res as unknown as Response,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { message: "Access forbidden" },
      meta: {},
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next when user role is allowed", () => {
    const req = {
      user: { id: 1, role: "customer" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    requireRole("customer")(
      req,
      res as unknown as Response,
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
