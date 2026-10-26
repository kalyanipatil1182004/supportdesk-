import { csvToJson } from "../src/csv";

describe("csvToJson", () => {
  test("converts CSV rows into JSON objects", () => {
    const csv = "id,title\n1,Login issue\n2,Network issue";

    expect(csvToJson(csv)).toEqual([
      { id: "1", title: "Login issue" },
      { id: "2", title: "Network issue" },
    ]);
  });

  test("returns an empty array when there is only a header", () => {
    expect(csvToJson("id,title")).toEqual([]);
  });

  test("returns an empty array for empty input", () => {
    expect(csvToJson("")).toEqual([]);
  });
});