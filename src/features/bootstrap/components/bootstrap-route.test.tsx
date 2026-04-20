import { render, waitFor } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { BootstrapRoute } from "./bootstrap-route";

it("routes to /screen when restore succeeds", async () => {
  const replace = vi.fn();
  render(
    <BootstrapRoute
      restore={vi.fn().mockResolvedValue({ status: "restored" })}
      replace={replace}
    />,
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/screen"));
});
