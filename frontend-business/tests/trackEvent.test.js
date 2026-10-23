import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackContactEvent } from "../src/lib/trackEvent";

describe("trackContactEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends contact event using navigator.sendBeacon when available", () => {
    const sendBeaconMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { sendBeacon: sendBeaconMock });

    trackContactEvent("angkor-heritage-boutique", "phone", "profile");

    expect(sendBeaconMock).toHaveBeenCalledTimes(1);
    expect(sendBeaconMock.mock.calls[0][0]).toBe(
      "/api/v1/business/public/businesses/angkor-heritage-boutique/events"
    );
  });

  it("falls back to fetch without throwing if sendBeacon returns false", async () => {
    const sendBeaconMock = vi.fn().mockReturnValue(false);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });

    vi.stubGlobal("navigator", { sendBeacon: sendBeaconMock });
    vi.stubGlobal("fetch", fetchMock);

    expect(() => {
      trackContactEvent("angkor-cafe", "telegram", "list");
    }).not.toThrow();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/v1/business/public/businesses/angkor-cafe/events"
    );
  });

  it("never throws or blocks contact link even when fetch fails completely", () => {
    const sendBeaconMock = vi.fn().mockImplementation(() => {
      throw new Error("Network error");
    });
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network fatal"));

    vi.stubGlobal("navigator", { sendBeacon: sendBeaconMock });
    vi.stubGlobal("fetch", fetchMock);

    expect(() => {
      trackContactEvent("angkor-guide", "whatsapp", "nearby");
    }).not.toThrow();
  });
});
