import type { ICommandPort } from '@packages/ports'
import type { CommandDefinition } from '@packages/types'
import type { Command, Modifier, Plugin } from 'obsidian'

export class ObsidianCommandAdapter implements ICommandPort {
  private readonly plugin: Plugin

  constructor(plugin: Plugin) {
    this.plugin = plugin
  }

  registerCommand(command: CommandDefinition): void {
    const obsidianCommand: Command = {
      id: command.id,
      name: command.name,
    }

    if (command.callback) {
      obsidianCommand.callback = command.callback
    }

    if (command.checkCallback) {
      obsidianCommand.checkCallback = command.checkCallback
    }

    if (command.hotkeys) {
      obsidianCommand.hotkeys = command.hotkeys.map((h) => ({
        modifiers: [...h.modifiers] as Modifier[],
        key: h.key,
      }))
    }

    this.plugin.addCommand(obsidianCommand)
  }
}
