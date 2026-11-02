import React from "react";
import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

describe("Diagnostics", () => {
  it("inspects Modal attributes", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title" description="Test Desc">
        <p>Body</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    console.log("Dialog attributes:", dialog.getAttributeNames().map(name => `${name}="${dialog.getAttribute(name)}"`).join(" "));
  });

  it("inspects Tabs attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Panel 1</TabsContent>
      </Tabs>
    );
    const tab1 = screen.getByRole("tab", { name: "Tab 1" });
    const tab2 = screen.getByRole("tab", { name: "Tab 2" });
    console.log("Tab 1 attributes:", tab1.getAttributeNames().map(name => `${name}="${tab1.getAttribute(name)}"`).join(" "));
    console.log("Tab 2 attributes:", tab2.getAttributeNames().map(name => `${name}="${tab2.getAttribute(name)}"`).join(" "));
  });
});
