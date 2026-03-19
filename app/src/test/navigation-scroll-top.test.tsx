import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";

const NavigationHarness = () => (
  <MemoryRouter initialEntries={["/"]}>
    <ScrollToTop />
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/privacidad#transferencia">Privacidad con ancla</Link>
          </div>
        }
      />
      <Route path="/privacidad" element={<h1>Aviso de Privacidad</h1>} />
    </Routes>
  </MemoryRouter>
);

describe("HU-5.5 scroll restoration", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    vi.clearAllMocks();
  });

  it("scrolls to top on route change without hash", () => {
    render(<NavigationHarness />);

    const scrollSpy = vi.mocked(window.scrollTo);
    scrollSpy.mockClear();

    fireEvent.click(screen.getByRole("link", { name: "Privacidad" }));

    expect(screen.getByRole("heading", { name: "Aviso de Privacidad" })).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("does not force scroll reset on hash navigation", () => {
    render(<NavigationHarness />);

    const scrollSpy = vi.mocked(window.scrollTo);
    scrollSpy.mockClear();

    fireEvent.click(screen.getByRole("link", { name: "Privacidad con ancla" }));

    expect(screen.getByRole("heading", { name: "Aviso de Privacidad" })).toBeInTheDocument();
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
