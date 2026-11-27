
import { csvToJson } from "../src/csv";

describe("csvToJson", () => {
  const validCsv =
    "id,title,status,priority\n1,Login issue,Open,High";

  test("converts valid CSV rows into JSON objects", () => {
    expect(csvToJson(validCsv)).toEqual([
      {
        id: "1",
        title: "Login issue",
        status: "Open",
        priority: "High",
      },
    ]);
  });

  test("maps headers to the correct values", () => {
    expect(csvToJson(validCsv)[0].title).toBe("Login issue");
  });

  test("preserves commas inside quoted fields", () => {
    expect(
      csvToJson('id,title,status,priority\n1,"Login, issue",Open,High')
    ).toEqual([
      {
        id: "1",
        title: "Login, issue",
        status: "Open",
        priority: "High",
      },
    ]);
  });

  test("decodes escaped double quotes inside quoted fields", () => {
    expect(
      csvToJson('id,title,status,priority\n1,"Login ""timeout"" issue",Open,High')
    ).toEqual([
      {
        id: "1",
        title: 'Login "timeout" issue',
        status: "Open",
        priority: "High",
      },
    ]);
  });

  test("parses multiple rows with CRLF line endings", () => {
    expect(
      csvToJson(
        "id,title,status,priority\r\n1,First,Open,High\r\n2,Second,Resolved,Low\r\n"
      )
    ).toEqual([
      { id: "1", title: "First", status: "Open", priority: "High" },
      { id: "2", title: "Second", status: "Resolved", priority: "Low" },
    ]);
  });

  test("rejects empty input", () => {
    expect(() => csvToJson("")).toThrow("CSV input cannot be empty");
  });

  test("rejects missing required columns", () => {
    expect(() => csvToJson("id,title\n1,Login")).toThrow(
      "Missing required columns"
    );
  });

  test("rejects rows with missing values", () => {
    expect(() =>
      csvToJson("id,title,status,priority\n1,Login issue,Open")
    ).toThrow("Malformed CSV row");
  });

  test("rejects rows with extra values", () => {
    expect(() =>
      csvToJson("id,title,status,priority\n1,Login issue,Open,High,Extra")
    ).toThrow("Malformed CSV row");
  });

  test("rejects empty required values", () => {
    expect(() =>
      csvToJson("id,title,status,priority\n1,,Open,High")
    ).toThrow("Missing required value");
  });

  test("rejects duplicate column names", () => {
    expect(() =>
      csvToJson("id,title,status,priority,id\n1,Login,Open,High,2")
    ).toThrow("duplicate or empty column names");
  });
});
