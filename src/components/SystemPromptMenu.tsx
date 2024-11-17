"use client";

import { useEffect, useState } from "react";
import { ActionIcon } from "~/components/ActionIcon";
import { Button } from "~/components/ui/button";
import type { Command } from "~utils/types";
import styles from "../css/promptselect.module.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { loadCommandsFromStorage } from "~utils/commons";

interface Props {
  category: string;
  onSelect: (action: Command) => void;
}
export default function SystemPromptMenu({ category, onSelect }: Props) {
  const [commands, setCommands] = useState<Command[]>([]);
  useEffect(() => {
    const loadCommands = async () => {
      const commands = await loadCommandsFromStorage(category);
      setCommands(commands);
    };

    loadCommands();
  }, [category]);

  const handleMenuItemClick = (menuItem: Command) => {
    console.log("con---", menuItem);
    onSelect(menuItem);
  };

  return (
    <div className={styles.tswMenuContainer}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={styles.tswTriggerButton}>
            System Prompt <ActionIcon name="Dropdown" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.tswPromptList}>
          {commands.map((command) => (
            <DropdownMenuItem
              key={command.name}
              className={styles.tswPromptItem}
            >
              <Button onClick={() => handleMenuItemClick(command)}>
                {command.name}
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
