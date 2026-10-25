import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// In-memory localStorage mock
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("ownerApi HTTP client", () => {
  let mockStorage;

  beforeEach(async () => {
    vi.restoreAllMocks();
    mockStorage = createLocalStorageMock();
    vi.stubGlobal("localStorage", mockStorage);
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("injects Bearer token into request headers when token exists in localStorage", async () => {
    mockStorage.setItem("km_biz_token", "sample_test_token_xyz");
    const { default: api } = await import("../src/lib/ownerApi");

    const interceptor = api.interceptors.request.handlers[0];
    const config = await interceptor.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer sample_test_token_xyz");
  });

  it("omits Authorization header when no token is present in localStorage", async () => {
    const { default: api } = await import("../src/lib/ownerApi");

    const interceptor = api.interceptors.request.handlers[0];
    const config = await interceptor.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it("unboxes ApiController payload containing items and pagination meta", async () => {
    const { default: api } = await import("../src/lib/ownerApi");

    const responseInterceptor = api.interceptors.response.handlers[0];
    const rawResponse = {
      data: {
        success: true,
        data: {
          items: [{ id: 1, name: "Test Business" }],
          meta: { total: 1, current_page: 1 },
        },
      },
    };

    const transformed = responseInterceptor.fulfilled(rawResponse);

    expect(transformed.data.items).toHaveLength(1);
    expect(transformed.data.total).toBe(1);
    expect(transformed.data.items[0].name).toBe("Test Business");
  });

  it("clears stored tokens on 401 unauthorized response", async () => {
    mockStorage.setItem("km_travel_token", "expired_token_1");
    mockStorage.setItem("km_biz_token", "expired_token_2");

    const mockLocation = { pathname: "/owner/dashboard", href: "" };
    vi.stubGlobal("window", { location: mockLocation });

    const { default: api } = await import("../src/lib/ownerApi");
    const responseInterceptor = api.interceptors.response.handlers[0];
    const error401 = {
      response: { status: 401, data: { message: "Unauthenticated" } },
    };

    await expect(responseInterceptor.rejected(error401)).rejects.toEqual(error401);

    expect(mockStorage.getItem("km_travel_token")).toBeNull();
    expect(mockStorage.getItem("km_biz_token")).toBeNull();
    expect(mockLocation.href).toBe("/login");
  });
});
