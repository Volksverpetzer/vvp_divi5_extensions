import { formatHeadline, splitHeadline } from "./headline";

describe("formatHeadline", () => {
  const summary = { goal: 20000, totalRaised: 12345.6 };

  it("fills raised and goal in German whole-euro format", () => {
    expect(
      formatHeadline("Schon {gesammelt} von {ziel} gesammelt!", summary),
    ).toBe("Schon 12.346 € von 20.000 € gesammelt!");
  });

  it("fills what is left and the percentage", () => {
    expect(formatHeadline("Noch {fehlt} ({prozent})", summary)).toBe(
      "Noch 7.654 € (61 %)",
    );
  });

  it("caps what is left at 0 and the percentage at 100", () => {
    const over = { goal: 100, totalRaised: 150 };
    expect(formatHeadline("{fehlt} / {prozent}", over)).toBe("0 € / 100 %");
  });

  it("matches placeholders case-insensitively and leaves others alone", () => {
    expect(formatHeadline("{Ziel} {unbekannt}", summary)).toBe(
      "20.000 € {unbekannt}",
    );
  });

  it("shows 0 % for a campaign without a goal", () => {
    expect(formatHeadline("{prozent}", { goal: 0, totalRaised: 5 })).toBe(
      "0 %",
    );
  });
});

describe("splitHeadline", () => {
  it("splits out <small> parts", () => {
    expect(
      splitHeadline("Monatlich: 7.340 € <small>von 20.000 €</small>"),
    ).toEqual([
      { text: "Monatlich: 7.340 € ", small: false },
      { text: "von 20.000 €", small: true },
    ]);
  });

  it("handles several parts, any case, and text after the last one", () => {
    expect(splitHeadline("<SMALL>a</SMALL> b <small>c</small> d")).toEqual([
      { text: "a", small: true },
      { text: " b ", small: false },
      { text: "c", small: true },
      { text: " d", small: false },
    ]);
  });

  it("keeps an unclosed tag, other HTML and empty tags as plain text", () => {
    expect(splitHeadline("a <small>b")).toEqual([
      { text: "a <small>b", small: false },
    ]);
    expect(splitHeadline("<b>a</b>")).toEqual([
      { text: "<b>a</b>", small: false },
    ]);
    expect(splitHeadline("a<small></small>b")).toEqual([
      { text: "a", small: false },
      { text: "b", small: false },
    ]);
  });
});
