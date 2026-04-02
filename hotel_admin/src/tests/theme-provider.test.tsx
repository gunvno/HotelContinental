import { act, render, screen } from "@testing-library/react";

import { ThemeProvider, useTheme } from "@/providers/theme-provider";

function ThemeConsumer() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {resolvedTheme}
    </button>
  );
}

describe("ThemeProvider", () => {
  it("toggles between light and dark", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveTextContent(/light|dark/);

    const initialTheme = button.textContent;

    act(() => {
      button.click();
    });

    expect(button.textContent).not.toEqual(initialTheme);
  });
});
