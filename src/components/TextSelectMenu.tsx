"use client";

import { useEffect, useState } from "react";
import { ActionIcon } from "~/components/ActionIcon";
import { Button } from "~/components/ui/button";
import commontyles from "~/css/common.module.css";
import { cn, loadCommandsFromStorage } from "~utils/commons";
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
  onSelect: (action: Command) => void;
  onTranslate: () => void;
}
export default function TextSelectionMenu({
  category,
  selectedText,
  onSelect,
  position,
  onTranslate,
}: Props) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const loadCommands = async () => {
      const commands = await loadCommandsFromStorage(category);
      setCommands(commands);
    };

    loadCommands();
  }, [category]);

  const handleMenuItemClick = (menuItem: Command) => {
    onSelect(menuItem);
  };

  const handleTranslateClick = () => {
    onTranslate();
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
      <Button
        variant="ghost"
        size="icon"
        className={commontyles.tswActionBtn}
        onClick={handleTranslateClick}
      >
        <ActionIcon name="Translate" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(commontyles.tswActionBtn, styles.tswTriggerButton)}
          >
            <ActionIcon name="Menu" />
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
