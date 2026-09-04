import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/Contact";
import { smsConsentDisclosureVersion } from "@/lib/lead";

vi.mock("@/components/ConsentAndAnalytics", () => ({
  hasMarketingConsent: () => false,
}));

function fillForm({ consent = false }: { consent?: boolean } = {}) {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Work email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Mobile phone"), {
    target: { value: "+44 20 7946 0958" },
  });
  fireEvent.change(
    screen.getByLabelText("How soon would you like to launch?"),
    { target: { value: "1-3 months" } },
  );
  if (consent) fireEvent.click(screen.getByRole("checkbox"));
}

describe("Contact", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders an accessible, responsive, unchecked phone and SMS consent UI in both modes", () => {
    render(<Contact locale="en" />);
    const phone = screen.getByLabelText("Mobile phone");
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");
    expect(phone).toHaveAccessibleDescription(/country code/i);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(screen.getByText(/Reply STOP to opt out/)).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Inquiry form" })).toHaveClass(
      "max-w-xl",
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Not ready for a call/i }),
    );
    expect(
      screen.getByRole("heading", { name: /launch-readiness overview/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mobile phone")).toBeRequired();
  });

  it("submits the overview payload with explicit false consent and keeps its distinct success behavior", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ submitted: true }), { status: 200 }),
      );
    render(<Contact locale="en" />);
    fireEvent.click(
      screen.getByRole("button", { name: /Not ready for a call/i }),
    );
    fillForm();
    fireEvent.submit(screen.getByRole("form", { name: "Inquiry form" }));
    await screen.findByRole("status");
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      phone: "+44 20 7946 0958",
      smsConsent: false,
      inquiryType: "overview",
      smsConsentDisclosureVersion,
    });
    expect(screen.getByText(/We will be in touch/)).toBeInTheDocument();
  });

  it("submits true consent for the strategy-call mode without putting phone in analytics", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({ calendarUrl: "https://calendly.com/pryzr/event" }),
          { status: 200 },
        ),
      );
    render(<Contact locale="en" />);
    fillForm({ consent: true });
    fireEvent.submit(screen.getByRole("form", { name: "Inquiry form" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.smsConsent).toBe(true);
    expect(body.inquiryType).toBe("call");
    expect(body.phone).toBe("+44 20 7946 0958");
  });

  it("renders complete Spanish phone, consent, and validation guidance", () => {
    render(<Contact locale="es" />);
    expect(screen.getByLabelText("Teléfono móvil")).toHaveAccessibleDescription(
      /código de país/i,
    );
    expect(screen.getByText(/mensajes de texto de Pryzr/)).toHaveTextContent(
      /STOP/,
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
