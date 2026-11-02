import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("<Tabs />", () => {
  it("renders tabs and switches active content on click", async () => {
    render(
      <Tabs defaultValue="campus">
        <TabsList>
          <TabsTrigger value="campus">Campus</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
        </TabsList>
        <TabsContent value="campus">Campus Feed Content</TabsContent>
        <TabsContent value="friends">Friends Feed Content</TabsContent>
        <TabsContent value="clubs">Clubs Feed Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Campus Feed Content")).toBeInTheDocument();
    expect(screen.queryByText("Friends Feed Content")).not.toBeInTheDocument();

    const friendsTab = screen.getByRole("tab", { name: "Friends" });
    await userEvent.click(friendsTab);

    expect(screen.getByText("Friends Feed Content")).toBeInTheDocument();
    expect(screen.queryByText("Campus Feed Content")).not.toBeInTheDocument();
  });
});
