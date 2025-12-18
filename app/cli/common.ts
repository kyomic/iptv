import inquirer from 'inquirer'
import * as fs from 'fs'
import * as path from 'path'
import { ChannelGroup, Group, Channel } from './types'

/**
 * 提示用户是否继续执行
 * @param message 提示信息，默认值为 '是否继续？'
 * @returns Promise<boolean> 类型，用户是否选择继续执行
 */
export const isManualContinue = async (message: string = '是否继续？') => {
  const { goOn: continueMerge } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'goOn',
      message: message,
      default: false,
    },
  ])
  return continueMerge
}

/**
 * 生成手动继续执行函数
 * @param execute 执行函数，返回 Promise<any> 类型
 * @param message 提示信息，默认值为 '是否继续？'
 * @returns Promise<any> 类型，执行函数的返回值或手动继续执行的结果
 */
export const generate_manual_continue = async (
  execute: () => Promise<any>,
  message: string = '是否继续？'
) => {
  const result = await execute()
  if (result) {
    return result
  }
  const toContinue = await isManualContinue(message)
  if (!toContinue) {
    console.log('用户选择不继续，程序退出。')
    process.exit(0)
  } else {
    return await generate_manual_continue(execute, message)
  }
}

export function concatUrl(baseUrl: string, relativeUrl: string) {
  if (/https?:\/\//.test(relativeUrl)) {
    return relativeUrl
  }
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/'
  }
  if (relativeUrl.startsWith('/')) {
    relativeUrl = relativeUrl.slice(1)
  }
  return baseUrl + relativeUrl
}

/**
 * 生成数据
 * @param rootPath 根路径
 * @param config 配置项，包含 baseUrl 和 basePath
 * @returns 生成的数据数组
 */

export function generateData(
  rootPath: string,
  config = {
    baseUrl: '',
    basePath: '/data/assets/logo/',
  }
): Array<Group> {
  const groupDirPath = path.resolve(rootPath, 'group')
  const groupFiles = fs
    .readdirSync(groupDirPath)
    .filter(file => file.endsWith('.md'))
  const groupData: Array<Record<string, string>> = []
  const result: Array<Group> = []

  const cache: Record<string, Record<string, string>> = {}
  groupFiles.forEach(file => {
    const fileName = file.replace('.md', '')
    const filePath = path.resolve(groupDirPath, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const tableData = parseMarkdownTable(fileContent)

    if (!cache[fileName]) {
      cache[fileName] = {}
      result.push({
        group_data: [],
        group_name: fileName,
      })
    }

    let group = result.find(item => item['group_name'] === fileName)
    for (let i = 0; i < tableData.length; i++) {
      const groupName = tableData[i]['分组名称']
      const groupChannel = tableData[i]['频道']
      if (!groupName) {
        continue
      }
      let currentChannels = group['group_data'].find(
        item => item.name === groupName
      )
      if (!currentChannels) {
        currentChannels = {
          name: groupName,
          channels: [],
        }
        group['group_data'].push(currentChannels)
      }
      let channelMd = ''
      try {
        channelMd = fs.readFileSync(
          path.resolve(rootPath, 'channel', groupChannel + '.md'),
          'utf-8'
        )
      } catch (err) {
        console.log(`读取${groupChannel} 失败`, err)
      }
      const infos = parseMarkdownTable(channelMd)?.[0] || {}
      console.log('infos', infos)
      currentChannels.channels.push({
        name: groupChannel,
        logo: concatUrl(config.baseUrl + config.basePath, infos['LOGO'] || ''),
        alias: infos['别名'] || '',
      })
    }
  })
  console.log(JSON.stringify(result, null, 2))
  return result
}

/**
 * 解析 Markdown 表格字符串为数组对象
 * @param md Markdown 表格字符串
 * @returns
 */
export function parseMarkdownTable(md: string): Array<Record<string, string>> {
  const lines = md
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|'))
  if (lines.length < 2) return []

  // 解析表头 - 移除首尾的空元素，但保留中间的空单元格
  const headerParts = lines[0].split('|').map(h => h.trim())
  // 移除首尾空字符串（来自行首和行尾的 |）
  if (headerParts[0] === '') headerParts.shift()
  if (headerParts[headerParts.length - 1] === '') headerParts.pop()
  const headers = headerParts

  // 过滤掉分隔线
  const dataLines = lines.slice(2)

  // 解析数据行
  const result = dataLines.map(line => {
    const cellParts = line.split('|').map(cell => cell.trim())
    // 移除首尾空字符串（来自行首和行尾的 |）
    if (cellParts[0] === '') cellParts.shift()
    if (cellParts[cellParts.length - 1] === '') cellParts.pop()
    const cells = cellParts

    const obj: Record<string, string> = {}
    headers.forEach((header, idx) => {
      obj[header] = cells[idx] ?? ''
    })
    return obj
  })

  return result
}

/**
 * 生成分组的 Markdown 字符串
 * @param group 分组数据
 * @returns
 */
export function generateMarkdownWithGroup(group: ChannelGroup) {
  let md = `| 频道 | 别名 | LOGO |\n`
  md += `| --- | --- | --- |\n`
  let generateImage = (channel: Channel) => {
    return `<img src="${channel.logo}" height="50" alt="${channel.name} ">`
  }
  group.channels?.forEach(channel => {
    md += `| ${channel.name} | ${channel.alias || ''} | ${
      generateImage(channel) || ''
    } |\n`
  })
  md = md.replace(/\n$/, '') // 去除最后的换行符
  return md
}
