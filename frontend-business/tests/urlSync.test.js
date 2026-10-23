import { describe, it, expect } from "vitest";

describe("URL Filter Sync", () => {
  it("serializes search filters into query string correctly", () => {
    const params = new URLSearchParams();
    const filters = {
      q: "Angkor Boutique",
      category: "1",
      province: "17",
      verified: true,
      open_now: true,
      price_level: "2",
      sort: "rating",
    };

    Object.entries(filters).forEach(([key, val]) => {
      if (val === true) {
        params.set(key, "1");
      } else if (val !== false && val !== "") {
        params.set(key, String(val));
      }
    });

    const queryString = params.toString();
    expect(queryString).toContain("q=Angkor+Boutique");
    expect(queryString).toContain("category=1");
    expect(queryString).toContain("province=17");
    expect(queryString).toContain("verified=1");
    expect(queryString).toContain("open_now=1");
    expect(queryString).toContain("price_level=2");
    expect(queryString).toContain("sort=rating");
  });

  it("deserializes URL query string back into filter state accurately", () => {
    const query = "?q=Siem+Reap&category=2&province=17&verified=1&open_now=1&sort=newest&page=2";
    const params = new URLSearchParams(query);

    const q = params.get("q") || "";
    const category = params.get("category") || "";
    const province = params.get("province") || "";
    const verified = params.get("verified") === "1";
    const openNow = params.get("open_now") === "1";
    const sort = params.get("sort") || "relevance";
    const page = parseInt(params.get("page") || "1", 10);

    expect(q).toBe("Siem Reap");
    expect(category).toBe("2");
    expect(province).toBe("17");
    expect(verified).toBe(true);
    expect(openNow).toBe(true);
    expect(sort).toBe("newest");
    expect(page).toBe(2);
  });
});
