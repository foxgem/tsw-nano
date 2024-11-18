"use client";

import { useEffect, useState } from "react";
import type { Command } from "~utils/types";
import styles from "../css/promptselect.module.css";
import { loadCommandsFromStorage } from "~utils/commons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Props {
  category: string;
  onSelect: (action: Command) => void;
}
export default function SystemPromptMenu({ category, onSelect }: Props) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>();
  useEffect(() => {
    const loadCommands = async () => {
      const commands = await loadCommandsFromStorage(category);
      setCommands(commands);
      setCurrentCommand(commands[0].name);
      console.log(commands);
    };

    loadCommands();
  }, [category]);

  const handleselectItemClick = (selectItem: string) => {
    console.log("con---", selectItem);
    setCurrentCommand(selectItem);

    const selectedCommand = commands.find((cmd) => cmd.name === selectItem);
    if (selectedCommand) {
      onSelect(selectedCommand);
    }
  };

  return (
    <div className={styles.tswMenuContainer}>
      {currentCommand && (
        <Select
          value={currentCommand}
          onValueChange={(value) => handleselectItemClick(value)}
        >
          <SelectTrigger className={styles.tswTriggerButton}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={styles.tswPromptList}>
            {commands.map((option) => (
              <SelectItem
                key={option.name}
                value={option.name}
                className={styles.tswPromptItem}
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={styles.tswTriggerButton}>
            System Prompt <ActionIcon name="Dropdown" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={styles.tswPromptList}>
          {commands.map((command) => (
            <DropdownselectItem
              key={command.name}
              className={styles.tswPromptItem}
            >
              <Button onClick={() => handleselectItemClick(command)}>
                {command.name}
              </Button>
            </DropdownselectItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu> */}
    </div>
  );
}
