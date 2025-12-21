import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { mergeMarkdown } from './generate_markdown'

const program = new Command()

console.log(chalk.green.bold('\n欢迎使用 Markdown 工具箱 CLI！\n'))
console.log(
  chalk.yellow('工具说明：') +
    '\n' +
    chalk.cyan('1. 合并 Markdown 文件：') +
    chalk.gray('将多个 Markdown 文件合并为一个。') +
    '\n' +
    chalk.cyan('2. 工具2：') +
    chalk.gray('这里是工具2的功能描述。') +
    '\n' +
    chalk.cyan('3. 退出：') +
    chalk.gray('退出程序。') +
    '\n'
)
program.name('md-merge').description('合并多个 Markdown 文件').version('1.0.0')

program.action(async () => {
  const { tool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'tool',
      message: '请选择要使用的工具：',
      choices: [
        { name: '1. 合并 Markdown 文件', value: '1' },
        { name: '2. 工具2', value: '2' },
        { name: '3. 退出', value: '3' },
      ],
    },
  ])
  if (tool === '1') {
    await mergeMarkdown()
  } else if (tool === '2') {
  } else if (tool === '3') {
    console.log(chalk.yellow.bold('\n谢谢使用 Markdown 工具箱 CLI！\n'))
    process.exit(0)
  }
})

program.parseAsync(process.argv)
