import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Privacidad from "@/pages/Privacidad";
import Nosotros from "@/pages/Nosotros";

describe("HU-5.4 legal branding copy", () => {
  it("renders updated legal name in privacy notice", () => {
    render(<Privacidad />);

    expect(
      screen.getByText("SUMINISTROS INDUSTRIALES DE SEGURIDAD PRIVADA SIS, S.A. DE C.V."),
    ).toBeInTheDocument();
  });

  it("renders updated opening sentence in about page", () => {
    render(<Nosotros />);

    expect(
      screen.getByText(
        /Suministros Industriales de Seguridad Privada SIS, S\.A\. de C\.V\. es una comercializadora especializada/i,
      ),
    ).toBeInTheDocument();
  });
});
