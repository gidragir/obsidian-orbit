import { StatusService } from '@services/status-service'
import { Plugin } from 'obsidian'

export default class ExamplePlugin extends Plugin {
  private statusService: StatusService | null = null

  async onload(): Promise<void> {
    this.statusService = new StatusService(this.app)
    this.registerCommands()
  }

  private registerCommands(): void {
    this.addCommand({
      id: 'show-status',
      name: 'Show Status',
      callback: () => {
        if (!this.statusService) {
          return
        }
        console.log(this.statusService.createStatusSummary())
      },
    })
  }

  onunload(): void {
    this.statusService = null
  }
}
