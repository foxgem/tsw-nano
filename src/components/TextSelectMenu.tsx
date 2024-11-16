"use client";

import { useState, useEffect } from "react";
import { ActionIcon } from "~/components/ActionIcon";
import { Button } from "~/components/ui/button";
import type { Command } from "~utils/types";
import styles from "../css/textselect.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Props {
  category: string;
  selectedText: string;
  position: { x: number; y: number };
  onSelect?: (action: Command) => void;
}
export default function TextSelectionMenu({
  category,
  selectedText,
  onSelect,
  position,
}: Props) {
  const [open, setOpen] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const loadCommands = async () => {
      try {
        const result = await chrome.storage.local.get(category);
        if (result[category]) {
          setCommands(result[category]);
        }
      } catch (error) {
        console.error("Error loading commands:", error);
      }
    };

    loadCommands();
  }, [category]);

  const handleMenuItemClick = (menuItem: Command) => {
    onSelect(menuItem);
  };

  if (!selectedText) return null;

  return (
    <div
      className={styles.tswMenuContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={styles.tswTriggerButton}>
            Quick Action <ActionIcon name="Menu" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={styles.tswActionList}
          side="bottom"
          align="start"
          sideOffset={5}
          alignOffset={-5}
        >
          {commands.map((command) => (
            <DropdownMenuItem
              key={command.name}
              className={styles.tswActionItem}
            >
              <Button onClick={() => handleMenuItemClick(command)}>
                {" "}
                {command.name}
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
