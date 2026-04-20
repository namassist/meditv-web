import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ReadinessGate } from "./readiness-gate";

it("runs the unlock callback when the kiosk button is pressed", async () => {
  const user = userEvent.setup();
  const onUnlock = vi.fn().mockResolvedValue(undefined);

  render(
    <ReadinessGate
      capabilities={{
        audio: { label: "Audio", status: "ready-to-request" },
        fullscreen: { label: "Fullscreen", status: "ready-to-request" },
        notifications: { label: "Notifications", status: "unsupported" },
      }}
      onUnlock={onUnlock}
      isBusy={false}
    />,
  );

  await user.click(
    screen.getByRole("button", { name: /aktifkan mode kiosk/i }),
  );
  expect(onUnlock).toHaveBeenCalledTimes(1);
});
