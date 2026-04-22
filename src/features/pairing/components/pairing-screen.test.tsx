import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PairingScreen } from "./pairing-screen";

it("submits the six-digit code and then navigates to /screen", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(
    <PairingScreen
      onSubmit={onSubmit}
      onUnlock={vi.fn()}
      capabilityState={{
        audio: { label: "Audio", status: "ready" },
      }}
    />,
  );
  await user.type(screen.getByLabelText(/digit 1 pair code/i), "123456");
  await user.click(screen.getByRole("button", { name: /pair device/i }));

  expect(onSubmit).toHaveBeenCalledWith("123456");
});
